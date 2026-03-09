

# Phase 3: Landing Website + WhatsApp Business Automation

This is a large scope. I'll break it into two workstreams implemented sequentially.

---

## Workstream A: Marketing Landing Website

### Approach
- Root `/` becomes the public landing page (instead of redirecting to `/dashboard`)
- All marketing pages are public routes (no auth required)
- `/auth` remains for login/signup
- Existing protected app routes stay unchanged

### New Pages to Create

| Route | Page |
|-------|------|
| `/` | Home (hero, features, pricing, testimonials, CTA) |
| `/features` | Feature highlights with detailed cards |
| `/pricing` | 3-tier pricing (Starter, Growth, Pro) |
| `/demo` | Product demo with video embed + CTA |
| `/integrations` | Integration logos and descriptions |
| `/testimonials` | Customer success stories |
| `/blog` | Blog listing (static for now) |
| `/docs` | Documentation / Help Center (links to Knowledge Base) |
| `/faq` | FAQ accordion page |
| `/about` | About Us with mission/team |
| `/contact` | Contact form |
| `/affiliates` | Affiliate program details |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |

### Shared Landing Components
- `src/components/landing/Navbar.tsx` - Marketing nav with Login/Sign Up CTAs
- `src/components/landing/Footer.tsx` - Legal links, newsletter signup
- `src/components/landing/LandingLayout.tsx` - Wraps all public pages
- `src/components/landing/HeroSection.tsx` - Gradient hero with CTA buttons
- `src/components/landing/FeatureGrid.tsx` - Feature cards
- `src/components/landing/PricingCards.tsx` - 3-tier pricing
- `src/components/landing/TestimonialCarousel.tsx` - Customer quotes
- `src/components/landing/IntegrationLogos.tsx` - Partner/integration icons
- `src/components/landing/NewsletterSignup.tsx` - Email capture form
- `src/components/landing/CTASection.tsx` - "Start Free Trial" / "Book Demo"

### Home Page Sections
1. Hero with "Start Free Trial" + "Book Demo" CTAs
2. Product overview with screenshots
3. Feature highlights (6 cards)
4. AI automation benefits
5. Integration logos (WhatsApp, Resend, Twilio, etc.)
6. Customer testimonials
7. Pricing plans preview
8. Newsletter signup
9. Footer

### Router Changes
- `/` renders `LandingHome` (public)
- `/dashboard` remains the post-login landing
- All marketing routes wrapped in `LandingLayout`
- All app routes remain in `AppLayout` with `ProtectedRoute`

---

## Workstream B: WhatsApp Business Automation Module

### Database Changes (Migration)

New tables:

**`whatsapp_conversations`**
- `id`, `company_id`, `customer_id`, `contact_name`, `contact_phone`, `status` (open/closed/archived), `assigned_to`, `tags` (text[]), `last_message_at`, `unread_count`, `created_at`

**`whatsapp_messages`**
- `id`, `conversation_id`, `company_id`, `direction` (inbound/outbound), `content`, `message_type` (text/image/catalog), `status` (sent/delivered/read/failed), `sent_at`, `created_at`

**`whatsapp_templates`**
- `id`, `company_id`, `name`, `content`, `category` (welcome/faq/product/order), `created_by`, `created_at`

**`whatsapp_auto_rules`**
- `id`, `company_id`, `trigger_keywords` (text[]), `response_template_id`, `is_active`, `created_at`

**`product_catalog`**
- `id`, `company_id`, `name`, `description`, `price`, `image_url`, `availability`, `category`, `created_at`

**`whatsapp_orders`**
- `id`, `company_id`, `conversation_id`, `customer_name`, `product_items` (jsonb), `delivery_location`, `payment_status`, `status`, `created_at`

**`whatsapp_broadcasts`**
- `id`, `company_id`, `name`, `message`, `target_tags` (text[]), `sent_count`, `delivered_count`, `read_count`, `reply_count`, `status`, `scheduled_at`, `created_at`

RLS policies: company-scoped read for all users, staff+ can manage, super_admin can view all. Enable realtime on conversations and messages tables.

### WhatsApp Page Redesign

Replace current basic chat with a tabbed module:

