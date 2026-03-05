import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, company_id, conversation_id, tone = "friendly" } = await req.json();

    if (!message || !company_id) {
      return new Response(JSON.stringify({ error: "Missing message or company_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Check auto-reply rules (keyword matching)
    const { data: rules } = await supabase
      .from("whatsapp_auto_rules")
      .select("*, whatsapp_templates(content)")
      .eq("company_id", company_id)
      .eq("is_active", true);

    const lowerMessage = message.toLowerCase();

    for (const rule of rules || []) {
      const keywords = rule.trigger_keywords || [];
      const matched = keywords.some((k: string) => lowerMessage.includes(k.toLowerCase()));
      if (matched && rule.whatsapp_templates?.content) {
        return new Response(JSON.stringify({
          reply: rule.whatsapp_templates.content,
          source: "auto_rule",
          rule_id: rule.id,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Step 2: Check if asking about products
    const productKeywords = ["product", "price", "how much", "cost", "menu", "catalog", "available", "buy", "order"];
    const isProductQuery = productKeywords.some((k) => lowerMessage.includes(k));

    let productContext = "";
    if (isProductQuery) {
      const { data: products } = await supabase
        .from("product_catalog")
        .select("name, description, price, availability, category")
        .eq("company_id", company_id)
        .eq("availability", true);

      if (products && products.length > 0) {
        productContext = "\n\nAvailable products:\n" +
          products.map((p) => `- ${p.name}: ₦${Number(p.price).toLocaleString()}${p.description ? ` — ${p.description}` : ""}`).join("\n");
      }
    }

    // Step 3: Fall back to AI
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        reply: "Thank you for your message! A team member will respond shortly.",
        source: "fallback",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneInstructions: Record<string, string> = {
      friendly: "Be warm, casual, and helpful. Use emojis occasionally.",
      professional: "Be polite, concise, and business-like.",
      "sales-focused": "Be persuasive, highlight benefits, and guide toward a purchase.",
    };

    const systemPrompt = `You are a helpful WhatsApp business assistant. ${toneInstructions[tone] || toneInstructions.friendly}
Respond in a conversational WhatsApp style — keep it brief (1-3 sentences).
If the customer asks about products, use the product catalog info provided.
If you don't know the answer, politely say a team member will follow up.${productContext}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({
        reply: "Thank you for your message! A team member will respond shortly.",
        source: "fallback",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Thank you for your message! A team member will respond shortly.";

    // Optionally store the AI reply as a message
    if (conversation_id) {
      await supabase.from("whatsapp_messages").insert({
        conversation_id,
        company_id,
        direction: "outbound",
        content: reply,
        message_type: "text",
        status: "sent",
      });
      await supabase.from("whatsapp_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation_id);
    }

    return new Response(JSON.stringify({
      reply,
      source: "ai",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("whatsapp-auto-reply error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
