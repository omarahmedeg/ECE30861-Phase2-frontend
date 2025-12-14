// API configuration and client
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface User {
  name: string;
  isAdmin: boolean;
}

export interface Package {
  metadata: { Name: string; Version: string; ID: string };
  data: { Content?: string; URL?: string; JSProgram?: string };
}

export interface PackageMetadata {
  Name: string;
  Version: string;
  ID: string;
}

export interface PackageRating {
  BusFactor: number;
  Correctness: number;
  RampUp: number;
  ResponsiveMaintainer: number;
  LicenseScore: number;
  GoodPinningPractice: number;
  PullRequest: number;
  NetScore: number;
  Reproducibility?: number;
}

export interface PackageCost {
  [packageId: string]: { standaloneCost?: number; totalCost: number };
}

export interface PackageHistory {
  timestamp: string;
  user: string;
}

export interface PackageQuery {
  Name: string;
  Version?: string;
}

export const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken = (token: string) =>
  localStorage.setItem("authToken", token);
export const clearAuthToken = () => localStorage.removeItem("authToken");
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return {};

  // Remove any existing "bearer" prefix (case insensitive) and quotes
  const cleanToken = token.replace(/^"?bearer\s*/i, "").replace(/"$/i, "");
  return { Authorization: `Bearer ${cleanToken}` };
};

