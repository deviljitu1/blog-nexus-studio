import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  order_items: any;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export const useOrderData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
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
    
    if (!roles?.some(r => r.role === 'admin')) {
      throw new Error('Admin access required');
    }
  };

  const fetchOrders = async () => {
    try {
      await checkAdminAccess();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      await checkAdminAccess();
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      await checkAdminAccess();
      
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (error) throw error;

      const totalOrders = orderData?.length || 0;
      const pendingOrders = orderData?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orderData?.filter(o => o.status === 'completed').length || 0;
      const totalRevenue = orderData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await checkAdminAccess();
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await checkAdminAccess();
      
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      await fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      await checkAdminAccess();
      
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await checkAdminAccess();
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchCategories(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    orders,
    categories,
    stats,
    loading,
    updateOrderStatus,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshData
  };
};