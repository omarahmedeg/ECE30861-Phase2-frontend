import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, LogOut, Upload, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, isAdmin, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className="border-b border-border bg-card shadow-sm sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          aria-label="Package Registry Home"
        >
          <Package className="h-6 w-6" aria-hidden="true" />
          <span>Package Registry</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/upload">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              aria-label="Upload package"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload</span>
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                aria-label="Admin panel"
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Admin</span>
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <span
              className="text-sm text-muted-foreground"
              aria-label={`Logged in as ${username}${
                isAdmin ? ", admin user" : ""
              }`}
            >
              {username}{" "}
              {isAdmin && <span className="text-accent">(Admin)</span>}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
