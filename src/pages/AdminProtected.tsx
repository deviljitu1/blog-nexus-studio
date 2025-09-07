import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Admin from "./Admin";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdminProtected = () => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAdminRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    return roles?.some(r => r.role === 'admin') || false;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          navigate("/", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate("/auth", { replace: true });
      }
      setChecking(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          navigate("/", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate("/auth", { replace: true });
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <h2 className="text-xl font-semibold mb-2">Verifying Access</h2>
              <p className="text-muted-foreground">Checking your authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                {!isAuthenticated ? "Authentication Required" : "Admin Access Required"}
              </h2>
              <p className="text-muted-foreground">
                {!isAuthenticated ? "Redirecting to login..." : "You need admin privileges to access this area."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <Admin />;
};

export default AdminProtected;