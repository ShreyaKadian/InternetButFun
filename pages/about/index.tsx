"use client";

import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-4">
      <Card className="w-full max-w-2xl">
        <CardBody>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-bold">About InternetButFun</h1>
            <p>
              Social media websites today like Twitter, Instagram, and Reddit are depressing,
              annoying, boring, and littered with ads. InternetButFun is the single solution for
              the decay of the internet.
            </p>
            <p>
              We have a news page with funny and uplifting news, an updates page to share if you
              got 90% in your test or stepped on poop, a posts page, general chat, and a very
              editable profile page that can be your own corner on the internet.
            </p>
            <p>
              This platform isn&apos;t run by greedy megacorps. We don&apos;t care about your
              data. We don&apos;t want your time. We don&apos;t want to be addictive. We want to
              be there when you need the internet to be fun.
            </p>
            <p>
              There&apos;s no feed. You choose what you want to see. You go to the news page for
              good news. You go to the posts page to scroll through all user posts. You go to
              general chat to talk to whoever is online. You go to profiles to explore people.
              And you go to your profile to set up your identity and write whatever you want.
            </p>
            <p>
              This is your internet. Let&apos;s make it fun again. Let&apos;s make it weird again.
              Let&apos;s make it feel again.
            </p>
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
}
