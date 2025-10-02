"use client";

import { api } from "~/trpc/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import marioRun from "../../images/mario-run.png";
import pp_icon from "../../images/pp_icon.svg"
import { useInactivity } from "../helper/inactivity";
import { postLeaderboardToDiscord } from "../api/discord/discordhook";
import { handleRegisterCommands } from "~/server/api/discordbot";

export function Leaderboards() {
  const [Clicked, setCliked] = useState<{
    author: string,
    avatarUrl: string | undefined,
    qualityScore: number,
    reasoning: string,
    totalCommits: number,
    linesAdded: number,
    linesDeleted: number
  }>({author:"", avatarUrl: "", qualityScore: 0, reasoning: "", totalCommits: 0, linesAdded: 0, linesDeleted: 0});
  const [repoName, setRepoName] = useState("");
  const [searchRepo, setSearchRepo] = useState("");
  const [discordChannelId, setDiscordChannelId] = useState('');
  const [discordGuildId, setDiscordGuildId] = useState('');
  const [hasAdded, setHasAdded] = useState(false);  

  const { data: commits, isLoading, refetch } = api.github.getCommits.useQuery(
    { repoFullName: searchRepo },
    { 
      enabled: !!searchRepo,
      refetchOnWindowFocus: false
    } 
  );

  const [startWipe, setStartWipe] = useState(false);
  useEffect(() => {
    if (commits?.length) {
      const timer = setTimeout(() => setStartWipe(true), 500); // 500ms delay
      return () => clearTimeout(timer);
    }
  }, [commits]);

  const [infoClicked, setInfoClicked] = useState<{
    bool: boolean;
    author: string;
  }>({bool: false, author: ""});

  console.log(hasAdded);
  const botInviteUrl = 'https://discord.com/oauth2/authorize?client_id=1422503631671791658&permissions=2147502080&integration_type=0&scope=bot';
  const isInactive = useInactivity(30 * 60 * 1000);
  // uncomment to check
  // if (isInactive) {
  //   console.log("User is inactive");
  // }

  useEffect(() => {
    if (!searchRepo) return;
    if (isInactive) {
      if (window.confirm("You've been inactive, leaderboard may have been updated, Refresh now?")) {
        refetch();
      }
    }
    const interval = setInterval(() => {
      refetch();
    }, 30 * 60* 1000);

    return () => clearInterval(interval);
  }, [searchRepo, isInactive, refetch]);

  const handleSearch = () => {
    setSearchRepo(repoName);
  };

  const handleKeyDown1 = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Prevent default form submission behavior if inside a form
      console.log("enter pressed");
      handleSearch();
    }
  };

  const handleKeyDown2 = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Prevent default form submission behavior if inside a form
      console.log("enter pressed");
      postLeaderboardToDiscord(searchRepo, discordChannelId);
    }
  };

  const handleKeyDown3 = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Prevent default form submission behavior if inside a form
      console.log("enter pressed");
      handleRegisterCommands(discordGuildId);
    }
  };

  return (
    <main className="flex min-h-screen min-w-[1100px] w-full flex-col items-center justify-center bg-gradient-to-b from-[#ffd54a] to-[#35aeb0] text-gray-900 overflow-hidden">
      <div className="flex min-h-screen w-full flex-col items-center justify-start gap-4 px-8 py-12">
        {/* Title */}
        <div className="flex h-[100px] w-full rounded-xl items-center justify-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            RepoBoards!
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex flex-row h-[50px] max-w-[1000px] w-full rounded-full mt-8 mb-8">
          <input 
            placeholder="Search Leaderboards!" 
            className="rounded-full w-full h-16 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-500 focus:border-teal-500" 
            type="text" 
            name="query" 
            id="query"
            value={repoName}
            onKeyDown={handleKeyDown1}
            onChange={(e) => setRepoName(e.target.value)}
            />
          <button type="submit" 
            className="absolute inline-flex items-center h-10 px-4 py-2 text-sm text-white transition duration-150 ease-in-out rounded-full outline-none right-3 top-3 bg-teal-600 sm:px-6 sm:text-base sm:font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            onClick={handleSearch}
            >
            <svg className="-ml-0.5 sm:-ml-1 mr-2 w-4 h-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Search
          </button>
        </div>

        {/* No Repositories */}
        {!commits && !isLoading && 
          <div className="flex w-full h-full items-center justify-center py-2 text-md">
            <p className="w-1/2 text-center text-5xl text-gray-700 font-extrabold tracking-tight">Add your Github Repositories to see leaderboards!</p>
          </div>
        }

        {/* Loading Commits */}
        {isLoading && 
          <div className='flex space-x-2 justify-center items-center h-full dark:invert'>
            <span className='sr-only'>Loading...</span>
            <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
          </div>
        }

        {/* Loaded but empty */}
        {commits && commits.length === 0 && <p>No commits found</p>}

        {/* Loaded and shown */}
        {commits && commits.length > 0 && (
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex max-w-[1000px] w-full min-w-[1000px] h-[250px] items-start justify-center rounded-xl py-4">
            {/* Leaderboards Progress Bar */}
            <div 
              className="absolute inset-0 bg-center bg-cover rounded-xl border-2"
              style={{ backgroundImage: `url(/bg_2.svg)`,
              backgroundSize: "100% 100%",}}
            />
            <div
              className="absolute inset-0 bg-center bg-cover rounded-xl border-2 transition-[clip-path] duration-[1500ms] ease-in-out"
              style={{
                backgroundImage: `url(/bg_1.svg)`,
                backgroundSize: "100% 100%",
                clipPath: startWipe
                  ? `inset(0 ${
                      100 - ((commits?.[commits.length - 1]?.qualityScore ?? 0) / 10)
                    }% 0 0)`
                  : "inset(0 100% 0 0)",
              }}
            />

            {/* Leaderboards Legends */}
            <div className="relative flex flex-col w-full h-[210px] items-start justify-end">
              {commits.sort((a, b) => a.qualityScore - b.qualityScore).map((c) => (
                <div key={c.author}>
                  <div
                    className={`absolute flex flex-col bottom-4 group ${startWipe ? "transition-all duration-1500 ease-in-out" : ""} `}
                    style={{
                      left: startWipe ? `${Math.min(960, Math.max(40, c.qualityScore)) / 10}%` : "4%",
                    }}
                  >
                    <span className="w-[58%] opacity-0 group-hover:opacity-90 transition bg-gray-900 items-center justify-center text-center text-white text-xs rounded px-2 py-1 mb-1 whitespace-nowrap"
                      style={{
                        transform: "translateX(-50%)",
                      }}>
                      {`${c.author.length > 14 ? c.author.substring(0, 14) : c.author}`}
                    </span>
                    <Image
                      src={marioRun}
                      alt="marioRun"
                      className="group-hover:-translate-y-2 transition ease-in-out"
                      width={160}
                      height={120}
                      style={{
                        maxWidth: "180px",
                        width: "auto",
                        height: "auto",
                        cursor: "pointer",
                        transform: "translateX(-45%)",
                      }}
                      onClick={() => setCliked(c)}
                    />
                  </div>
                  <div className="absolute w-full min-w-md h-8  mt-12">
                    <div className={`flex flex-row items-end justify-end h-full w-full animate-[progress_2s_infinite_alternate_ease-in-out]`}>
                      <div className="absolute flex bg-white w-[60px] h-[35px] rounded-lg border-2 items-center justify-center transition-all duration-1500 ease-in-out"
                        style={{
                          left: startWipe ? `${Math.min(960, Math.max(40, c.qualityScore)) / 10}%` : "4%",
                          transform: "translateX(-50%)"
                        }}>
                        <p>{c.qualityScore*10}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          

          <div className="flex h-[100px] w-full rounded-xl items-center justify-center mt-20">
            <h1 className="text-4xl font-extrabold tracking-tight ">
              {repoName.substring(repoName.indexOf('/') + 1) + "\'s " + "Leaderboards"}
            </h1>
          </div>

          {/* Details */}
          <div className="flex flex-col w-[750px] mt-2 space-y-4">
            <div className="flex flex-col shadow-lg bg-gray-200 items-center justify-between p-6 gap-2 rounded-xl">
              <div className="flex flex-row w-full items-center justify-between gap-2">
                <div className="w-[100px] text-start font-bold">
                  <img
                    src={pp_icon.src}
                    alt={`${pp_icon.src}'s avatar`}
                    className="w-16 h-16 rounded-full border"
                  />
                </div>
                <div className="w-[400px] text-start font-bold">Contestants</div>
                <div className="w-[125px] text-center font-bold">
                  <strong>Points</strong>
                </div>
                <div className="w-[125px] text-center font-bold">
                  <strong>+Commits</strong>
                </div>
              </div>
            </div>
            {Clicked.author != "" &&
              <div key={Clicked.author} 
                className="flex flex-col shadow-sm hover:shadow-lg hover:scale-103 transition ease-in-out bg-gray-200 items-center justify-between p-6 gap-4 rounded-xl cursor-pointer"
                onClick={() => infoClicked.author != Clicked.author ? setInfoClicked({bool: true, author: Clicked.author}) : setInfoClicked({bool: false, author: ""})}
                >
                <div className="flex flex-row w-full items-center justify-between gap-2">
                  <div className="w-[100px] text-start font-bold">
                    <img
                      src={Clicked.avatarUrl}
                      alt={`${Clicked.author}'s avatar`}
                      className="w-16 h-16 rounded-full border"
                    />
                  </div>
                  <div className="w-[400px] text-start font-bold">{Clicked.author}</div>
                  <div className="w-[125px] text-center font-bold">
                    <strong>{Clicked.qualityScore ?? "N/A"}</strong>
                  </div>
                  <div className="w-[125px] text-center font-bold">
                    <strong>{Clicked.totalCommits}</strong>
                  </div>
                </div>
                {infoClicked.bool && infoClicked.author == Clicked.author &&
                  <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out`}
                    style={{
                      maxHeight:
                        infoClicked.bool && infoClicked.author == Clicked.author
                          ? "500px" // large enough to fit content
                          : "0px",
                      opacity:
                        infoClicked.bool && infoClicked.author == Clicked.author ? 1 : 0,
                    }}>
                    <p>
                      <strong>Reasoning:</strong> {Clicked.reasoning}
                    </p>
                    <p>
                      <strong>Added Lines:</strong> +{Clicked.linesAdded}
                    </p>
                    <p>
                      <strong>Deleted Lines:</strong> -{Clicked.linesDeleted}
                    </p>
                  </div>
                }
              </div>
            }
            {commits.filter(c => c.author != Clicked.author).sort((a, b) => b.qualityScore - a.qualityScore).map((c) => (
              <div key={c.author} className="flex flex-col shadow-sm hover:shadow-lg hover:scale-103 transition ease-in-out bg-gray-200 items-center justify-between p-6 gap-4 rounded-xl cursor-pointer"
                onClick={() => infoClicked.author != c.author ? setInfoClicked({bool: true, author: c.author}) : setInfoClicked({bool: false, author: ""})}
                >
                <div className="flex flex-row w-full items-center justify-between gap-2">
                  <div className="w-[100px] text-start font-bold">
                    <img
                      src={c.avatarUrl ? c.avatarUrl : pp_icon.src}
                      alt={`${c.author}'s avatar`}
                      className="w-16 h-16 rounded-full border"
                    />
                  </div>
                  <div className="w-[400px] text-start font-bold">{c.author.length > 25 ? c.author.substring(0, 25) + "..." : c.author}</div>
                  <div className="w-[125px] text-center font-bold">
                    <strong>{c.qualityScore ?? "N/A"}</strong>
                  </div>
                  <div className="w-[125px] text-center font-bold">
                    <strong>{c.totalCommits}</strong>
                  </div>
                </div>
                {infoClicked.bool && infoClicked.author == c.author &&
                  <div className="gap-2 transition ease-in-out">
                    <p>
                      <strong>Reasoning:</strong> {c.reasoning}
                    </p>
                    <p>
                      <strong>Added Lines:</strong> +{c.linesAdded}
                    </p>
                    <p>
                      <strong>Deleted Lines:</strong> -{c.linesDeleted}
                    </p>
                  </div>
                }
                </div>
            ))}
          </div>

          <div className="flex flex-col w-full items-center justify-center gap-4 mt-20 bg-gray-200 p-4 rounded-xl">
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-xl font-extrabold">Connect to Discord!</p>
            </div>
            <div className="flex flex-col w-full items-center justify-center gap-2">
              <div className="flex flex-row w-full items-center justify-between gap-2 mt-2">
                <strong>1. Add our bot -Hacka to your server</strong>
                <button
                  onClick={() => {
                    if (!hasAdded) {
                      if (window.confirm("You need to invite the bot first. Do you want to open the invite link?")) {
                        window.open(botInviteUrl, "_blank");
                        setHasAdded(true);
                      }
                    } else {
                      // postLeaderboardToDiscord(searchRepo, discordChannelId);
                      window.open(botInviteUrl, "_blank")
                    }
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  Hey, I'm Hacka!
                </button>
              </div>
              <div className="flex flex-row w-full items-center justify-between gap-2 mt-2">
                <strong className="w-[75%]">2. Fill the Channel ID of the channel you want Hacka to live</strong>
                <div className="flex flex-row w-[25%] items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Discord Channel ID"
                    value={discordChannelId}
                    onChange={(e) => setDiscordChannelId(e.target.value)}
                    className="min-w-[50%] w-full border p-2 rounded"
                    onKeyDown={handleKeyDown2}
                  />
                  {discordChannelId &&
                    <div className="w-[50%] flex items-center gap-2">
                      <button
                        onClick={() => postLeaderboardToDiscord(searchRepo, discordChannelId)}
                        className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                      >
                        Post
                      </button>
                    </div>
                  } 
                </div>
              </div>
              
              <div className="flex flex-row w-full items-center justify-between gap-2 mt-2">
                <strong className="w-[75%]">3. Fill the Server ID of corresponding server to make /commands available</strong>
                <div className="flex flex-row w-[25%] items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Discord Server ID"
                    className="min-w-[50%] w-full border p-2 rounded"
                    value={discordGuildId}
                    onChange={(e) => setDiscordGuildId(e.target.value)}
                    onKeyDown={handleKeyDown3}
                  />
                  {discordGuildId &&
                    <div className="w-[50%] flex items-center gap-2">
                      <button
                        onClick={() => handleRegisterCommands(discordGuildId)}
                        className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                      >
                        Commands
                      </button>
                    </div>
                  } 
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
    // <main className="flex min-h-screen min-w-[1100px] w-full flex-col items-center justify-center bg-gradient-to-b from-[#ffd54a] to-[#35aeb0] text-gray-900 overflow-hidden">
    //   <div className="flex min-h-screen w-full flex-col items-center justify-start gap-4 px-8 py-12">
    //     {/* Title */}
    //     <div className="flex h-[100px] w-full rounded-xl items-center justify-center">
    //       <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
    //         RepoBoards!
    //       </h1>
    //     </div>

    //     {/* Search Bar */}
    //     <div className="relative flex flex-row h-[50px] max-w-[1000px] w-full rounded-full mt-8 mb-8">
    //       <input 
    //         placeholder="Search Leaderboards!" 
    //         className="rounded-full w-full h-16 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-500 focus:border-teal-500" 
    //         type="text" 
    //         name="query" 
    //         id="query"
    //         value={repoName}
    //         onChange={(e) => setRepoName(e.target.value)}
    //         />
    //       <button onClick={handleSearch} type="submit" className="absolute inline-flex items-center h-10 px-4 py-2 text-sm text-white transition duration-150 ease-in-out rounded-full outline-none right-3 top-3 bg-teal-600 sm:px-6 sm:text-base sm:font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
    //         <svg className="-ml-0.5 sm:-ml-1 mr-2 w-4 h-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    //         </svg>
    //         Search
    //       </button>
    //     </div>

    //     {/* No Repositories */}
    //     {!commits && !isLoading && 
    //       <div className="flex w-full h-full items-center justify-center py-2 text-md">
    //         <p className="w-1/2 text-center text-5xl text-gray-700 font-extrabold tracking-tight">Add your Github Repositories to see leaderboards!</p>
    //       </div>
    //     }

    //     {/* Loading Commits */}
    //     {isLoading && <p>Loading commits...</p>}

    //     {/* Loaded but empty */}
    //     {commits && commits.length === 0 && <p>No commits found</p>}

    //     {/* Loaded and shown */}
    //     {commits && commits.length > 0 && (
    //     <div className="">
    //       <div className="relative flex max-w-[1000px] w-full min-w-[1000px] h-[250px] bg-black items-start justify-center bg-gray-100 rounded-xl py-4">
    //         {/* Leaderboards Progress Bar */}
    //         <div 
    //           className="absolute inset-0 bg-center bg-cover rounded-xl"
    //           style={{ backgroundImage: `url(${bg2.src})`,
    //           backgroundSize: "100% 100%",}}
    //         />
    //         <div
    //           className="absolute inset-0 bg-center bg-cover transition-all duration-500 rounded-xl"
    //           style={{
    //             backgroundImage: `url(${bg1.src})`,
    //             backgroundSize: "100% 100%",
    //             clipPath: `inset(0 ${(10-commits[commits.length-1]?.qualityScore)*10}% 0 0)`,
    //           }}
    //         />
    //         {/* Leaderboards Legends */}
    //         <div className="relative flex flex-col w-full h-[210px] items-start justify-end">
    //           <div className="mt-2">
    //             <button
    //                onClick={() => {
    //                 if (!hasAdded) {
    //                   if (window.confirm("You need to invite the bot first. Do you want to open the invite link?")) {
    //                     window.open(botInviteUrl, "_blank");
    //                     setHasAdded(true);
    //                   }
    //                 } else {
    //                   postLeaderboardToDiscord(searchRepo, discordChannelId);
    //                 }
    //               }}
    //               className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
    //             >
    //               Post to Discord
    //             </button>
    //             <input
    //               type="text"
    //               placeholder="Discord Channel ID"
    //               value={discordChannelId}
    //               onChange={(e) => setDiscordChannelId(e.target.value)}
    //               className="border p-2 rounded mr-2"
    //             />
    //           </div>
    //           <div className="flex items-center gap-2 mt-4">
    //             <button
    //               onClick={() => window.open(botInviteUrl, "_blank")}
    //               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //             >
    //               Add Bot to Your Server
    //             </button>
    //           </div>

    //           <input
    //             type="text"
    //             placeholder="Enter your server's Guild ID"
    //             className="bg-red-100"
    //             value={discordGuildId}
    //             onChange={(e) => setDiscordGuildId(e.target.value)}
    //           />
    //           <button onClick={() => handleRegisterCommands(discordGuildId)}>
    //             Register Commands
    //           </button>
    //           {commits.sort((a, b) => a.qualityScore - b.qualityScore).map((c) => (
    //             <div key={c.author}>
    //               <Image 
    //                 src={marioRun} 
    //                 alt="marioRun" 
    //                 className="absolute bottom-4 idle-animation"
    //                 style={{ 
    //                   width: "auto", 
    //                   height: "auto", 
    //                   maxWidth: "180px", 
    //                   left: `${(c.qualityScore*10) < 4 ? 4 : (c.qualityScore*10) > 97 ? 97 : (c.qualityScore * 10)}%`,
    //                   transform: `translateX(-45%)`,
    //                   transition: "transform 0.3s ease", // smooth movement 
    //                 }}
    //                 onClick={(e) => {setCliked(c)}}
    //               />
    //               <div className="absolute w-full min-w-md h-8  mt-9">
    //                 <div className={`flex flex-row items-end justify-end h-full w-full animate-[progress_2s_infinite_alternate_ease-in-out]`}>
    //                   <div className="absolute flex bg-white w-[60px] h-[35px] rounded-lg items-center justify-center"
    //                     style={{
    //                         left: `${(c.qualityScore*10) < 4 ? 4 : (c.qualityScore*10) > 96 ? 96 : (c.qualityScore*10)}%`,
    //                         transform: "translateX(-50%)"
    //                     }}>
    //                     <p>{c.qualityScore*10}</p>
    //                   </div>
    //                 </div>
    //               </div>

    //               <style jsx>{`
    //                 @keyframes idle {
    //                   0%, 100% {
    //                     transform: translateX(0) rotate(0deg);
    //                   }
    //                   25% {
    //                     transform: translateX(-3px) rotate(-1deg);
    //                   }
    //                   50% {
    //                     transform: translateX(0) rotate(0.5deg);
    //                   }
    //                   75% {
    //                     transform: translateX(3px) rotate(1deg);
    //                   }
    //                 }
    //                 .idle-animation {
    //                   animation: idle 2.5s ease-in-out infinite;
    //                 }
    //               `}</style>
    //             </div>
    //           ))}
    //         </div>
    //       </div>
            
    //       {/* Details */}
    //       <div className="flex flex-col w-[1000px] mt-20 space-y-4">
    //         {Clicked.author != "" &&
    //           <div key={Clicked.author} className="border p-4 rounded-xl">
    //             <p className="font-bold">{Clicked.author}</p>
    //              <img
    //                 src={Clicked.avatarUrl}
    //                 alt={`${Clicked.author}'s avatar`}
    //                 className="w-16 h-16 rounded-full border"
    //             />
    //             <p>
    //               <strong>Score:</strong> {Clicked.qualityScore ?? "N/A"}
    //             </p>
    //             <p>
    //               <strong>Reasoning:</strong> {Clicked.reasoning}
    //             </p>
    //             <p>
    //               <strong>TotalCommits:</strong> +{Clicked.totalCommits}
    //             </p>
    //             <p>
    //               <strong>+:</strong> +{Clicked.linesAdded}
    //             </p>
    //             <p>
    //               <strong>-:</strong> -{Clicked.linesDeleted}
    //             </p>
    //           </div>
    //         }
    //         {commits.filter(c => c.author != Clicked.author).sort((a, b) => b.qualityScore - a.qualityScore).map((c) => (
    //           <div key={c.author} className="border p-4 rounded-xl">
    //             <p className="font-bold">{c.author}</p>
    //             {
    //               !c.avatarUrl ? null : <img
    //                 src={c.avatarUrl}
    //                 alt={`${c.author}'s avatar`}
    //                 className="w-16 h-16 rounded-full border"
    //             />
    //             }
    //             <p>
    //               <strong>Score:</strong> {c.qualityScore ?? "N/A"}
    //             </p>
    //             <p>
    //               <strong>Reasoning:</strong> {c.reasoning}
    //             </p>
    //             <p>
    //               <strong>TotalCommits:</strong> +{c.totalCommits}
    //             </p>
    //             <p>
    //               <strong>+:</strong> +{c.linesAdded}
    //             </p>
    //             <p>
    //               <strong>-:</strong> -{c.linesDeleted}
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //     )}
    //     /* {Scores.length > 0 
    //       ? Scores.map((score) => (
    //       <div key={score.name} className="relative flex w-[80%] h-[150px] items-start justify-center py-2 bg-gray-100 rounded-xl px-4 py-4">
    //         <div 
    //           className="absolute inset-0 bg-center bg-[1000px] rounded-xl"
    //           style={{ backgroundImage: `url(${bg2.src})`}}
    //         >
    //         </div>
    //         <div
    //           className="absolute inset-0 bg-center bg-cover transition-all duration-500 rounded-xl"
    //           style={{
    //             backgroundImage: `url(${bg1.src})`,
    //             clipPath: `inset(0 ${100-score.percentage}% 0 0)`,
    //           }}
    //         />
    //         <div className="relative flex flex-col w-full h-[140px] items-start justify-end">
    //           <Image 
    //             src={marioRun} 
    //             alt="marioRun" 
    //             className="absolute bottom-16"
    //             style={{ 
    //               width: "auto", 
    //               height: "auto", 
    //               maxWidth: "180px", 
    //               left: `${score.percentage < 2 ? 2 : score.percentage > 98 ? 98 : score.percentage}%`,
    //               transform: `translateX(-45%)`,
    //               transition: "transform 0.3s ease", // smooth movement 
    //             }}/>
    //           <div className="w-full min-w-md bg-gray-100 rounded-full h-4 overflow-hidden ">
    //             <div className={`bg-teal-600 h-full animate-[progress_2s_infinite_alternate_ease-in-out]`}
    //               style={{ width: `${score.percentage}%` }} 
    //             ></div>
    //           </div>
    //           <div className="w-full min-w-md h-8 overflow-hidden mt-4">
    //             <div className={`flex flex-row items-end justify-end h-full w-full animate-[progress_2s_infinite_alternate_ease-in-out]`}>
    //               <div className="absolute flex bg-white w-[60px] h-[35px] rounded-lg items-center justify-center"
    //                 style={{
    //                     left: `${score.percentage < 2 ? 2 : score.percentage > 98 ? 98 : score.percentage}%`,
    //                     transform: "translateX(-50%)"
    //                 }}>
    //                 <p>{score.points}</p>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>))
    //       : <div className="flex w-full h-full items-center justify-center py-2 text-md">
    //         <p className="w-1/2 text-center text-5xl text-gray-700 font-extrabold tracking-tight">Add your Github Repositories to see leaderboards!</p>
    //       </div>
    //     } */
    //   </div>
    // </main>
  );
}
