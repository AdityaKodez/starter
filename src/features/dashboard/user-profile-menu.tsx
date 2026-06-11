"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { AvatarImage, Avatar as AvatarRoot } from "@/components/ui/avatar";
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
import Avatar from "boring-avatars";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
type UserProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};



export const UserProfileMenu = ({ name, email, image }: UserProfileMenuProps) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg" className="gap-2 px-2">
          <AvatarRoot size="sm">
            {
              image               ? <AvatarImage src={image} alt={name ?? "User"} /> : (
                <Avatar size={32} name={name ?? email ?? "User"} variant="beam" />
              )
            }
          
          </AvatarRoot>
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
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
            <span>Theme</span>
            <ThemeToggle size="icon-xs" className="size-6" />
          </DropdownMenuItem>
        
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void signOut();
              router.push("/");
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
