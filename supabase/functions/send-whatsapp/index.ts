import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WhatsAppRequest {
  campaignId: string;
  recipients: Array<{ phone: string; name: string }>;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { campaignId, recipients, message }: WhatsAppRequest = await req.json();

    // Validate request
    if (!campaignId || !recipients?.length || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if WhatsApp is configured
    if (!whatsappApiKey || !whatsappPhoneId) {
      // Simulate sending for demo purposes
      console.log("WhatsApp API not configured, simulating send...");
      
      // Update campaign status and count
      await supabase
        .from("campaigns")
        .update({
          status: "completed",
          sent_count: recipients.length,
        })
        .eq("id", campaignId);

      return new Response(
        JSON.stringify({
          success: true,
          sentCount: recipients.length,
          totalRecipients: recipients.length,
          simulated: true,
          message: "WhatsApp API credentials not configured. Messages simulated for demo.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Real WhatsApp sending via Meta Business API
    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        // Personalize message
        const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name || "there");
        
        // Clean phone number
        const cleanPhone = recipient.phone.replace(/\D/g, "");
        
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${whatsappApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: cleanPhone,
              type: "text",
              text: { body: personalizedMessage },
            }),
          }
        );

        if (response.ok) {
          sentCount++;
        } else {
          const errorData = await response.json();
          errors.push(`Failed to send to ${recipient.phone}: ${JSON.stringify(errorData)}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error sending to ${recipient.phone}: ${errorMessage}`);
      }
    }

    // Update campaign status and count
    await supabase
      .from("campaigns")
      .update({
        status: sentCount > 0 ? "completed" : "paused",
        sent_count: sentCount,
      })
      .eq("id", campaignId);

    console.log(`WhatsApp campaign ${campaignId}: Sent ${sentCount}/${recipients.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        totalRecipients: recipients.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-whatsapp function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
