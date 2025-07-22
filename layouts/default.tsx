import { Toaster } from "react-hot-toast"; // ✅ add this
import NextLink from "next/link";

import { Head } from "./head";

import { Navbar } from "@/components/navbar";
import { Navbar2 } from "@/components/navbar2";
import { Cardside } from "@/components/cardside";

export default function DefaultLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full">
      <Head />

      {/* Fixed sidebars */}
      <Navbar />
      <Navbar2 />
      <Cardside />

      {/* Header */}
      <header className="fixed top-0 left-0 h-20 bg-[#dff6da] border-b border-default-100 flex items-center w-full z-50">
        <NextLink
          className="flex items-center gap-0 h-20 w-[25rem] bg-[#FFFCE1]"
          href="/"
        >
          <span className="font-bold text-[#88e7ba] text-[3.25rem] ml-[2.6rem] font-dancing">
            InternetButFun
          </span>
        </NextLink>

        <div className="flex shadow-sm flex-column mt-3 gap-8 text-base bg-[#FFFCE1] ml-14 px-5 rounded-full py-1 h-8 text-[#595540] w-[25rem]">
          <span className="border-r-2 border-grey pr-5">Fun</span>
          <span className="border-r-2 pr-5">Wholesome</span>
          <span>Sexy</span>
        </div>

        <div className="flex shadow-sm flex-column mt-3 text-base bg-[#FFFCE1] ml-0 w-[8rem] px-5 rounded-full py-1 h-8 text-[#595540] text-center">
          <span className="text-center">Go to the</span>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3 ml-32 mt-3">
          <a
            className="bg-[#63d1c2] shadow-md text-[#FFFCE1] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#50bfb1] hover:scale-105"
            href="https://www.instagram.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Insta
          </a>

          <a
            className="bg-[#dee1ca] shadow-md text-[#a19889] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#c6c9b4] hover:scale-105"
            href="https://twitter.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Twitter
          </a>

          <a
            className="bg-[#fec1a2] shadow-md text-[#d1574a] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#f5a07f] hover:scale-105"
            href="https://github.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Git
          </a>
        </div>
      </header>

      {/* 👇 Here's where the toast system lives */}
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />

      {/* Main content area */}
      <main className="ml-96 mr-96 min-h-screen p-6 pt-20 pb-20">
        {children}
      </main>
    </div>
  );
}
