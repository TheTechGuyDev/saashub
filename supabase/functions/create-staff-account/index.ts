import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type AppRole = 'super_admin' | 'company_admin' | 'staff' | 'user'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const callerId = claimsData.claims.sub as string

    // Verify caller is company admin or super admin
    const { data: callerRoles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
    const roles = (callerRoles ?? []).map((r: { role: string }) => r.role)
    if (!roles.some((r) => r === 'company_admin' || r === 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const {
      email,
      password,
      full_name,
      phone,
      department,
      position,
      employee_number,
      hire_date,
      salary,
      role,
      company_id: bodyCompanyId,
    } = body ?? {}

    const isSuperAdmin = roles.includes('super_admin')

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('company_id')
      .eq('id', callerId)
      .maybeSingle()

    // Resolve target company:
    // - super_admin: use body.company_id if provided, else their own profile company
    // - company_admin: always use their own profile company (ignore body override)
    let companyId: string | null = null
    if (isSuperAdmin) {
      companyId = bodyCompanyId ?? callerProfile?.company_id ?? null
    } else {
      companyId = callerProfile?.company_id ?? null
    }
    if (!companyId) {
      return new Response(
        JSON.stringify({
          error: isSuperAdmin
            ? 'No company selected. Super admin must provide a company_id, or assign yourself to a company first.'
            : 'Your account is not linked to a company yet. Complete company setup first.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: 'email, password and full_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const assignedRole: AppRole =
      role === 'company_admin' || role === 'staff' || role === 'user' ? role : 'staff'

    // Create the auth user (auto-confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })
    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message ?? 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const newUserId = created.user.id

    // Upsert profile with company_id
    await admin.from('profiles').upsert(
      {
        id: newUserId,
        email,
        full_name,
        phone: phone ?? null,
        company_id: companyId,
        job_title: position ?? null,
        department: department ?? null,
      },
      { onConflict: 'id' },
    )

    // Replace default 'user' role with the assigned role for this company
    await admin.from('user_roles').delete().eq('user_id', newUserId)
    await admin.from('user_roles').insert({
      user_id: newUserId,
      role: assignedRole,
      company_id: companyId,
    })

    // Create employee record
    const { data: employee, error: empErr } = await admin
      .from('employees')
      .insert({
        user_id: newUserId,
        company_id: companyId,
        full_name,
        email,
        phone: phone ?? null,
        department: department ?? null,
        position: position ?? null,
        employee_number: employee_number ?? null,
        hire_date: hire_date ?? null,
        salary: salary ?? null,
        status: 'active',
      })
      .select()
      .single()

    if (empErr) {
      return new Response(
        JSON.stringify({
          warning: 'User created but employee record failed',
          error: empErr.message,
          user_id: newUserId,
        }),
        { status: 207, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUserId, employee }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})