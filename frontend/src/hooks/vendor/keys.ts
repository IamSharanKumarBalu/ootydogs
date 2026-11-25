export const VENDOR_QUERY_KEYS = {
  all: ["vendor"] as const,
  stats: () => [...VENDOR_QUERY_KEYS.all, "stats"] as const,
  listings: () => [...VENDOR_QUERY_KEYS.all, "listings"] as const,
  orders: () => [...VENDOR_QUERY_KEYS.all, "orders"] as const,
  transactions: () => [...VENDOR_QUERY_KEYS.all, "transactions"] as const,
};
