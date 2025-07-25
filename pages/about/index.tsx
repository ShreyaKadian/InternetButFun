import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col md:py-10">
        <h1 className={`${title()} text-black text-center mt-5`}>About</h1>

        <p className="text-black text-2xl mt-12">
          You go on Instagram to message a friend... you are drawn into reels. <br /><br />
          You go on Twitter to get the news... you see the most insufferable people fighting about politics. <br /><br />
          You try Reddit... yeah I don't think I have to say anything about Reddit. <br /><br />
          YouTube used to be fun... now it's all stupid BS designed to keep you watching for as long as possible (oh and also steal all your data ❤️). <br /><br />
          Now don't get me wrong — social media isn't all bad. But no one can deny the goal of these companies isn't to connect or entertain us — it's to keep people on the app as long as possible to show us as many ads as possible (and also steal and sell our data to give us even better ads ❤️). <br /><br />
          And the worst part is: to do this, they use every tactic possible, no matter how harmful or evil. They play on people's emotions — showing content designed to make you angry, scared, or sad just so you'll react. A lot of times after using social media, you don't leave in a good mood... and then to feel better, what do you do? Yep, more social media. <br /><br />
          It's literally forming echo chambers that are radicalizing people like crazy. <br /><br />
          The newer apps like TikTok are designed to addict people. People my age spend 8–9 hours a day on social media — and like, do what you want with your life, but a lot of people don't control their time... their phone does. <br /><br />
          But it wasn't always like this. And it doesn't have to be like this. InternetButFun is a project built to capture the best parts of the internet: the community and fun, without any of the big tech nonsense. <br /><br />
          Here's why we're better:
        </p>

        <ul className="list-decimal pl-5 mt-10 text-black text-2xl space-y-2">
          <li>We don't use crazy notifications or algorithm tactics to keep you in. You're in control here.</li>
          <li>No angry or depressing news here (you're allowed to make fun of it, of course), but the world is depressing enough already — we only give you wholesome and funny news. Go to Twitter for the depressing stuff.</li>
          <li>No censorship — the only rule is don't be a jerk.</li>
          <li>No ads.</li>
          <li>I know it's a crazy concept, but we will not sell your data for profit.</li>
          <li>No external agenda — politics or otherwise.</li>
        </ul>

        <p className="text-black text-2xl mt-10 font-bold">
          So join us and I promise it'll be fun. Some of our features:
        </p>

        <ul className="list-decimal pl-5 mt-10 text-black text-2xl space-y-2">
          <li>Posts to share your thoughts.</li>
          <li>News tab with specially curated news to make you laugh or just say "W".</li>
          <li>
            Updates tab to just tell us how life has been going — good or bad. Post if you did well in a test, post if you stepped on dog poop.
          </li>
          <li>Global chat room just to hang out — something that's missing from every website at this point.</li>
          <li>
            Super personalized profile page instead of the generic ones we get today. Tell us your mood, your 5 favorite things, your favorite songs, your interests — anything you want. Not as customizable as MySpace yet, but we're getting there.
          </li>
        </ul>

        <p className="text-black text-2xl mt-8">
          We're still a work in progress and any sort of support is highly appreciated — the website is coded by one stupid developer only (me). <br /><br />
          Feel free to mail for any queries: <br />
          internetbutfun@gmail.com <br />
          shreyakadian124@gmail.com
        </p>
      </section>
    </DefaultLayout>
  );
}
