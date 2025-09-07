import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, LogOut, Crown, Shield, User, Settings } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
      }

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session?.user?.id);

      setRole(roleData?.[0]?.role || 'user');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: session?.user?.id,
          display_name: displayName,
          bio: bio,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: session?.user?.id,
          avatar_url: data.publicUrl,
          display_name: displayName,
          bio: bio,
        });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
      
      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="destructive" className="flex items-center gap-1"><Crown className="h-3 w-3" />Admin</Badge>;
      case 'moderator': return <Badge variant="default" className="flex items-center gap-1"><Shield className="h-3 w-3" />Moderator</Badge>;
      default: return <Badge variant="secondary" className="flex items-center gap-1"><User className="h-3 w-3" />User</Badge>;
    }
  };

  const getPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          'Full admin dashboard access',
          'User management and roles',
          'Create, edit, delete all content',
          'View analytics and activity logs',
          'System configuration'
        ];
      case 'moderator':
        return [
          'Content moderation',
          'Edit and delete posts',
          'View user activity',
          'Manage comments'
        ];
      default:
        return [
          'Create personal content',
          'Edit own posts',
          'View published content',
          'Personal profile management'
        ];
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4 space-y-6">
      {/* Profile Settings Card */}
      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader className="text-center md:text-left">
          <CardTitle className="text-2xl md:text-3xl font-serif">Profile Settings</CardTitle>
          <CardDescription className="text-base md:text-lg">
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
                  {displayName ? displayName.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 md:p-3 cursor-pointer hover:bg-primary/90 transition-all duration-300 hover:scale-110 shadow-glow"
              >
                <Camera className="h-3 w-3 md:h-4 md:w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </div>
            {uploading && (
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span>Uploading...</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {getRoleBadge(role)}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-muted/50 border-muted text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm font-medium">Display Name</Label>
              <Input
                id="display-name"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="resize-none focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
            <Button 
              onClick={updateProfile} 
              disabled={saving}
              className="flex-1 shadow-glow hover-lift"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex-1 hover:bg-destructive hover:text-destructive-foreground border-border/50"
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRoleIcon(role)}
            Account Permissions
          </CardTitle>
          <CardDescription>
            Your current role and what you can do with it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Your Permissions:</h4>
              <div className="space-y-2">
                {getPermissions(role).map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {role === 'admin' && (
              <div className="pt-4 border-t">
                <Button onClick={() => navigate('/admin')} className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Access Admin Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;