export const api = {
  async authenticate(
    username: string,
    password: string,
    isAdmin: boolean = false
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/authenticate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: { name: username, is_admin: isAdmin },
        secret: { password },
      }),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Authentication failed");
    const token = await response.text();
    return token.replace(/^"?bearer\s*/i, "").replace(/"$/i, "");
  },

  async createUser(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        username,
        password,
        email: `${username}@example.com`,
        is_admin: false,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create user");
    }
  },

  async getCurrentUser(): Promise<User> {
    // Use Phase 2B endpoint - GET /api/v1/user/me
    const response = await fetch(`${API_BASE_URL}/api/v1/user/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to get user info");
    const data = await response.json();
    return {
      name: data.username,
      isAdmin: data.is_admin,
    };
  },

  async checkHealth(): Promise<{ status: string; database_status: string }> {
    // Use Phase 2B endpoint - GET /api/v1/system/health
    const response = await fetch(`${API_BASE_URL}/api/v1/system/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  async searchPackages(
    queries: PackageQuery[],
    offset?: string
  ): Promise<{ packages: PackageMetadata[]; nextOffset?: string }> {
    // Use Phase 2B endpoint - GET /api/v1/package with optional name_pattern
    const namePattern = queries[0]?.Name === "*" ? undefined : queries[0]?.Name;
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("page_size", "100");
    if (namePattern) {
      params.append("name_pattern", namePattern);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/package?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to search packages");
    const data = await response.json();

    const packages = data.packages.map((p: any) => ({
      Name: p.name,
      ID: p.id.toString(),
      Version: p.version,
    }));
    return {
      packages,
      nextOffset: undefined, // Phase 2B uses page-based pagination
    };
  },

  async getPackage(id: string): Promise<Package> {
    // Use Phase 2B endpoint - GET /api/v1/package/{id}
    const response = await fetch(`${API_BASE_URL}/api/v1/package/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to get package");
    const data = await response.json();
    return {
      metadata: {
        Name: data.name,
        Version: data.version,
        ID: data.id.toString(),
      },
      data: {
        URL: data.s3_key ? `s3://${data.s3_bucket}/${data.s3_key}` : undefined,
        Content: data.description,
      },
    };
  },

  async uploadPackage(packageData: any): Promise<Package> {
    if (packageData.URL) {
      // Use Phase 2B ingest endpoint instead of autograder
      const response = await fetch(`${API_BASE_URL}/api/v1/package/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ url: packageData.URL }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle 424 quality gate failure with detailed metrics
        if (response.status === 424) {
          let message = result.message || "Quality gate check failed";
          if (result.failing_metrics && Array.isArray(result.failing_metrics)) {
            const metricNames = result.failing_metrics
              .map((m: any) => m.metric || m)
              .filter((m: any) => typeof m === "string")
              .join(", ");
            if (metricNames) {
              message += `\n\nFailing metrics: ${metricNames}`;
            }
          }
          throw new Error(message);
        }
        // Handle other errors
        const errorMessage =
          result.message || result.detail || "Failed to upload package";
        throw new Error(errorMessage);
      }

      // Return format compatible with frontend Package interface
      return {
        metadata: {
          Name: result.model_name,
          Version: "1.0.0",
          ID: result.artifact_id,
        },
        data: { URL: packageData.URL },
      };
    }
    throw new Error("Only URL uploads supported");
  },

  async deletePackage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/package/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete package");
  },

  async getPackageRating(id: string): Promise<PackageRating> {
    // Use BASELINE endpoint - GET /artifact/model/{id}/rate
    const response = await fetch(`${API_BASE_URL}/artifact/model/${id}/rate`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to get rating");
    const data = await response.json();

    // Transform snake_case backend response to frontend format
    // Using the ModelRating response structure from OpenAPI spec
    return {
      BusFactor: data.bus_factor ?? 0,
      Correctness: data.performance_claims ?? 0,
      RampUp: data.ramp_up_time ?? 0,
      ResponsiveMaintainer: data.code_quality ?? 0,
      LicenseScore: data.license ?? 0,
      GoodPinningPractice: data.dataset_quality ?? 0,
      PullRequest: data.reviewedness ?? 0,
      NetScore: data.net_score ?? 0,
      Reproducibility: data.reproducibility ?? 0,
    };
  },

  async ratePackage(id: string, ratings: PackageRating): Promise<void> {
    // Use Phase 2B endpoint - POST /api/v1/package/{id}/rate
    const response = await fetch(`${API_BASE_URL}/api/v1/package/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        ramp_up_time: ratings.RampUp,
        bus_factor: ratings.BusFactor,
        performance_claims: ratings.Correctness,
        license_score: ratings.LicenseScore,
        code_quality: ratings.ResponsiveMaintainer,
        dataset_quality: ratings.GoodPinningPractice,
        reviewedness: ratings.PullRequest,
        reproducibility: ratings.Reproducibility,
        net_score: ratings.NetScore,
      }),
    });
    if (!response.ok) throw new Error("Failed to rate package");
  },

  async getPackageCost(id: string): Promise<PackageCost> {
    return { [id]: { totalCost: 0 } };
  },

  async getPackageHistory(id: string): Promise<PackageHistory[]> {
    return [];
  },

  async searchByRegex(regex: string): Promise<PackageMetadata[]> {
    // Use Phase 2B endpoint - GET /api/v1/package with name_pattern
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("page_size", "100");
    params.append("name_pattern", regex);

    const response = await fetch(`${API_BASE_URL}/api/v1/package?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to search");
    const data = await response.json();
    return data.packages.map((p: any) => ({
      Name: p.name,
      ID: p.id.toString(),
      Version: p.version,
    }));
  },

  async resetRegistry(): Promise<void> {
    // Use Phase 2B endpoint - POST /api/v1/system/reset
    const response = await fetch(`${API_BASE_URL}/api/v1/system/reset`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to reset");
  },

  async ingestModel(url: string, name?: string): Promise<any> {
    const body: { url: string; name?: string } = { url };
    if (name) {
      body.name = name;
    }
    const response = await fetch(`${API_BASE_URL}/api/v1/package/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ingest failed");
    return data;
  },

  async downloadPackage(id: string): Promise<void> {
    // The backend returns a 307 redirect, so we just open the URL directly
    // The browser will follow the redirect to HuggingFace or S3
    const downloadUrl = `${API_BASE_URL}/download/model/${id}`;

    // Open in a new window - the backend will redirect to the actual download
    window.open(downloadUrl, "_blank");
  },
};
