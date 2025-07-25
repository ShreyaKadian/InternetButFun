import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { auth, onAuthStateChanged } from "@/firebase/firebase";
import clsx from "clsx";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export const Navbar2 = () => {
  const [clickedItem, setClickedItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const getToken = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        return token;
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    }
    return null;
  };

  const fetchCurrentUserProfile = async (user) => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available");
        return;
      }

      const response = await fetch("http://localhost:8000/Auth", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Auth endpoint response:", data);
        
        setUserProfile(data);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed in Navbar2:", user ? `User: ${user.email}` : "No user");
      
      if (user) {
        setCurrentUser(user);
        await fetchCurrentUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleItemClick = async (href, isProfile = false) => {
    setClickedItem(href);
    setTimeout(() => setClickedItem(null), 300);

    if (isProfile) {
      await handleProfileClick();
    }
  };

  const handleProfileClick = async () => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch("http://localhost:8000/profile", {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log("Profile data:", profileData);
        
        if (profileData.username) {
          console.log("Navigating to profile:", profileData.username);
          router.push(`/${profileData.username}`);
        } else {
          console.log("No username in profile data");
          alert("Profile not complete. Please complete your profile first.");
        }
      } else {
        console.error("Failed to fetch profile");
        alert("Failed to load profile. Please try again.");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Error accessing profile.");
    }
  };

  const getProfileLabel = () => {
    if (authLoading) return "Loading...";
    if (!currentUser) return "Login";
    if (userProfile && userProfile.username) return `@${userProfile.username}`;
    return "Profile";
  };

  return (
    <div className="fixed top-32 right-[2.6rem] w-[22.5rem] z-40">
      <nav className="flex shadow-md flex-col gap-2 bg-[#fffce1] w-full rounded-full text-2xl text-center text-black text-bold">
        {siteConfig.navMenuItems?.map((item) => {
          const isProfileItem = item.label.toLowerCase() === "profile";
          const displayLabel = isProfileItem ? getProfileLabel() : item.label;
          const actualHref = isProfileItem ? "#" : item.href; // Use # for profile to prevent default navigation

          return (
            <div
              key={item.href}
              className={clsx(
                "block w-full rounded-full px-3 py-2 text-left hover:bg-[#fffce1] transition-colors transition-all duration-600 ease-out cursor-pointer border-none",
                "data-[active=true]:text-primary data-[active=true]:font-medium",
                clickedItem === item.href
                  ? "scale-110 shadow-lg"
                  : "scale-100 shadow-md",
                router.asPath === item.href
                  ? "scale-100"
                  : "hover:scale-105 hover:shadow-md",
              )}
              onClick={() => handleItemClick(item.href, isProfileItem)}
            >
              {displayLabel}
            </div>
          );
        })}
      </nav>
    </div>
  );
};