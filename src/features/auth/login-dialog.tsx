"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signIn } from "@/lib/auth-client";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import IconLogo from "../../../public/logo";
export const LoginDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const result = await signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/",
      });
      if (result?.error) {
        toast.error(result.error.message);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-muted">
          <IconLogo className="size-9" />
        </div>
        <DialogHeader className="text-center">
          <DialogTitle>Continue to Coursa</DialogTitle>
          <DialogDescription>
            Sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="size-4" />
          ) : (
            <IconBrandGoogleFilled className="size-4" />
          )}
          {loading ? "Loading..." : "Continue with Google"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer">Terms</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </DialogContent>
    </Dialog>
  );
};
