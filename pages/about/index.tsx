import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col   md:py-10 ">
        <h1 className={`${title()} text-black text-center mt-5`}>About</h1>
<p className="text-black text-2xl mt-12 ">
  You go on Instgram to message a friend...you are drawn into reels. <br /><br />
  You go on twitter to get the news...
  you see the most insufferable people fighting about poltics <br /><br />
  You try reddit...yaah I dont think I have to say smthn about reddit <br /><br />
  Youtube used to be fun...now its all stupid bs designed to keep u watching for as long as possible (oh and also steal all your data  ❤️) <br /><br />
  Now dont get me wrong social media isnt all bad or anything but no one can deny the goal of these companies is not to provide a platform that connects or entertains
  people its only to keep the people on the app as long as possible to show us as many ads as possible (and also steal and sell our data to give us even 
  better ads  ❤️). <br /><br />
  And the worst part is to do this they use every tactic possible doesnt matter how harmful or evil it is. They play on people&apos;s emotions
  they show u content designed make u angry or scared or sad just so u respond to it. A lot of times after using social media you dont leave in a good mood...
  and then to make yourself feel better what do u do .....yup more social media. It literally is forming echo chambers that are radiclising people like crazy. 
  <br /><br />
  The newer apps like tiktok are designed to addict people...people my age spend like 8-9 hours on social media daily which like do with your 
  life as you wish but for a lot of people they dont control their time their phone does....But it wasnt always like this and it doesnt have to be
  like this. InternetButFUn is a project that is built to capture the best parts of the internet; the community and fun without any of the big tech nuiscance.
  here is why we are better -
</p>

<ul className="list-decimal pl-5 mt-10 text-black text-2xl space-y-2">
  <li>We dont use crazy notifications or algorithm tactics to keep u in as long as possible. You are in control here.</li>
  <li>No angry and depressing news in here (you are allowed to make fun of it ofc) but the world is depressing enough already...we only give u wholesome and funny
    news....go to twitter for the depressing shit
  </li>
  <li>No censorship....the only rules are dont be a jerk</li>
  <li>No ads</li>
  <li>Ik its a crazy concept but we will not sell your data for profit</li>
  <li>No external aganda politics or otherwise</li>
</ul>

<p className="text-black text-2xl mt-10 font-bold"> So join us and I promise it will be fun. Some of our features-</p>

<ul className="list-decimal pl-5 mt-10 text-black text-2xl space-y-2">
  <li>Posts to share your thoughts</li>
  <li> News tab with specially cured news to make u laugh or just say W</li>
  <li>Updates tab to just tell us how life has been going uk good and bad. Post if u did well in a test , post if you stepped on dog poop</li>
  <li>Global chat room just to hang out smthn thats missing from every website atp</li>
  <li>Super personalised profile page insead of the generic ones we get today. Tell us your mood, your 5 favourite things , your favourite songs , your
    interest and anything else u want....not as customisable as myspace but we will get there </li>
</ul>

<p className="text-black text-2xl mt-8">
  We are still a work in progress and any sort of support is highly appreciated as the website is
  coded by one stupid developer only (me) <br />
  Feel free to mail for any queries-<br />
  internetbutfun@gmail.com <br />
  shreyakadian124@gmail.com
</p>

                        




        




      </section>
    </DefaultLayout>
  );
}