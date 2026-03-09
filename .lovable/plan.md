
# Storing WhatsApp Test Credentials

I will help you store your WhatsApp API credentials securely so they can be used for testing the WhatsApp Automation module. Here is the approach:

### 1. Secure Credential Storage
Instead of hardcoding your tokens or saving them as plain text in the database, I will use Lovable's secure **Secrets Manager**. Once you approve this plan, I will prompt you to enter the following test credentials:
- `WHATSAPP_API_KEY` (Your temporary or permanent access token)
- `WHATSAPP_PHONE_ID` (Your Phone Number ID)

These will be stored securely as environment variables for your Supabase Edge Functions (`send-whatsapp` and `whatsapp-auto-reply`).

### 2. Update the Integrations UI
I will modify `src/components/settings/IntegrationsTab.tsx` to:
- Actively save the connection state (e.g., `whatsapp_configured: true`) into the platform's central `companies` settings record when you configure it.
- Remove the "simulated" toast message so it reflects a real database update.
- Ensure the connection status badge reflects the actual configuration stored in your database.

**Approve this plan** and I will immediately prompt you to enter your API credentials and implement the UI changes!
