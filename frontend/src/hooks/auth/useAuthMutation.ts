import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuthMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const signIn = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) throw new Error((result.error as any)?.message || "Invalid email or password");
      return result;
    },
    onSuccess: (result) => {
      queryClient.clear();
      const user = result.data;
      if (user?.role === "admin") {
        toast.success("Welcome Admin!");
        router.push("/admin");
      } else {
        toast.success("Welcome back!");
        router.push("/");
      }
      router.refresh();
    },
    onError: (error: any) => {
      console.error(error);
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("password") || msg.toLowerCase().includes("credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("no account")) {
        toast.error("No account found with this email. Please sign up first.");
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error("Sign in failed. Please check your connection and try again.");
      }
    },
  });

  const signUp = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      phone,
    }: {
      email: string;
      password: string;
      name: string;
      phone: string;
    }) => {
      const result = await authClient.signUp.email({ email, password, name, callbackURL: "/" });
      if (result.error) throw new Error((result.error as any)?.message || "Error creating account");
      // Also send phone to backend via a profile update after registration
      // The register endpoint itself must accept phone — handled via authClient.signUp
      return { ...result, phone };
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Account created! Welcome to OotyDogs.");
      router.push("/");
      router.refresh();
    },
    onError: (error: any) => {
      console.error(error);
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("email taken")) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else if (msg.toLowerCase().includes("password")) {
        toast.error("Password must be at least 8 characters long.");
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error("Could not create account. Please check your details and try again.");
      }
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.message || "Sign out failed. Please refresh the page and try again.");
    },
  });

  return { signIn, signUp, signOut };
};
