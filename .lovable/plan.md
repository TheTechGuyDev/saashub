# Fix Staff/Employee scoping + clarify Setup Company button

## 1. Setup Company button — why it isn't showing

The "Setup your company" banner only renders when `needsOnboarding` is true, which means:

- The user is signed in, AND
- They are NOT a super admin, AND
- Their profile has NO `company_id`

In the screenshot you sent, the sidebar shows admin-only items (Staff Logs, Settings) and the FA avatar — that user is already a `company_admin` with a `company_id` set, so the banner is intentionally hidden. The popup also doesn't reopen because there is nothing to onboard.

If a *different* freshly-registered user (no company yet) signs in, the banner will appear at the top of every page (it lives in `AppLayout.tsx`, above the route outlet) and the dialog will auto-open.

### What I'll do

- Keep the auto-open dialog + top banner behavior.
- Add a **"Setup company"** menu item in the header user dropdown (`AppHeader`) that is visible *only* when `needsOnboarding` is true, so the user always has a clear path to reopen the dialog even if they dismissed it.
- Confirm with you in the response whether the user in the screenshot is actually missing `company_id` (looks like they are not), so we can rule out a data issue. They are not. But there should be a setting that they can edit company details.

## 2. Staff/Employee should NOT see admin features

Right now staff inherit nearly the whole sidebar (CRM, Projects, Branches, Finance, Inventory, Email Marketing, Analytics, etc.) and can open admin pages directly via URL. They can also create projects/tasks from those pages.

### Sidebar filtering

Extend `NavItem` in `src/config/navigation.ts` with a new flag `staffAllowed?: boolean`. Tag only the items a staff member should see:

- Dashboard
- My Tasks (Projects page, but read-only view — see below)
- Calendar
- Documents
- Knowledge Base
- Call Logs (their own)
- WhatsApp (if they're customer-facing — confirm)

Update `getGroupedNavigation` to accept an `isStaff` flag. When `isStaff && !isAdmin`, filter to items where `staffAllowed === true`. Update `AppSidebar` to pass that flag.

### Route-level protection

In `src/App.tsx`, wrap admin-only routes with `<ProtectedRoute requiredRoles={["company_admin","super_admin"]}>`:

- `/staff`, `/staff-logs`
- `/branches`
- `/finance`, `/inventory`
- `/analytics`
- `/email-marketing`, `/social-media`, `/acquisition`
- `/call-centre`
- `/tickets` (admin view) — staff still get a "My Tickets" view if needed
- `/settings`

Staff-allowed routes (`/dashboard`, `/projects`, `/crm`, `/calendar`, `/documents`, `/knowledge-base`, `/call-logs`, `/whatsapp`) remain accessible.

### Hide create/edit controls for staff

In the staff-allowed pages, gate action buttons behind `isAdmin()`:

- `Projects.tsx` / `ProjectList.tsx` / `TaskBoard.tsx`: hide "New Project" and "New Task" buttons for non-admins. Staff can still open a task they're assigned to and update its status/notes.
- `CRM.tsx` / `CustomerList.tsx`: for staff, scope the list to customers `assigned_to = user.id` and hide "New Customer" / delete actions.
- `Documents.tsx`: keep upload, but hide delete on other users' files.
- `Calendar.tsx`: staff can create personal events, but not company-wide ones.

### Staff Dashboard cleanup

`StaffDashboard.tsx` currently looks fine in scope (My Tasks, My Customers, Attendance, My Activity). I'll:

- Replace the "Open CRM" / "View all" buttons that link to admin pages with links that stay within the staff-allowed views.
- Remove the "My Customers" card if staff aren't supposed to see CRM (confirm in question below).
- Add a "My Leave Requests" quick card so staff have somewhere to submit leave.

## Files to change

```text
src/config/navigation.ts          add staffAllowed flag + isStaff filter
src/components/layout/AppSidebar.tsx  pass isStaff to nav filter
src/components/layout/AppHeader.tsx   add Setup Company menu item when needsOnboarding
src/App.tsx                       wrap admin routes in ProtectedRoute with roles
src/pages/Projects.tsx
src/components/projects/ProjectList.tsx
src/components/projects/TaskBoard.tsx
src/pages/CRM.tsx
src/components/crm/CustomerList.tsx
src/pages/Documents.tsx
src/pages/Calendar.tsx
src/components/dashboard/StaffDashboard.tsx
```

No DB / RLS changes — backend already isolates by `company_id`; this PR adds UI + route enforcement.

## Open question

Before I implement, one quick choice on CRM access for non-admin staff — see the question I'll ask next.