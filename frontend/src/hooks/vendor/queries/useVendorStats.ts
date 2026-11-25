import { useQuery } from "@tanstack/react-query";
import { VENDOR_QUERY_KEYS } from "../keys";
import { getApiUrl } from "@/lib/utils/api";

type VendorStats = {
  listingCount: number;
  liveCount: number;
  pendingApprovalCount: number;
  lifetimeIncome: number;
  pendingIncome?: number;
};

export const useVendorStats = () => {
  const query = useQuery({
    queryKey: VENDOR_QUERY_KEYS.stats(),
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${getApiUrl()}/vendor/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load stats");
      }

      const raw = data.stats as Record<string, unknown>;
      return {
        listingCount: (raw.listingCount ?? raw.productCount ?? 0) as number,
        liveCount: (raw.liveCount ?? 0) as number,
        pendingApprovalCount: (raw.pendingApprovalCount ?? 0) as number,
        lifetimeIncome: (raw.lifetimeIncome ?? 0) as number,
        pendingIncome: (raw.pendingIncome ?? 0) as number,
      } satisfies VendorStats;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
  });

  return {
    ...query,
    stats: query.data ?? {
      listingCount: 0,
      liveCount: 0,
      pendingApprovalCount: 0,
      lifetimeIncome: 0,
      pendingIncome: 0,
    },
  };
};