**Tabs:**
1. **Inbox** - Conversation list + chat panel (existing but enhanced)
2. **Broadcasts** - Campaign creation, audience targeting by tags, analytics
3. **Auto-Replies** - Rule builder (keyword triggers → template responses)
4. **Templates** - Quick reply template management
5. **Product Catalog** - Upload/manage products
6. **Orders** - Orders collected via WhatsApp
7. **Analytics** - Messages received, response time, conversion rate, orders

### Key Components
- `src/components/whatsapp/ConversationInbox.tsx` - Main inbox with conversation list, contact panel, message history
- `src/components/whatsapp/MessageComposer.tsx` - Message input with template insertion
- `src/components/whatsapp/ConversationActions.tsx` - Reply, assign, tag, convert to lead, close
- `src/components/whatsapp/BroadcastManager.tsx` - Create/schedule broadcasts with tag targeting
- `src/components/whatsapp/AutoReplyRules.tsx` - Rule builder UI
- `src/components/whatsapp/TemplateManager.tsx` - CRUD for templates
- `src/components/whatsapp/ProductCatalogManager.tsx` - Product CRUD with images
- `src/components/whatsapp/OrderList.tsx` - Orders from WhatsApp
- `src/components/whatsapp/WhatsAppAnalytics.tsx` - Dashboard metrics
- `src/components/whatsapp/ConnectWhatsApp.tsx` - Connection status + setup wizard

### AI Auto-Reply Edge Function

New edge function `supabase/functions/whatsapp-auto-reply/index.ts`:
- Receives incoming message content
- Checks auto-reply rules (keyword matching)
- Falls back to AI (Lovable AI gateway) for intelligent responses
- Supports configurable tone (friendly/professional/sales-focused)
- Returns product catalog info when products are asked about

### CRM Integration
- New conversations auto-create CRM contacts if phone not found
- Conversation history stored and linked to customer record
- Tags sync between WhatsApp and CRM

### Permissions
- **Admin**: Full control (all tabs, settings, broadcasts)
- **Staff**: Reply to conversations, manage assigned leads
- **Super Admin**: Monitor across all organizations

---

## Implementation Order

1. **Landing website** - Create all marketing pages + components + routing
2. **WhatsApp DB migration** - Create all new tables with RLS
3. **WhatsApp inbox redesign** - Conversation management with DB persistence
4. **Auto-reply system** - Edge function + rule builder UI
5. **Product catalog + orders** - CRUD + order collection flow
6. **Broadcasts** - Campaign creation with tag targeting
7. **Analytics dashboard** - WhatsApp-specific metrics

---

## Files to Create (~25 new files)

```text
src/components/landing/Navbar.tsx
src/components/landing/Footer.tsx
src/components/landing/LandingLayout.tsx
src/components/landing/HeroSection.tsx
src/components/landing/FeatureGrid.tsx
src/components/landing/PricingCards.tsx
src/components/landing/TestimonialCarousel.tsx
src/components/landing/IntegrationLogos.tsx
src/components/landing/NewsletterSignup.tsx
src/components/landing/CTASection.tsx
src/pages/landing/LandingHome.tsx
src/pages/landing/Features.tsx
src/pages/landing/Pricing.tsx
src/pages/landing/Demo.tsx
src/pages/landing/Integrations.tsx
src/pages/landing/Testimonials.tsx
src/pages/landing/Blog.tsx
src/pages/landing/Docs.tsx
src/pages/landing/FAQ.tsx
src/pages/landing/About.tsx
src/pages/landing/Contact.tsx
src/pages/landing/Affiliates.tsx
src/pages/landing/Terms.tsx
src/pages/landing/Privacy.tsx
src/components/whatsapp/ConversationInbox.tsx
src/components/whatsapp/BroadcastManager.tsx
src/components/whatsapp/AutoReplyRules.tsx
src/components/whatsapp/TemplateManager.tsx
src/components/whatsapp/ProductCatalogManager.tsx
src/components/whatsapp/OrderList.tsx
src/components/whatsapp/WhatsAppAnalytics.tsx
src/components/whatsapp/ConnectWhatsApp.tsx
src/hooks/useWhatsApp.ts
supabase/functions/whatsapp-auto-reply/index.ts
```

## Files to Modify
```text
src/App.tsx - Add all public landing routes + WhatsApp sub-routes
src/pages/WhatsApp.tsx - Complete rebuild with tabbed module
src/hooks/useCustomers.ts - Auto-create from WhatsApp contacts
```

