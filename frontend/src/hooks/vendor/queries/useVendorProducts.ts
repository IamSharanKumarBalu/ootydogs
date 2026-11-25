import { useQuery } from "@tanstack/react-query";
import { VENDOR_QUERY_KEYS } from "../keys";
import { getApiUrl } from "@/lib/utils/api";

export const useVendorListings = () => {
  const query = useQuery({
    queryKey: VENDOR_QUERY_KEYS.listings(),
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${getApiUrl()}/vendor/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load listings");
      }

      return data.products as any[];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
  });

  return {
    ...query,
    listings: query.data ?? [],
  };
};

/** @deprecated Use useVendorListings */
export const useVendorProducts = useVendorListings;
