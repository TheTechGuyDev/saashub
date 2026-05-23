
## Overview

Five independent enhancements scoped to the staff/admin experience. Backend changes are minimal — most logic reuses existing tables and RLS. One new table (`role_permissions`) and one new edge function (`reset-staff-password`) are required.

---

## 1. Advanced filters on Staff Logs

**File:** `src/pages/StaffLogs.tsx`

Add to the existing filter bar:
- **Date range picker** (from / to) using shadcn Calendar in a Popover
- **Linked entity filter**: dropdown `All / Tasks / Customers / Projects` filtering by `entity_type`
- **Status / outcome filter**: dropdown driven by distinct `metadata.status` values present in results

Instant updates: filters are already client-side state; results recompute via `useMemo` on every keystroke. Add Supabase Realtime subscription on `staff_activities` (scoped to `company_id`) so new activities appear without a refresh.

No DB changes.

---

## 2. Permission matrix UI

**New table** `role_permissions`:
- `company_id uuid`, `role app_role`, `module text`, `can_view bool`, `can_create bool`, `can_edit bool`, `can_delete bool`
- Unique `(company_id, role, module)`
- RLS: company admins manage own company; everyone in company can read

**New helper RPC** `has_permission(_user_id, _module, _action)` — returns true if any of the user's roles grants the action, with sensible defaults (super_admin = all, company_admin = all, staff = view+edit on their modules, user = view only) when no row exists.

**New UI** `src/components/settings/PermissionsTab.tsx` (added as a tab in `Settings.tsx`, visible only to `company_admin` / `super_admin`):
- Grid: rows = modules (CRM, Projects, Documents, Calendar, Knowledge Base, WhatsApp, Call Logs), columns = roles (company_admin, staff, user) × actions (view/create/edit/delete)
- Checkboxes saved via upsert into `role_permissions`
- Reset-to-defaults button

**New hook** `src/hooks/usePermissions.ts` exposing `can(module, action)` used to gate buttons across the app (incremental adoption — start with Projects "New Project" and CRM "Add Customer" already gated; replace `isAdmin()` calls with `can(...)` over time).

---

## 3. My Customer detail page

**New page** `src/pages/MyCustomerDetail.tsx`, route `/my-customers/:id`
- Header: name, company, status badge, pipeline stage, value
- Tabs:
  - **Overview** — contact info, tags, notes (editable inline, writes to `customers.notes`)
  - **Timeline** — `customer_activities` for this customer, newest first
  - **Calls** — `call_logs` filtered by `customer_id`
  - **WhatsApp** — `whatsapp_conversations` filtered by `customer_id` (read-only preview, link to inbox)
- Add note form → inserts into `customer_activities` (`type: 'note'`)

Linked from `StaffDashboard.tsx` "My Customers" card (each row becomes a link) and from `CRM.tsx` "My Customers" tab.

No DB changes.

---

## 4. Task updates from staff dashboard

**File:** `src/components/dashboard/StaffDashboard.tsx`

In the "My Tasks" list, each item becomes interactive:
- Status `Select` (todo / in_progress / done) — updates `tasks.status` (+ `completed_at` when done)
- "Add note" popover → appends to `tasks.description` with timestamp + author, OR (preferred) writes to `staff_activities` with `entity_type='task'`, `entity_id=task.id`, `activity_type='task_note'`
- Each status change logs a `staff_activities` row (`activity_type='task_status_change'`)

Reuses existing `Staff can manage company tasks` RLS — no DB changes.

---

## 5. Staff password reset flow

**New edge function** `supabase/functions/reset-staff-password/index.ts`
- Two modes:
  - **Admin-initiated**: company admin calls with `{ employee_id }` → service-role generates a new temp password, updates auth user, returns the new password to the admin to share securely. Logs `staff_activities`.
  - **Self-serve**: any authenticated user calls with `{ new_password }` after confirming current password (re-auth via `supabase.auth.signInWithPassword`) → updates own password via service role.
- Validates caller JWT; admin mode also checks `is_company_admin_or_higher` and that target employee belongs to caller's company.

**UI changes:**
- `src/components/staff/EmployeeList.tsx` — add "Reset password" item to admin dropdown (calls function, shows new temp password in a copyable dialog)
- `src/pages/Settings.tsx` — new "Security" section with "Change password" form for the current user (any role) calling the self-serve mode

---

## Technical summary

```text
DB:
  + role_permissions table + RLS + has_permission() RPC

Edge functions:
  + reset-staff-password

New files:
  src/pages/MyCustomerDetail.tsx
  src/components/settings/PermissionsTab.tsx
  src/hooks/usePermissions.ts
  src/components/staff/ChangePasswordForm.tsx

Modified files:
  src/App.tsx                                 (route /my-customers/:id)
  src/pages/StaffLogs.tsx                     (filters + realtime)
  src/pages/Settings.tsx                      (Permissions tab + Security section)
  src/components/dashboard/StaffDashboard.tsx (interactive tasks + customer links)
  src/components/staff/EmployeeList.tsx       (reset password action)
  src/components/crm/CustomerList.tsx         (link rows for staff)
```

No changes to existing RLS policies; new functionality is additive.
