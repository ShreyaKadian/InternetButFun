"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
} from "@heroui/navbar";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import toast from "react-hot-toast";

export const Navbar = () => {
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      try {
        await signOut(auth);
        setUser(null);
        router.push("/");
        toast("Logged out", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#FF0000",
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "16px 24px",
            fontSize: "18px",
            fontWeight: "600",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
            zIndex: 10001,
            border: "2px solid #FFFFFF",
            minWidth: "200px",
            textAlign: "center",
          },
        });
      } catch (error: unknown) {
        console.error("Logout failed:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Logout failed: ${message}`, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#FF0000",
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "16px 24px",
            fontSize: "18px",
            zIndex: 10001,
          },
        });
      }
    } else {
      router.push("/auth");
    }
  };

  return (
    <HeroUINavbar
      className="fixed left-0 top-28 h-screen w-96 flex-col items-start justify-between p-4 z-40 font-Overpass"
      isBlurred={true}
    >
      <NavbarContent className="flex-col items-start gap-6">
        <div className="flex flex-col gap-2 w-full">
          {siteConfig.navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.asPath === item.href;
            const isAuthItem = item.label.toLowerCase() === "auth";
            const displayLabel = isAuthItem
              ? user
                ? "Logout"
                : "Login"
              : `#${item.label}`;

            return (
              <button
                key={item.href}
                type="button"
                className={clsx(
                  "w-full rounded-2xl h-[3.55rem] shadow-md transition-all duration-600 ease-out",
                  clickedItem === item.href ? "scale-110 shadow-lg" : "scale-100 shadow-md",
                  isActive ? "shadow-lg" : "hover:scale-105 hover:shadow-md"
                )}
                style={{ backgroundColor: item.bgColor }}
                onClick={() => {
                  setClickedItem(item.href);
                  setTimeout(() => setClickedItem(null), 300);
                  if (isAuthItem) {
                    handleAuthClick();
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                <div
                  className={clsx(
                    "flex items-center gap-2 w-full rounded px-3 py-2 text-left hover:bg-opacity-80",
                    isActive ? "text-primary font-medium" : ""
                  )}
                  style={{ backgroundColor: "transparent", color: "#000" }}
                >
                  {Icon && <Icon size={50} />}
                  <span
                    className={clsx(
                      "text-2xl",
                      isActive ? "underline underline-offset-4 decoration-2" : ""
                    )}
                  >
                    {displayLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </NavbarContent>
    </HeroUINavbar>
  );
};
