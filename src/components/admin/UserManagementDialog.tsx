import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserProfile } from "@/hooks/useAdminData";

interface UserManagementDialogProps {
  user: UserProfile | null;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (userId: string, newRole: 'admin' | 'moderator' | 'user') => Promise<void>;
}

const UserManagementDialog = ({ user, onOpenChange, onRoleChange }: UserManagementDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>(user?.role as any || 'user');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleRoleUpdate = async () => {
    if (selectedRole === user.role) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      await onRoleChange(user.user_id, selectedRole);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full administrative access - can manage all users, create/edit/delete content, and access all system features.';
      case 'moderator':
        return 'Limited administrative access - can moderate content and manage user posts but cannot modify user roles.';
      default:
        return 'Standard user access - can create and manage their own content but cannot access administrative features.';
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage User Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback>
                {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.display_name || 'Unnamed User'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {getRoleBadge(user.role || 'user')}
                <span className="text-xs text-muted-foreground">
                  {user.login_count} logins
                </span>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <Label htmlFor="role-select">Assign Role</Label>
            <Select value={selectedRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(selectedRole)}
                    <span className="capitalize">{selectedRole}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="moderator">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Moderator
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Role Description */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(selectedRole)}
              </p>
            </div>

            {/* Admin Warning */}
            {selectedRole === 'admin' && user.role !== 'admin' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Granting admin access will give this user full control over the system, 
                  including the ability to manage other admin accounts.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRoleUpdate} 
              disabled={loading || selectedRole === user.role}
            >
              {loading ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementDialog;