import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { PLusbutton } from "./icons"; // assume you move your icons here

export default function App() {
  return (
    <Card className="py-4 max-w-[1000px] min-h-[320px] ">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h4 className="font-bold text-large">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus,
          nobis nesciunt quia ipsa perferendis quos ullam unde voluptatum,
          sapiente dolorem, enim sunt earum culpa voluptas odio excepturi
          reprehenderit animi ea!
        </h4>
        <small className="text-default-500">12 Tracks</small>
        <p className="text-tiny uppercase font-bold">Daily Mix</p>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src="https://heroui.com/images/hero-card-complete.jpeg"
          width={270}
        />
      </CardBody>
    </Card>
  );
}
