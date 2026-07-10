"use client";

import { useClerk, useUser } from "@clerk/clerk-react";

import { navigationData } from "@workspace/core/config/navigation";
import { useTranslations } from "@workspace/i18n";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { ChevronsUpDown } from "lucide-react";

interface UserNavUser {
  avatar: string;
  email: string;
  name: string;
}

interface UserNavProps {
  user: UserNavUser;
}

export function UserNav({ user: defaultUser }: UserNavProps) {
  const t = useTranslations("Navigation");
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const displayUser =
    isLoaded && user
      ? {
          name: user.fullName || user.username || "User",
          email: user.primaryEmailAddress?.emailAddress || "",
          avatar: user.imageUrl,
        }
      : defaultUser;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage alt={displayUser.name} src={displayUser.avatar} />
                <AvatarFallback className="rounded-lg">
                  {displayUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm">
                <span className="truncate font-medium">{displayUser.name}</span>
                <span className="truncate text-xs">{displayUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    alt={displayUser.name}
                    src={displayUser.avatar}
                  />
                  <AvatarFallback className="rounded-lg">
                    {displayUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-medium">
                    {displayUser.name}
                  </span>
                  <span className="truncate text-xs">{displayUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigationData.navProfile.map((group, index) => (
              <div className="contents" key={group.id}>
                <DropdownMenuGroup>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.translationKey}>
                        <Icon strokeWidth={2} />
                        {t(item.translationKey as Parameters<typeof t>[0])}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                {index < navigationData.navProfile.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
