import { useState, useEffect } from "react";
import AdminAuth from "@/components/admin/AdminAuth";
import Admin from "./Admin";

const AdminProtected = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated from sessionStorage
  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("adminAuthenticated", "true");
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return <Admin />;
};

export default AdminProtected;