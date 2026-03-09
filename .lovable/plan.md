

# Plan: Remove Placeholders & Add Real Functionality

## Current Status Analysis

After reviewing the codebase, I've identified several areas that still use placeholder/dummy data or have incomplete implementations:

### 1. **Customer Acquisition Module** (High Priority)
- Currently shows only basic stats
- Has "coming soon" message for lead capture forms
- Missing campaign tracking features

### 2. **Newsletter Signup** (Landing Page)
- Only displays a toast notification
- Doesn't actually store email subscriptions
- No database table for newsletter subscribers

### 3. **Branch Management**
- Missing create/edit dialog for branches
- Can't add new branches through UI (delete only)

### 4. **Knowledge Base**
- Article creation marked as TODO
- Super Admin can't create/edit articles through UI

### 5. **Platform Integrations** (Settings)
- Simulates saving API credentials
- Doesn't actually persist to secrets or database
- Connection status is hardcoded/simulated

### 6. **Social Media Module**
- Account connection placeholder
- Post scheduling not implemented
- Analytics dashboard missing

### 7. **Call Centre**
- Agent management incomplete
- Live queue system needs implementation
- No actual call routing logic

---

## Proposed Implementation Plan

### Phase 1: Data Persistence & Forms (Core Functionality)

**1.1 Newsletter System**
- Create `newsletter_subscribers` table
- Add email validation & duplicate prevention
- Build unsubscribe mechanism
- Update NewsletterSignup component to persist data

**1.2 Branch Management**
- Create BranchDialog component (create/edit)
- Add manager assignment dropdown
- Implement full CRUD operations

**1.3 Knowledge Base Articles**
- Create ArticleDialog for Super Admin
- Rich text editor for content
- Category management
- Publish/unpublish workflow

**1.4 Platform Integrations (Real Implementation)**
- Remove simulation, use actual secrets storage
- Persist integration status in database
- Add credential testing/validation
- Update status badges to reflect real state

---

### Phase 2: Customer Acquisition Features

**2.1 Lead Capture Forms**
- Create embeddable form builder
- Generate unique form URLs
- Store form submissions
- Auto-create customers from submissions

**2.2 Campaign Tracking**
- UTM parameter tracking
- Landing page analytics
- Conversion funnel visualization
- Source attribution (social, ads, organic)

**2.3 Lead Scoring System**
- Define scoring rules
- Activity-based scoring
- Auto-tag hot leads
- Dashboard for high-value prospects

---

### Phase 3: Communications Enhancement

**3.1 Social Media Scheduler**
- Connect Facebook/Instagram/Twitter/LinkedIn
- Post composition with media upload
- Schedule posts with calendar view
- Analytics dashboard (reach, engagement)

**3.2 Call Centre Implementation**
- Agent assignment & status tracking
- Call queue management (priority, wait time)
- Real-time dashboard
- Call disposition tracking

**3.3 SMS Campaigns**
- Twilio integration for SMS
- Template management
- Bulk sending with personalization
- Delivery tracking

---

### Phase 4: Advanced Analytics

**4.1 Custom Reports Builder**
- Drag-and-drop report designer
- Chart type selection (bar, line, pie)
- Date range filters
- Export to PDF/Excel

**4.2 Dashboard Widgets**
- Customizable widget layout
- Real-time metric cards
- Goal tracking vs. actuals
- Comparison periods (MoM, YoY)

**4.3 Predictive Analytics**
- Revenue forecasting (AI-powered)
- Churn prediction
- Sales opportunity scoring
- Trend analysis

---

## Files to Create/Modify

### New Files (~15)
```
src/components/branches/BranchDialog.tsx
src/components/knowledge-base/ArticleDialog.tsx
src/components/acquisition/LeadCaptureFormBuilder.tsx
src/components/acquisition/CampaignTracker.tsx
src/components/acquisition/LeadScoringRules.tsx
src/components/social/PostScheduler.tsx
src/components/social/SocialAccountConnector.tsx
src/components/social/SocialAnalytics.tsx
src/components/call-centre/AgentManagement.tsx
src/components/call-centre/CallQueue.tsx
src/components/reports/ReportBuilder.tsx
src/components/reports/CustomWidget.tsx
src/hooks/useNewsletterSubscribers.ts
src/hooks/useSocialMedia.ts
src/hooks/useLeadCapture.ts
```

### Modify Existing
```
src/components/landing/NewsletterSignup.tsx
src/components/settings/IntegrationsTab.tsx
src/pages/CustomerAcquisition.tsx
src/pages/SocialMedia.tsx
src/pages/CallCentre.tsx
src/pages/KnowledgeBase.tsx
src/pages/Branches.tsx
src/pages/Analytics.tsx
```

### Database Migrations
```
newsletter_subscribers (email, source, subscribed_at, unsubscribed_at)
lead_capture_forms (name, fields, settings, embed_code)
form_submissions (form_id, data, source, created_at)
lead_scores (customer_id, score, last_updated)
social_accounts (platform, access_token, profile_data)
social_posts (account_id, content, scheduled_for, status)
campaign_tracking (campaign_name, utm_params, conversions)
call_agents (employee_id, status, extension)
call_queues (name, priority, max_wait_time)
```

---

## Implementation Order (Recommended)

1. **Newsletter & Branch Dialogs** (Quick wins, 1-2 hours)
2. **Knowledge Base Article Management** (Super Admin content, 2-3 hours)
3. **Platform Integrations Fix** (Real secrets, 2-3 hours)
4. **Lead Capture Forms** (Customer acquisition core, 4-5 hours)
5. **Social Media Scheduler** (Marketing automation, 5-6 hours)
6. **Call Centre Enhancement** (Agent + queue management, 4-5 hours)
7. **Advanced Analytics** (Reporting & insights, 6-8 hours)

**Total Estimated Time:** 24-32 hours of development

---

## Key Technical Decisions

1. **Newsletter Storage**: Create dedicated table vs. using existing customers table → **Dedicated table** (cleaner separation, GDPR compliance)

2. **Lead Forms**: Static forms vs. dynamic form builder → **Dynamic builder** (more flexible, reusable)

3. **Social Media**: Direct API vs. aggregator (Zapier/Buffer) → **Direct API** (better control, no 3rd party fees)

4. **Analytics**: Real-time vs. batch processing → **Hybrid** (real-time for dashboards, batch for reports)

5. **Secrets Management**: Use Lovable secrets tool vs. database encryption → **Lovable secrets** (already available, secure by default)

---

## What Gets Fixed

✅ All "coming soon" messages replaced with working features  
✅ Newsletter actually stores subscribers  
✅ Branch management has full CRUD  
✅ Knowledge Base articles manageable by Super Admin  
✅ Platform integrations use real credentials  
✅ Customer acquisition has lead capture & tracking  
✅ Social media scheduling & analytics functional  
✅ Call centre has agent & queue management  
✅ Analytics module has custom reports  

