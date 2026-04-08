"use client";
import { Button } from "@/components/ui/button";
import { IconBook } from "@tabler/icons-react";
import { useState } from "react";
import { LoginDialog } from "../auth/login-dialog";
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="backdrop-blur-lg w-full h-14 max-w-4xl flex items-center justify-between sticky top-0 z-50 px-4 ">
      <div className="flex items-center gap-2">
        <IconBook className="size-6" />
        <p className="text-sm md:text-lg font-bold font-heading">Corusa</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Login
        </Button>
        <Button size="sm" onClick={() => setOpen(true)}>
          Sign Up
        </Button>
      </div>
      <LoginDialog open={open} setOpen={setOpen} />
    </nav>
  );
};
