import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package as PackageIcon, Loader2 } from "lucide-react";
import { api, PackageMetadata } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

export default function Dashboard() {
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextOffset, setNextOffset] = useState<string>();
  const navigate = useNavigate();

  const loadPackages = async (offset?: string) => {
    setLoading(true);
    try {
      const result = await api.searchPackages([{ Name: "*" }], offset);
      if (offset) {
        setPackages((prev) => [...prev, ...result.packages]);
      } else {
        setPackages(result.packages);
      }
      setNextOffset(result.nextOffset);
    } catch (error) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPackages();
      return;
    }

    setLoading(true);
    try {
      // Try regex search first
      const results = await api.searchByRegex(searchQuery);
      setPackages(results);
      setNextOffset(undefined);
    } catch (error) {
      // Fallback to name search
      try {
        const result = await api.searchPackages([{ Name: searchQuery }]);
        setPackages(result.packages);
        setNextOffset(result.nextOffset);
      } catch {
        toast.error("Search failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Package Registry
          </h1>
          <p className="text-muted-foreground">
            Browse and manage your npm and GitHub packages
          </p>
        </div>

        <div
          className="mb-6 flex gap-2"
          role="search"
          aria-label="Package search"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search packages by name or regex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
              aria-label="Search packages by name or regex"
              type="search"
            />
          </div>
          <Button onClick={handleSearch} aria-label="Execute search">
            Search
          </Button>
        </div>

        {loading && !packages.length ? (
          <div
            className="flex justify-center items-center py-12"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">Loading packages...</span>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              role="list"
              aria-label="Available packages"
            >
              {packages.map((pkg) => (
                <Card
                  key={pkg.ID}
                  className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary"
                  onClick={() => navigate(`/package/${pkg.ID}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/package/${pkg.ID}`);
                    }
                  }}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${pkg.Name} version ${pkg.Version}, package ID ${pkg.ID}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="p-2 bg-primary/10 rounded-lg shrink-0"
                          aria-hidden="true"
                        >
                          <PackageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg truncate">
                          {pkg.Name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        v{pkg.Version}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground truncate">
                      ID: {pkg.ID}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {packages.length === 0 && !loading && (
              <div className="text-center py-12" role="status">
                <PackageIcon
                  className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground">No packages found</p>
              </div>
            )}

            {nextOffset && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadPackages(nextOffset)}
                  disabled={loading}
                  aria-label="Load more packages"
                >
                  {loading ? (
                    <Loader2
                      className="h-4 w-4 animate-spin mr-2"
                      aria-hidden="true"
                    />
                  ) : null}
                  {loading ? <span className="sr-only">Loading...</span> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
