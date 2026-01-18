import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversations, elderlyName, date, elderlyUserId } = await req.json();

    if (!conversations || conversations.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: "No conversations on this day.", 
          hasConcern: false,
          concernReason: null 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format conversations for the AI
    const conversationText = conversations
      .map((c: { role: string; content: string; created_at: string }) => 
        `[${c.role}]: ${c.content}`
      )
      .join("\n");

    const systemPrompt = `You are analyzing daily conversations between an elderly person named "${elderlyName}" and their AI companion named Buddy.

Your task is to:
1. Create a brief 2-3 sentence summary of the key topics discussed, the elderly person's mood, and any notable events or activities mentioned.

2. Detect if there are GENUINE concerns that a caregiver should be alerted about:
   - Physical pain, health issues, or symptoms (e.g., "my chest hurts", "I can't walk well today")
   - Genuine expressions of loneliness or depression (e.g., "nobody visits me anymore", "I feel so alone")
   - Falls, accidents, or emergencies
   - Thoughts about death or self-harm
   - Significant mood changes or signs of distress
   - Confusion or memory issues

CRITICAL: You must understand CONTEXT. Do NOT flag:
- Casual mentions (e.g., "I'm not alone, the dog is here" should NOT be flagged for loneliness)
- Negations (e.g., "I don't have any pain" should NOT be flagged for pain)
- Past tense issues that are resolved (e.g., "I was tired yesterday but I'm fine now")
- Positive statements that happen to contain keywords (e.g., "I alone made this cake!" is positive)

Respond in JSON format:
{
  "summary": "Brief 2-3 sentence summary",
  "hasConcern": true/false,
  "concernReason": "If hasConcern is true, explain the specific concern. Otherwise null"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here are today's conversations:\n\n${conversationText}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      parsed = {
        summary: content.substring(0, 200),
        hasConcern: false,
        concernReason: null
      };
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey && elderlyUserId && date) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Upsert the summary
      const { error: upsertError } = await supabase
        .from("daily_summaries")
        .upsert({
          user_id: elderlyUserId,
          summary_date: date,
          summary: parsed.summary,
          has_concern: parsed.hasConcern || false,
          concern_reason: parsed.concernReason || null,
        }, { onConflict: "user_id,summary_date" });

      if (upsertError) {
        console.error("Error saving summary:", upsertError);
      }
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Summarization error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
