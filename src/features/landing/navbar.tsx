"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import IconLogo from "../../../public/logo";
import { LoginDialog } from "../auth/login-dialog";
import { useSession } from "@/lib/auth-client";
export const Navbar = () => {
  const {data:session} = useSession();
  const [open, setOpen] = useState(false);
  return (
    <nav className="backdrop-blur-lg w-full h-14 max-w-4xl flex items-center justify-between sticky top-0 z-50 px-4 ">
      <div className="flex items-center gap-2">
        <IconLogo className="size-6" />
        <p className="text-sm md:text-lg font-bold font-heading">Corusa</p>
      </div>

      <div className="flex items-center gap-2">
        {!session?.user && (
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Login
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Sign Up
            </Button>
          </>
        )}
        </div>
        <LoginDialog open={open} setOpen={setOpen} />
     
    </nav>
  );
};
