import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVendorListing, updateVendorListing, deleteVendorListing } from "./vendorProductMutations";
import { VENDOR_QUERY_KEYS } from "../keys";

export const useVendorListingMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.listings() });

  const create = useMutation({
    mutationFn: createVendorListing,
    onSuccess: () => {
      toast.success("Listing submitted — pending admin approval");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create listing"),
  });

  const update = useMutation({
    mutationFn: updateVendorListing,
    onSuccess: () => {
      toast.success("Listing updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update listing"),
  });

  const remove = useMutation({
    mutationFn: deleteVendorListing,
    onSuccess: () => {
      toast.success("Listing deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete listing"),
  });

  return {
    createAsync: create.mutateAsync,
    isCreating: create.isPending,
    updateAsync: update.mutateAsync,
    isUpdating: update.isPending,
    removeAsync: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
};

/** @deprecated Use useVendorListingMutation */
export const useVendorProductMutation = useVendorListingMutation;
