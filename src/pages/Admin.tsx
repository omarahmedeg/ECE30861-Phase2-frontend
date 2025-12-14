import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  RotateCcw,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<{
    status: string;
    database_status: string;
  } | null>(null);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    // Fetch health status on mount
    const fetchHealth = async () => {
      try {
        const healthData = await api.checkHealth();
        setHealth(healthData);
      } catch (error) {
        console.error("Failed to fetch health:", error);
        // Set error state instead of null
        setHealth({
          status: "error",
          database_status: "Unable to fetch health status",
        });
      }
    };
    fetchHealth();
  }, []);

  const handleResetRegistry = async () => {
    setLoading(true);
    try {
      await api.resetRegistry();
      toast.success("Registry has been reset successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset registry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage registry settings and perform administrative actions
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* System Health Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                System Health
              </CardTitle>
              <CardDescription>
                Current status of the registry system and database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 ${
                      health.status === "error"
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      API Status
                    </p>
                    <p
                      className={`text-2xl font-bold capitalize ${
                        health.status === "error" ? "text-destructive" : ""
                      }`}
                    >
                      {health.status}
                    </p>
                  </div>
                  <div
                    className={`border rounded-lg p-4 ${
                      health.database_status.includes("Unable") ||
                      health.database_status.includes("unhealthy")
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      Database Status
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        health.database_status.includes("Unable") ||
                        health.database_status.includes("unhealthy")
                          ? "text-destructive text-sm"
                          : "capitalize"
                      }`}
                    >
                      {health.database_status}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">
                    Loading health status...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset Registry
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Delete all packages and reset the registry to its
                        default state. This action will remove all package data
                        permanently.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>
                          Reset Registry
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Reset Registry
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>
                              Are you absolutely sure you want to reset the
                              entire registry?
                            </p>
                            <p className="font-semibold text-destructive">
                              This will permanently delete all packages and
                              cannot be undone.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetRegistry}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Yes, Reset Registry
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registry Information</CardTitle>
              <CardDescription>
                Current registry status and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Backend URL
                  </span>
                  <span className="text-sm font-mono">
                    {"https://vmqqvhwppq.us-east-1.awsapprunner.com"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    Admin Access
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    Enabled
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
