import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  Download,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

interface FailureInfo {
  message: string;
  failingMetrics?: Array<{ metric: string; score: number; threshold: number }>;
}

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ingestData, setIngestData] = useState({ url: "", name: "" });
  const [failureInfo, setFailureInfo] = useState<FailureInfo | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFailureInfo(null); // Clear previous failures

    try {
      const result = await api.ingestModel(
        ingestData.url,
        ingestData.name || undefined
      );
      if (result.is_ingestible) {
        toast.success(`Model "${result.model_name}" ingested successfully!`);
        // Navigate to search page or show artifact details
        navigate("/");
      } else {
        // Display detailed failure information
        const metrics = result.failing_metrics || [];
        const failureMessage = `Model "${
          result.model_name || "Unknown"
        }" failed quality gate`;

        setFailureInfo({
          message: failureMessage,
          failingMetrics: metrics,
        });

        toast.error(failureMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ingest failed";

      // Try to parse error message for failing metrics
      if (errorMessage.includes("Quality gate check failed")) {
        setFailureInfo({
          message: "Quality gate check failed",
          failingMetrics: [],
        });
      } else {
        setFailureInfo({
          message: errorMessage,
        });
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
          aria-label="Back to packages list"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Packages</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Ingest Model</h1>
          <p className="text-muted-foreground">
            Ingest a HuggingFace model into the registry with quality validation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingest HuggingFace Model</CardTitle>
            <CardDescription>
              Ingest HuggingFace models with quality validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIngest} className="space-y-4">
              {failureInfo && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">{failureInfo.message}</p>
                    {failureInfo.failingMetrics &&
                      failureInfo.failingMetrics.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold mb-2">Failing Metrics:</p>
                          <ul className="space-y-1">
                            {failureInfo.failingMetrics.map((metric, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-start gap-2"
                              >
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>
                                  <strong>{metric.metric}:</strong>{" "}
                                  {(metric.score * 100).toFixed(1)}% (required:{" "}
                                  {(metric.threshold * 100).toFixed(0)}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="ingest-url">HuggingFace Model URL *</Label>
                <Input
                  id="ingest-url"
                  value={ingestData.url}
                  onChange={(e) => {
                    setIngestData({ ...ingestData, url: e.target.value });
                    setFailureInfo(null); // Clear error when user starts typing
                  }}
                  placeholder="https://huggingface.co/username/model-name"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter a HuggingFace model URL. The model will be validated
                  against quality metrics before ingestion.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingest-name">Model Name (Optional)</Label>
                <Input
                  id="ingest-name"
                  value={ingestData.name}
                  onChange={(e) => {
                    setIngestData({ ...ingestData, name: e.target.value });
                  }}
                  placeholder="custom-model-name"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Specify a custom name for the model. If not
                  provided, the name will be extracted from the URL.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">
                  Quality Requirements
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• All quality metrics must score ≥ 0.5</li>
                  <li>• Bus Factor, Correctness, RampUp, License, etc.</li>
                  <li>• Models failing quality checks will be rejected</li>
                </ul>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating & Ingesting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Ingest Model
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
