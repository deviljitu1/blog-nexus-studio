import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')
    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    const { method } = req

    if (method === 'GET') {
      // Fetch all users with their profiles and roles
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select(`
          *,
          user_roles(role, assigned_at)
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get auth users data using service role
      const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
      
      if (authError) throw authError

      // Combine profile data with auth data
      const usersWithEmail = profiles?.map(profile => {
        const authUser = authUsers.users.find(au => au.id === profile.user_id)
        return {
          ...profile,
          email: authUser?.email || 'unknown@example.com',
          email_confirmed: authUser?.email_confirmed_at ? true : false,
          last_sign_in: authUser?.last_sign_in_at,
          role: ((profile as any).user_roles?.[0]?.role as string) || 'user',
          role_assigned_at: ((profile as any).user_roles?.[0]?.assigned_at as string) || null
        }
      })

      return new Response(
        JSON.stringify({ users: usersWithEmail }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (method === 'POST') {
      const body = await req.json()
      const { action, userId, role } = body

      if (action === 'update_role') {
        // Update user role
        const { error } = await supabaseClient
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: role,
            assigned_by: user.id
          })

        if (error) throw error

        // Log the role change
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'role_updated',
            details: {
              target_user: userId,
              new_role: role,
              updated_by: user.id
            }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      if (action === 'invite_admin') {
        const { email, displayName } = body
        
        // In a real implementation, you would send an invitation email
        // For now, we'll just log this action
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'admin_invitation_sent',
            details: {
              invited_email: email,
              invited_name: displayName,
              sent_by: user.id
            }
          })

        return new Response(
          JSON.stringify({ success: true, message: 'Invitation logged' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})