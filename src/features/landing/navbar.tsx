"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import IconLogo from "../../../public/logo";
import { LoginDialog } from "../auth/login-dialog";
export const Navbar = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <nav className="backdrop-blur-3xl w-full mt-4 h-14 mx-auto flex items-center justify-between sticky top-0 rounded-b-lg z-50 px-4">
      <div className="flex items-center gap-2">
        <IconLogo className="size-6" />
        <p className="text-sm md:text-lg font-bold font-heading">Revind</p>
      </div>

      <div className="flex items-center gap-2">
        {!session?.user ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Login
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Sign Up
            </Button>
          </>
        ) : (
          <Avatar>
            <AvatarImage
              src={session.user.image || undefined}
              sizes="20"
              alt={session.user.name || "User Avatar"}
            />
            <AvatarFallback>
              {session.user.name ? session.user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <LoginDialog open={open} setOpen={setOpen} />
    </nav>
  );
};
