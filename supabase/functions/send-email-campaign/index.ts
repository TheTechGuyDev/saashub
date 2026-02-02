import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendCampaignRequest {
  campaignId: string;
  recipients: { email: string; name: string }[];
  subject: string;
  content: string;
  fromName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId, recipients, subject, content, fromName = "SaasHub" }: SendCampaignRequest = await req.json();

    console.log(`Starting email campaign ${campaignId} to ${recipients.length} recipients`);

    // Validate required fields
    if (!campaignId || !recipients || !subject || !content) {
      throw new Error("Missing required fields: campaignId, recipients, subject, content");
    }

    if (recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    // Send emails to each recipient
    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        // Personalize content with recipient name
        const personalizedContent = content
          .replace(/\{\{name\}\}/g, recipient.name || "Valued Customer")
          .replace(/\{\{email\}\}/g, recipient.email);

        // Create HTML email with basic styling
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${fromName}</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              ${personalizedContent.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '').join('')}
            </div>
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>Sent via SaasHub Email Marketing</p>
              <p>If you no longer wish to receive these emails, please contact us.</p>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: `${fromName} <onboarding@resend.dev>`,
          to: [recipient.email],
          subject: subject,
          html: htmlContent,
        });

        if (emailResponse.error) {
          console.error(`Failed to send to ${recipient.email}:`, emailResponse.error);
          errors.push(`${recipient.email}: ${emailResponse.error.message}`);
        } else {
          console.log(`Email sent to ${recipient.email}`);
          sentCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`Error sending to ${recipient.email}:`, error);
        errors.push(`${recipient.email}: ${error.message}`);
      }
    }

    // Update campaign stats in database
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        sent_count: sentCount,
        status: sentCount > 0 ? "completed" : "paused",
      })
      .eq("id", campaignId);

    if (updateError) {
      console.error("Error updating campaign stats:", updateError);
    }

    console.log(`Campaign ${campaignId} completed: ${sentCount}/${recipients.length} emails sent`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        totalRecipients: recipients.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email-campaign function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
