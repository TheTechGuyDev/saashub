import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const callerId = claims.claims.sub as string

    const { data: callerRoles } = await admin
      .from('user_roles').select('role').eq('user_id', callerId)
    const roles = (callerRoles ?? []).map((r: { role: string }) => r.role)
    const isSuperAdmin = roles.includes('super_admin')
    if (!roles.some((r) => r === 'company_admin' || r === 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { employee_id } = await req.json().catch(() => ({}))
    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'employee_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: employee, error: empErr } = await admin
      .from('employees').select('id, user_id, company_id').eq('id', employee_id).maybeSingle()
    if (empErr || !employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!isSuperAdmin) {
      const { data: callerProfile } = await admin
        .from('profiles').select('company_id').eq('id', callerId).maybeSingle()
      if (!callerProfile?.company_id || callerProfile.company_id !== employee.company_id) {
        return new Response(JSON.stringify({ error: 'Forbidden: different company' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Remove employee row
    await admin.from('employees').delete().eq('id', employee_id)

    // Remove linked auth user + profile + roles
    if (employee.user_id) {
      await admin.from('user_roles').delete().eq('user_id', employee.user_id)
      await admin.from('profiles').delete().eq('id', employee.user_id)
      await admin.auth.admin.deleteUser(employee.user_id).catch(() => {})
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})