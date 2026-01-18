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
    const { message, userId = 'default_elderly_user' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // First, analyze the emotion of the user's message
    const emotionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an emotion analyzer. Analyze the following message from an elderly person and respond with ONLY one of these emotion tags: happy, sad, neutral, pain_suspected, anxious
            
Rules:
- "happy" for positive, joyful, content messages
- "sad" for expressing loneliness, loss, or depression
- "neutral" for everyday statements without strong emotion
- "pain_suspected" if they mention any physical discomfort, aches, or not feeling well
- "anxious" for worry, stress, or nervousness

Respond with ONLY the emotion tag, nothing else.`
          },
          { role: "user", content: message }
        ],
      }),
    });

    let emotionTag = "neutral";
    if (emotionResponse.ok) {
      const emotionData = await emotionResponse.json();
      const rawEmotion = emotionData.choices?.[0]?.message?.content?.trim().toLowerCase();
      if (["happy", "sad", "neutral", "pain_suspected", "anxious"].includes(rawEmotion)) {
        emotionTag = rawEmotion;
      }
    }

    // Save the user message to database
    await supabase.from("conversations").insert({
      user_id: userId,
      role: "user",
      content: message,
      emotion_tag: emotionTag,
    });

    // Generate the puppy's response
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are "Buddy", a loving, caring AI puppy companion for elderly people. 

Your personality:
- Warm, friendly, and extremely supportive
- Use simple, easy-to-understand language
- Show genuine interest in their wellbeing
- Gently encourage healthy habits (eating well, staying active, taking medicine)
- Be empathetic and validate their feelings
- Use occasional puppy-like expressions naturally (like "woof!" sparingly)
- Ask follow-up questions to keep them engaged
- Keep responses concise (2-3 sentences max)
- If they mention pain or discomfort, express concern and gently suggest talking to their caregiver

Remember: You're their daily companion, here to check in on them and make them feel loved.`
          },
          { role: "user", content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const puppyResponse = aiData.choices?.[0]?.message?.content || "Woof! I'm here for you! 🐕";

    // Save the puppy's response to database
    await supabase.from("conversations").insert({
      user_id: userId,
      role: "puppy",
      content: puppyResponse,
    });

    return new Response(JSON.stringify({ 
      response: puppyResponse,
      emotionTag: emotionTag 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
