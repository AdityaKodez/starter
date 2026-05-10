"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { LogOut, Settings } from "lucide-react";

type UserProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const getInitials = (value?: string | null) => {
  if (!value) return "U";

  const trimmed = value.trim();
  if (!trimmed) return "U";

  if (trimmed.includes("@")) {
    return trimmed.slice(0, 2).toUpperCase();
  }

  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";

  return `${first}${second}`.toUpperCase() || trimmed.slice(0, 2).toUpperCase();
};

export const UserProfileMenu = ({ name, email, image }: UserProfileMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar size="sm">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback>{getInitials(name ?? email)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium sm:inline">
            {name ?? "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{name ?? "Your profile"}</span>
            {email && (
              <span className="text-[11px] text-muted-foreground">{email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void signOut();
            }}
          >
            <LogOut />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
