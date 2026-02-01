
# Implementation Plan: Database, Auth, CRM & Staff Management

## Overview

This plan covers three major implementation areas:
1. **Database Foundation** - Multi-tenant tables with RLS security
2. **Authentication System** - Login/signup with role-based access
3. **CRM Module** - Customer profiles, sales pipeline, activity tracking
4. **Staff Management Module** - Employee profiles, attendance tracking

---

## Part 1: Database Schema Setup

### Core Tables

**1. companies**
- Stores tenant organizations
- Fields: id, name, slug, logo_url, settings, created_at

**2. profiles**
- User profiles linked to companies
- Fields: id (references auth.users), company_id, full_name, email, avatar_url, phone, job_title, department, created_at, updated_at

**3. user_roles** (separate table for security)
- Role assignments using enum (super_admin, company_admin, staff, user)
- Fields: id, user_id, role, company_id, created_at

**4. has_role() function**
- Security definer function to check roles without RLS recursion

### CRM Tables

**5. customers**
- Customer profiles with company isolation
- Fields: id, company_id, name, email, phone, company_name, status (lead/opportunity/deal/closed/lost), value, tags, notes, assigned_to, created_at, updated_at

**6. customer_activities**
- Activity logs per customer
- Fields: id, customer_id, company_id, user_id, type (call/email/meeting/note), description, created_at

### Staff Management Tables

**7. employees**
- Employee profiles within companies
- Fields: id, company_id, user_id, employee_number, full_name, email, phone, department, position, hire_date, status (active/on_leave/terminated), salary, manager_id, created_at, updated_at

**8. attendance_records**
- Clock in/out tracking
- Fields: id, employee_id, company_id, date, clock_in, clock_out, status (present/absent/late/half_day), notes, created_at

**9. leave_requests**
- Leave management
- Fields: id, employee_id, company_id, leave_type, start_date, end_date, reason, status (pending/approved/rejected), approved_by, created_at

### Row-Level Security

All tables will have RLS policies ensuring:
- Users can only access data within their company
- Super admins can access all companies
- Company admins can manage their company's data
- Staff can view/edit assigned records
- Users have read-only access to relevant data

---

## Part 2: Authentication System

### New Files

**src/pages/Auth.tsx**
- Login and signup forms with email/password
- Modern design matching the app theme
- Form validation with zod
- Error handling for common auth scenarios

**src/contexts/AuthContext.tsx**
- Auth state management
- User session handling
- Role checking utilities
- Automatic redirect for authenticated users

**src/hooks/useAuth.ts**
- Custom hook for auth operations
- Sign in, sign up, sign out functions
- Current user and role access

**src/components/auth/ProtectedRoute.tsx**
- Route wrapper for authenticated routes
- Role-based access control
- Redirect to login for unauthenticated users

### Integration Points

- Update AppLayout to use auth context
- Update AppHeader to show logged-in user info
- Add sign out functionality
- Conditionally show Settings for admins only

---

## Part 3: CRM Module

### New Files

**src/pages/CRM.tsx** (replace placeholder)
- Main CRM dashboard with tabs:
  - Customers list with search/filter
  - Sales Pipeline (Kanban board)
  - Quick stats and recent activity

**src/components/crm/CustomerList.tsx**
- Data table with customers
- Search, filter by status/tags
- Bulk actions (assign, delete)
- Click to view customer details

**src/components/crm/CustomerDialog.tsx**
- Add/Edit customer modal
- Form fields: name, email, phone, company, status, value, notes, tags
- Validation and error handling

**src/components/crm/SalesPipeline.tsx**
- Kanban board with columns: Lead, Opportunity, Deal, Closed Won, Closed Lost
- Drag and drop to change status
- Customer cards with key info
- Click to view full details

**src/components/crm/CustomerDetail.tsx**
- Full customer profile view
- Contact information
- Activity timeline
- Add activity form (call, email, meeting, note)
- Edit customer button

**src/components/crm/ActivityTimeline.tsx**
- Chronological list of customer interactions
- Icons per activity type
- Timestamps and user attribution

### Data Hooks

**src/hooks/useCustomers.ts**
- CRUD operations for customers
- React Query for data fetching
- Optimistic updates for pipeline changes

**src/hooks/useActivities.ts**
- Fetch and create customer activities
- Real-time updates (optional)

---

## Part 4: Staff Management Module

### New Files

**src/pages/StaffManagement.tsx** (replace placeholder)
- Staff dashboard with tabs:
  - Employee Directory
  - Attendance Overview
  - Leave Requests

**src/components/staff/EmployeeList.tsx**
- Data table with employee information
- Search and filter by department/status
- Click to view employee profile

**src/components/staff/EmployeeDialog.tsx**
- Add/Edit employee modal
- Form fields: name, email, phone, department, position, hire date, salary, manager
- Link to user account (optional)

**src/components/staff/EmployeeProfile.tsx**
- Full employee details
- Attendance summary
- Leave balance
- Performance notes

**src/components/staff/AttendanceTable.tsx**
- Daily attendance records
- Clock in/out buttons (for current user)
- Filter by date range
- Status indicators

**src/components/staff/LeaveRequestList.tsx**
- List of leave requests
- Status badges (pending/approved/rejected)
- Approve/Reject actions for managers

**src/components/staff/LeaveRequestDialog.tsx**
- Submit leave request form
- Date picker for start/end
- Leave type selection
- Reason text field

### Data Hooks

**src/hooks/useEmployees.ts**
- CRUD operations for employees
- React Query integration

**src/hooks/useAttendance.ts**
- Fetch attendance records
- Clock in/out functions

**src/hooks/useLeaveRequests.ts**
- Fetch and create leave requests
- Approve/reject mutations

---

## Implementation Order

1. **Database Migration**
   - Create all tables with proper relationships
   - Set up RLS policies
   - Create helper functions (has_role, get_user_company)

2. **Authentication**
   - Build Auth page with login/signup
   - Create AuthContext and hooks
   - Add ProtectedRoute wrapper
   - Integrate with existing layout

3. **CRM Module**
   - Build CustomerList component
   - Add CustomerDialog for CRUD
   - Implement SalesPipeline with drag-drop
   - Create activity tracking

4. **Staff Management Module**
   - Build EmployeeList component
   - Add EmployeeDialog for CRUD
   - Implement attendance tracking
   - Add leave request system

---

## Technical Details

### Database Patterns

All tables use:
- UUID primary keys with `gen_random_uuid()`
- `company_id` foreign key for tenant isolation
- `created_at` and `updated_at` timestamps
- Soft delete pattern where appropriate

### RLS Policy Pattern

```text
-- Example pattern for company-scoped tables
Policy: "Users can view own company data"
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
```

### Security Function

```text
has_role(user_id, role) - Returns boolean
  Used in RLS policies to check user permissions
  SECURITY DEFINER prevents recursion issues
```

---

## UI Components Used

- **Data Tables** - Using existing table components with sorting/filtering
- **Forms** - react-hook-form with zod validation
- **Modals** - Radix Dialog for add/edit forms
- **Drag & Drop** - For Kanban pipeline (using native HTML5 or library)
- **Tabs** - For module navigation
- **Cards** - For employee/customer profiles
- **Badges** - For status indicators
- **Avatars** - For user/employee images

---

## Expected Outcome

After implementation:

- Users can sign up and log in with email/password
- Multi-tenant data isolation is enforced at the database level
- Role-based access control limits features by user role
- CRM module allows full customer lifecycle management
- Staff module enables employee and attendance tracking
- All data is properly secured with RLS policies
