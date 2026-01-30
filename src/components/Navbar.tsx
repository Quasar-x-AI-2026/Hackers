"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Phone } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <nav className="fixed top-4 left-1/2 z-[1000] -translate-x-1/2 w-[95vw] max-w-[1200px] bg-white/70 backdrop-blur-md rounded-full px-5 py-2 shadow-md">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          LOGO
        </Link>

        <NavigationMenu viewport={false}>
          <NavigationMenuList className="flex gap-4">
            {[
              ["/", "Home"],
              ["/about-us", "About Us"],
              ["/book_appointment", "Book Appointment"],
              ["/chat_bot", "Chat Bot"],
              ["/prescriptions", "Prescriptions"],
              ["/dashboard", "Dashboard"],
            ].map(([baseHref, label]) => {
              const href =
                label === "Dashboard" && session?.user?.role
                  ? `${baseHref}/${session.user.role}`
                  : baseHref;

              return (
                <NavigationMenuItem key={label}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={href}>{label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>

        </NavigationMenu>

        {!loading && session?.user?.role === "admin" && (
          <Link href="/admin/dashboard">
            <Button variant="pill">Admin</Button>
          </Link>
        )}

        {!loading && session ? (
          <div className="flex items-center gap-3">
            <p className="hidden sm:block text-gray-700 text-sm">
              Hi,{" "}
              <span className="font-semibold">
                {session.user.username ?? "admin"}
              </span>
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href={'/login'}>
            <Button variant="pill" size="pill" className="hidden md:flex">
              <Phone className="size-4" />
              Login
            </Button>
          </Link>

        )}
      </div>
    </nav>
  );
}
