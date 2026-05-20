# Plan: Staff Portal, Admin Oversight & Staff CRM

This adds a complete staff/employee experience plus a company-admin overview of all staff, with credentials, role-based dashboards, and CRM access for staff.

---

## 1. Staff Account Provisioning (with login)

When a company admin adds an employee:
- Use a new **edge function** `create-staff-account` (uses `SUPABASE_SERVICE_ROLE_KEY`) to:
  - Create an `auth.users` record with admin-provided email + temporary password
  - Auto-confirm email
  - Create matching `profiles` row (with `company_id`, `full_name`, `phone`, `department`, `job_title`)
  - Create `employees` row linked via `user_id`
  - Assign role in `user_roles` (default `staff`, optional `company_admin` / `user`)
- `EmployeeDialog` gets new fields: **Email**, **Temporary Password**, **Role** (Staff / Manager / HR / Admin / User)
- After creation, show a toast with the credentials so admin can share them
- Staff logs in normally at `/auth` → lands on `/dashboard` with staff-specific view

## 2. Staff (Member) Dashboard

Update `src/pages/Dashboard.tsx` to render a **staff-specific layout** when the user has `staff` role and is NOT an admin:

- **My Tasks** card — tasks assigned to them (`tasks.assigned_to = profile.id`), grouped by status
- **My Attendance** — today's clock-in/out status with quick Clock In / Clock Out buttons
- **My Leave Requests** — recent requests + "Request Leave" button
- **My Customers** — CRM records assigned to them (`customers.assigned_to = profile.id`)
- **Recent Activity** — last 10 of their `customer_activities`
- **Announcements / Updates** — latest company `events` they're attending

Admins and Super Admins continue to see the current admin dashboard.

## 3. Staff Activities & Activity Log

New table **`staff_activities`** to log everything a staff member does:
- columns: `id`, `company_id`, `user_id`, `employee_id`, `activity_type` (login, task_update, customer_update, call_log, clock_in, clock_out, etc.), `entity_type`, `entity_id`, `description`, `metadata` jsonb, `created_at`
- RLS: staff see their own; admins see all company activities
- Auto-logged from hooks (task updates, customer updates, clock-in/out, call logs)

New page **`/staff-logs`** (admin only) showing:
- Filterable table of all staff activities (by employee, date range, type)
- Per-staff timeline view
- Export to CSV

Staff see their own log on their dashboard under "My Activity".

## 4. Admin Staff Overview

Enhance `/staff` page (already exists) with a new **"Overview"** tab visible to admins:
- Grid of staff cards showing: avatar, name, role badge (Manager / HR / Staff), department, status (online/clocked-in indicator), open tasks count, today's attendance, assigned customers count
- Click a card → drill-down side panel with full activity timeline, assigned tasks, attendance history, leave history
- Filters: role, department, status

Add **Role column** to existing `EmployeeList` table.

## 5. Staff CRM Access

CRM is already multi-tenant. Add staff-friendly improvements:
- **"My Customers"** filter toggle on `/crm` page (filters `assigned_to = profile.id`)
- Assignment dropdown when creating/editing a customer (admin can assign to any staff; staff can self-assign)
- Staff can log calls, add activities, update status — RLS already allows this

## 6. Navigation Updates

In `src/config/navigation.ts`:
- Add **"Staff Logs"** entry (admin only)
- Reorder so staff see relevant items first (Dashboard, Tasks, CRM, Calendar, Attendance)
- Hide admin-only items (Settings, Companies, Analytics) from plain staff

---

## Technical Summary

**New files:**
- `supabase/functions/create-staff-account/index.ts`
- `src/pages/StaffLogs.tsx`
- `src/components/dashboard/StaffDashboard.tsx`
- `src/components/dashboard/AdminDashboard.tsx` (extracted from current Dashboard)
- `src/components/staff/StaffOverviewGrid.tsx`
- `src/components/staff/StaffDetailPanel.tsx`
- `src/hooks/useStaffActivities.ts`

**Migrations:**
- Create `staff_activities` table + RLS
- Add `role` column reference / helper view for staff roster

**Modified files:**
- `src/pages/Dashboard.tsx` — split into Admin vs Staff view
- `src/pages/StaffManagement.tsx` — add Overview tab
- `src/components/staff/EmployeeDialog.tsx` — credentials + role fields, call edge function
- `src/pages/CRM.tsx` — "My Customers" filter
- `src/config/navigation.ts` — role-based filtering
- `src/App.tsx` — register `/staff-logs` route

**Security:**
- All RLS policies enforce `company_id` isolation
- Edge function uses service-role key, validates caller is `company_admin` of the target company before creating accounts
- Passwords set by admin; staff prompted to change on first login (optional later)

---

## Out of scope (for now)
- Performance reviews / KPI scoring
- Payroll
- Force-password-change-on-first-login (can add later)

Approve to proceed.