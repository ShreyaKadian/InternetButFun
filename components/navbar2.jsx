import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export const Navbar2 = () => {
  const [clickedItem, setClickedItem] = useState(null);
  const router = useRouter();

  const handleItemClick = (href) => {
    setClickedItem(href);
    // Reset click effect after 300ms for visual feedback
    setTimeout(() => setClickedItem(null), 300);
  };

  return (
    <div className="fixed top-20 right-0 h-screen w-96 z-40 p-4 flex flex-col justify-between text-center ">
      {/* Top Section */}
      <div className="flex flex-col gap-6 text-center ">
        <div className="flex items-center gap-2">
        </div>

        {/* Nav Items */}
        <nav className="flex shadow-md flex-col gap-2 bg-[#fffce1] w-full rounded-full h-[3rem] text-xl text-center">
          {siteConfig.navMenuItems?.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={clsx(
                "block w-full rounded-full px-3 py-2 text-left hover:bg-[#fffce1] transition-colors transition-all duration-600 ease-out no-underline border-none",
                "data-[active=true]:text-primary data-[active=true]:font-medium",
                clickedItem === item.href ? "scale-110 shadow-lg" : "scale-100 shadow-md",
                router.asPath === item.href ? "scale-100" : "hover:scale-105 hover:shadow-md"
              )}
              onClick={() => handleItemClick(item.href)}
            >
              {item.label}
            </NextLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
      </div>
    </div>
  );
};