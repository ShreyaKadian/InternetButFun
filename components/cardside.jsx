import { Link } from "@heroui/link";
import { Logo, GithubIcon, HeartFilledIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import NextLink from "next/link";
import { Card, CardHeader, CardBody, Image } from "@heroui/react";

export const Cardside = () => {
  return (
    <Card className="fixed right-[2.6rem] top-[11.5rem] h-[32rem] w-[22.5rem] flex-col items-start justify-between p-4 z-40 rounded-3xl bg-[#FFFCE1] text-black">
      <CardHeader className="pb-0 pt-2 px-0 flex-col items-start">
        <h4 className="text-2xl">Friend list </h4>
        <h1>(coming soon)</h1>
      </CardHeader>
      <CardBody className="overflow-visible py-2"></CardBody>
    </Card>
  );
};