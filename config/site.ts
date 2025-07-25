import {
  PLusbutton,
  HomeIcon,
  ChatBubbleIcon,
  NewspaperIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  UserIcon,
} from "@/components/icons";

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
      icon: HomeIcon,
      bgColor: "#8ae9bc",
    },
    {
      label: "Feed",
      href: "/docs",
      icon: DocumentTextIcon,
      bgColor: "#fdd2b7",
    },
    {
      label: "News",
      href: "/news",
      icon: NewspaperIcon,
      bgColor: "#cfedd2",
    },
    {
      label: "Chat",
      href: "/chat",
      icon: ChatBubbleIcon,
      bgColor: "#ceedd0",
    },
    {
      label: "Updates",
      href: "/blog",
      icon: VideoCameraIcon,
      bgColor: "#fdd2b7",
    },
    {
      label: "About",
      href: "/about",
      icon: DocumentTextIcon,
      bgColor: "#cfedd2",
    },
        {
      label: "Add Post",
      href: "/add_post",
      icon: PLusbutton,
      bgColor: "#fdd2b7",
    },
        {
      label: "Add Updates",
      href: "/add_updates",
      icon: ChatBubbleIcon,
      bgColor: "#cfedd2",
    },

        {
      label: "Auth",
      href: "/auth",
      icon: UserIcon,
      bgColor: "#cfedd2",
    },



  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/second", // Placeholder, overridden in Navbar2
      icon: UserIcon,
    },
    // {
    //   label: "Add Post",
    //   href: "/add_post",
    //   icon: PLusbutton,
    // },
    // {
    //   label: "Add Update",
    //   href: "/add_updates",
    //   icon: PLusbutton,
    // },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
