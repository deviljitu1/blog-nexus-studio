import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  last_login: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  email?: string;
  role?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profile?: UserProfile;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_by: string | null;
  assigned_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  recentSignups: number;
  adminUsers: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    recentSignups: 0,
    adminUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminAccess = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.session.user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) throw new Error('Access denied. Admin privileges required.');
    
    return session.session.user.id;
  };

  const fetchUsers = async () => {
    try {
      await checkAdminAccess();

      // Use edge function to get user data with emails
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    }
  };

  const fetchActivities = async () => {
    try {
      await checkAdminAccess();

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Cast the data to match our interface
      const activitiesData = (data || []).map(activity => ({
        ...activity,
        ip_address: activity.ip_address as string | null,
        user_agent: activity.user_agent as string | null,
      }));
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      await checkAdminAccess();

      // Get basic stats
      const [usersRes, postsRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role').eq('role', 'admin')
      ]);

      // Get active users (logged in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', thirtyDaysAgo.toISOString());

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalUsers: usersRes.count || 0,
        activeUsers: activeCount || 0,
        totalPosts: postsRes.count || 0,
        recentSignups: recentSignups || 0,
        adminUsers: rolesRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      await checkAdminAccess();

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_role',
          userId,
          role: newRole,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchActivities(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    users,
    activities,
    stats,
    loading,
    updateUserRole,
    refreshData,
  };
};