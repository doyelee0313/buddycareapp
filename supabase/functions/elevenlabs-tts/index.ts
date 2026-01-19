import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Sarah voice by default - warm and friendly
    // Other good options: Matilda (XrExE9yKIg1WjnnlVkGX), Alice (Xb7hH8MSUJpSbSDYk0k2)
    const selectedVoiceId = voiceId || "EXAVITQu4vr4xnSDxMaL"; // Sarah - friendly and warm

    console.log(`Generating TTS for text: "${text.substring(0, 50)}..." with voice: ${selectedVoiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5", // Fast, high quality
          voice_settings: {
            stability: 0.5, // Balanced for natural variation
            similarity_boost: 0.75,
            style: 0.4, // Slightly expressive for friendliness
            use_speaker_boost: true,
            speed: 0.9, // Slightly slower for elderly users
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      
      // Return specific error for quota exceeded so frontend can fallback gracefully
      if (response.status === 401 && errorText.includes("quota_exceeded")) {
        return new Response(
          JSON.stringify({ error: "quota_exceeded", fallback: true }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "tts_unavailable", fallback: true }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    console.log(`Successfully generated ${audioBuffer.byteLength} bytes of audio`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
