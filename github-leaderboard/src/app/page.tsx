import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { useState } from "react";
import Image from "next/image";
import marioRun from "../images/mario-run.png";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();
  const [xPercent, setXPercent] = useState(0); // 0 = left, 100 = right

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#ffd54a] to-[#35aeb0] text-gray-900">
        <div className="flex min-h-screen w-full flex-col items-center justify-start gap-4 px-8 py-12">
          {/* <text>
            "tes"
          </text> */}
          <div className="flex min-h-[20%] h-[100px] w-fullrounded-xl items-center justify-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              RepoBoards!
            </h1>
          </div>
          <div className="relative flex flex-row min-h-[20%] h-[70px] w-full rounded-full">
            <input placeholder="Search Leaderboards!" className="rounded-full w-full h-16 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-500 focus:border-teal-500" type="text" name="query" id="query"/>
            <button type="submit" className="absolute inline-flex items-center h-10 px-4 py-2 text-sm text-white transition duration-150 ease-in-out rounded-full outline-none right-3 top-3 bg-teal-600 sm:px-6 sm:text-base sm:font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              <svg className="-ml-0.5 sm:-ml-1 mr-2 w-4 h-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Search
            </button>
          </div>
          <div className="flex w-full h-full items-center justify-center py-2">
            <div className="flex flex-col w-full h-[100px]">
              <Image src={marioRun} alt="marioRun" style={{ 
                width: "auto", 
                height: "auto", 
                maxWidth: "150px", 
                transform: `translateX(${xPercent}%)`,
                transition: "transform 0.3s ease", // smooth movement 
              }}/>
              <div className="w-full min-w-md bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className={`bg-teal-600 h-full w-[${xPercent}] animate-[progress_2s_infinite_alternate_ease-in-out]`}></div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      {/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </main> */}

    </HydrateClient>
  );
}
