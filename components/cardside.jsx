import { Link } from "@heroui/link";
import { Logo, GithubIcon, HeartFilledIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import NextLink from "next/link";
import {Card, CardHeader, CardBody, Image} from "@heroui/react";


export const Cardside = () => {
  return (
        <Card className="fixed right-4 top-44 h-[32rem] w-[22rem] mt-2 flex-col items-start justify-between  p-4 z-40 rounded-3xl bg-[#FFFCE1]">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h4 className="font-bold text-large">Frontend Radio</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
      </CardBody>
    </Card>

  );
};