import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trash2,
  Download,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { api, Package, PackageRating, PackageCost } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

export default function PackageDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [rating, setRating] = useState<PackageRating | null>(null);
  const [cost, setCost] = useState<PackageCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) loadPackage();
  }, [id]);

  const loadPackage = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const packageData = await api.getPackage(id);
      setPkg(packageData);
    } catch (error) {
      toast.error("Failed to load package");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    if (!id || rating) return;
    try {
      const ratingData = await api.getPackageRating(id);
      setRating(ratingData);
    } catch (error: any) {
      // Handle 404 gracefully - scores may not be available yet
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("No scores")
      ) {
        console.log("No scores available for this package yet");
        setRating(null);
      } else {
        toast.error("Failed to load rating");
      }
    }
  };

  const loadCost = async () => {
    if (!id || cost) return;
    try {
      const costData = await api.getPackageCost(id);
      setCost(costData);
    } catch (error) {
      toast.error("Failed to load cost");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.deletePackage(id);
      toast.success("Package deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete package");
    }
  };

  const downloadPackage = async () => {
    if (!id) return;

    try {
      // Open the download URL - backend will redirect to HuggingFace or S3
      await api.downloadPackage(id);
      toast.success("Opening download location");
    } catch (error) {
      toast.error("Failed to download package");
    }
  };

  const getRatingColor = (score: number) => {
    if (score >= 0.8) return "text-success";
    if (score >= 0.5) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div
          className="flex justify-center items-center py-12"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <span className="sr-only">Loading package details...</span>
        </div>
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
          aria-label="Back to packages list"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Packages</span>
        </Button>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{pkg.metadata.Name}</h1>
              <Badge variant="secondary" className="text-base">
                v{pkg.metadata.Version}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Package ID: {pkg.metadata.ID}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadPackage}
              className="gap-2"
              aria-label={`Download ${pkg.metadata.Name}`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="gap-2"
                  aria-label={`Delete ${pkg.metadata.Name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle id="delete-dialog-title">
                    Delete Package
                  </AlertDialogTitle>
                  <AlertDialogDescription id="delete-dialog-description">
                    Are you sure you want to delete this package? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rating" onClick={() => loadRating()}>
              Rating
            </TabsTrigger>
            <TabsTrigger value="cost" onClick={() => loadCost()}>
              Cost
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Package Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{pkg.metadata.Name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{pkg.metadata.Version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium font-mono text-sm">
                      {pkg.metadata.ID}
                    </p>
                  </div>
                  {pkg.data.URL && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Source URL
                      </p>
                      <a
                        href={pkg.data.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {pkg.data.URL}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {pkg.data.JSProgram && (
                <Card>
                  <CardHeader>
                    <CardTitle>JS Program</CardTitle>
                    <CardDescription>
                      Custom JavaScript program for this package
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{pkg.data.JSProgram}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rating" className="mt-6">
            {rating ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(rating).map(([key, value]) => (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-3xl font-bold ${getRatingColor(
                          value
                        )}`}
                      >
                        {(value * 100).toFixed(0)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : rating === null ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No scores available yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This package hasn't been scored yet or was ingested before
                    scoring was enabled.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="cost" className="mt-6">
            {cost ? (
              <div className="grid gap-4">
                {Object.entries(cost).map(([packageId, costData]) => (
                  <Card key={packageId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        Package Cost Analysis
                      </CardTitle>
                      <CardDescription>Package ID: {packageId}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {costData.standaloneCost !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Standalone Cost
                          </p>
                          <p className="text-2xl font-bold">
                            ${costData.standaloneCost.toFixed(2)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Cost (with dependencies)
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${costData.totalCost.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
