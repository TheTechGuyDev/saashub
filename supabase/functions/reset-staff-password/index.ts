import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function randomPassword(len = 14): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < len; i++) out += charset[bytes[i] % charset.length]
  return out
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

    const body = await req.json().catch(() => ({}))
    const mode = body?.mode === 'admin' ? 'admin' : 'self'

    // ===== Self-serve mode =====
    if (mode === 'self') {
      const newPassword = String(body?.new_password ?? '')
      if (newPassword.length < 8) {
        return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { error: updErr } = await admin.auth.admin.updateUserById(callerId, {
        password: newPassword,
      })
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { data: prof } = await admin.from('profiles').select('company_id').eq('id', callerId).maybeSingle()
      if (prof?.company_id) {
        await admin.from('staff_activities').insert({
          user_id: callerId,
          company_id: prof.company_id,
          activity_type: 'password_changed',
          description: 'Changed own password',
        })
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ===== Admin mode =====
    const { data: callerRoles } = await admin
      .from('user_roles').select('role').eq('user_id', callerId)
    const roles = (callerRoles ?? []).map((r: { role: string }) => r.role)
    const isSuperAdmin = roles.includes('super_admin')
    if (!roles.some((r) => r === 'company_admin' || r === 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const employee_id = body?.employee_id
    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'employee_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: employee } = await admin
      .from('employees').select('id, user_id, company_id, full_name')
      .eq('id', employee_id).maybeSingle()
    if (!employee || !employee.user_id) {
      return new Response(JSON.stringify({ error: 'Employee not found or has no account' }), {
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

    const tempPassword = randomPassword(14)
    const { error: updErr } = await admin.auth.admin.updateUserById(employee.user_id, {
      password: tempPassword,
    })
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await admin.from('staff_activities').insert({
      user_id: callerId,
      company_id: employee.company_id,
      employee_id: employee.id,
      activity_type: 'password_reset',
      description: `Reset password for ${employee.full_name}`,
    })

    return new Response(JSON.stringify({ success: true, temp_password: tempPassword }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})