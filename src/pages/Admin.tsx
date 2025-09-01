import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter, Users, Activity, BarChart3, UserCheck, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAdminData } from "@/hooks/useAdminData";
import PostForm from "@/components/admin/PostForm";
import AdminGuide from "@/components/admin/AdminGuide";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { posts, loading: postsLoading, createPost, updatePost, deletePost } = useBlogPosts();
  const { users, activities, stats, loading: adminLoading, updateUserRole, refreshData } = useAdminData();

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id);
        setIsAdmin(roles?.some(r => r.role === 'admin') || false);
      }
    };
    checkAdmin();
  }, []);

  const handleCreatePost = async (data: any) => {
    await createPost(data);
    setShowPostForm(false);
  };

  const handleEditPost = async (data: any) => {
    if (editingPost) {
      await updatePost(editingPost.id, data);
      setEditingPost(null);
    }
  };

  const handleDeletePost = async () => {
    if (postToDelete) {
      await deletePost(postToDelete);
      setPostToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    await updateUserRole(userId, newRole);
    setSelectedUser(null);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_signup': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'user_login': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'blog_post_created': return <Plus className="h-4 w-4 text-purple-500" />;
      case 'blog_post_updated': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'blog_post_deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="destructive"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'moderator': return <Badge variant="default">Moderator</Badge>;
      default: return <Badge variant="secondary">User</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this area.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Crown className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive admin panel with user management and analytics
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        {/* Welcome Message for New Admins */}
        {users.length > 0 && stats.totalPosts === 0 && (
          <Alert className="mb-8 border-primary bg-primary/5">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Welcome to your Admin Dashboard!</strong> You now have full administrative access. 
              Start by creating your first blog post, managing user roles, or monitoring system activity.
              The admin panel is only accessible via this URL: <code className="bg-muted px-1 rounded">/admin</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">registered accounts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <div className="text-xs text-muted-foreground">last 30 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">total posts</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                New Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentSignups}</div>
              <div className="text-xs text-muted-foreground">last 7 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
              <div className="text-xs text-muted-foreground">admin accounts</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="posts">Blog Posts</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="guide">Admin Guide</TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start space-x-4 flex-1">
                          <img
                            src={post.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop'}
                            alt={post.title || 'Post thumbnail'}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{post.category}</Badge>
                              <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                                {post.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(post.publish_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/article/${post.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPostToDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management ({users.length} users)</CardTitle>
              </CardHeader>
              <CardContent>
                {adminLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Logins</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback>
                                  {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.display_name || 'Unnamed User'}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                          <TableCell>{user.login_count}</TableCell>
                          <TableCell>
                            {user.last_login ? formatDate(user.last_login) : 'Never'}
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity ({activities.length} events)</CardTitle>
              </CardHeader>
              <CardContent>
                {adminLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading activity...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getActionIcon(activity.action)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {activity.action.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          {activity.details && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {JSON.stringify(activity.details)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">User Growth</h4>
                    <div className="text-2xl font-bold text-green-600">
                      +{stats.recentSignups} new users
                    </div>
                    <p className="text-sm text-muted-foreground">In the last 7 days</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">User Engagement</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Active user rate (30 days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
            <AdminGuide />
          </TabsContent>
        </Tabs>

        {/* User Role Management Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User: {selectedUser?.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedUser?.avatar_url || ''} />
                  <AvatarFallback>
                    {selectedUser?.display_name?.charAt(0) || selectedUser?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser?.display_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser?.email}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Role:</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedUser?.role === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleChange(selectedUser?.user_id, 'user')}
                  >
                    User
                  </Button>
                  <Button
                    variant={selectedUser?.role === 'moderator' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleChange(selectedUser?.user_id, 'moderator')}
                  >
                    Moderator
                  </Button>
                  <Button
                    variant={selectedUser?.role === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleChange(selectedUser?.user_id, 'admin')}
                  >
                    Admin
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div>Joined: {selectedUser && formatDate(selectedUser.created_at)}</div>
                <div>Login count: {selectedUser?.login_count}</div>
                <div>Last login: {selectedUser?.last_login ? formatDate(selectedUser.last_login) : 'Never'}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Post Dialog */}
        <Dialog open={showPostForm || !!editingPost} onOpenChange={(open) => {
          if (!open) {
            setShowPostForm(false);
            setEditingPost(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <PostForm
              post={editingPost}
              onSubmit={editingPost ? handleEditPost : handleCreatePost}
              onCancel={() => {
                setShowPostForm(false);
                setEditingPost(null);
              }}
              loading={postsLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin;