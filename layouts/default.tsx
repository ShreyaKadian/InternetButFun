import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import NextLink from "next/link";
import { Head } from "./head";
import { Navbar } from "@/components/navbar";
import { Navbar2 } from "@/components/navbar2";
import { Cardside } from "@/components/cardside";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="relative min-h-screen w-full">
      <Head />

      <Navbar />
      <Navbar2 />
      <Cardside />

      <header className="fixed top-0 left-0 h-20 bg-[#dff6da] flex items-center w-full z-50">
        <NextLink
          className="flex items-center gap-0 h-20 w-[25rem] bg-[#FFFCE1]"
          href="/"
        >
          <span className="font-bold text-[#88e7ba] text-[3.25rem] ml-[2.6rem] font-dancing">
            InternetButFun
          </span>
        </NextLink>    

        <div className="flex-1 flex justify-center items-center">
          <div className="flex shadow-sm flex-column mt-3 gap-8 text-base bg-[#FFFCE1] px-5 rounded-full py-1 h-8 text-[#595540]">
            <span className="border-r-2 border-grey pr-5">Fun</span>
            <span className="border-r-2 pr-5">Wholesome</span>
            <span>Vibe</span>
          </div>

          <div className="flex shadow-sm flex-column mt-3 text-base bg-[#FFFCE1] ml-[0.2rem] w-[8rem] px-5 rounded-full py-1 h-8 text-[#595540] text-center">
            <span className="text-center">All In One</span>
          </div>
        </div>

        <div className="flex gap-3 mr-[2.6rem] mt-3">
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

      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />

      <main className="flex justify-center min-h-screen pt-20 pb-20">
        <div className="w-full max-w-2xl px-6">
          {children}
        </div>
      </main>
    </div>
  );
}