import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import {Navbar2} from "@/components/navbar2"
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";


export default function IndexPage() {
  return (
    <DefaultLayout>
      <Navbar2></Navbar2>
    </DefaultLayout>
  );
}
