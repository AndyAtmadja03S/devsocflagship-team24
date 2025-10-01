"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import Image from "next/image";
import marioRun from "../../images/mario-run.png";
import bg1 from "../../images/bg_1.svg";
import bg2 from "../../images/bg_2.svg";

export function Leaderboards() {
  const [xPercent, setXPercent] = useState(70);
  const [Scores, setScores] = useState<{
    name: string;
    points: number;
    percentage: number;
  }[]>([
    {
      name: "tes1",
      points: 100,
      percentage: 50
    },
    {
      name: "tes2",
      points: 200,
      percentage: 35
    },
    {
      name: "tes3",
      points: 50,
      percentage: 80
    }
  ]);
  const [repoName, setRepoName] = useState("");

  const { data: commits, isLoading } = api.github.getCommits.useQuery(
    { repoFullName: repoName },
    { enabled: !!repoName } 
  );



  return (
    <main className="flex min-h-screen min-w-[1100px] w-full flex-col items-center justify-center bg-gradient-to-b from-[#ffd54a] to-[#35aeb0] text-gray-900 overflow-hidden">
        <div className="flex min-h-screen w-full flex-col items-center justify-start gap-4 px-8 py-12">
          {/* Title */}
          <div className="flex min-h-[10%] h-[100px] w-full rounded-xl items-center justify-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              RepoBoards!
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative flex flex-row min-h-[10%] h-[50px] max-w-[1000px] w-full rounded-full mt-8 mb-8">
            <input 
              placeholder="Search Leaderboards!" 
              className="rounded-full w-full h-16 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-500 focus:border-teal-500" 
              type="text" 
              name="query" 
              id="query"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              />
            <button type="submit" className="absolute inline-flex items-center h-10 px-4 py-2 text-sm text-white transition duration-150 ease-in-out rounded-full outline-none right-3 top-3 bg-teal-600 sm:px-6 sm:text-base sm:font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
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
          {isLoading && <p>Loading commits...</p>}

          {/* Loaded but empty */}
          {commits && commits.length === 0 && <p>No commits found</p>}

          {/* Loaded and shown */}
          {commits && commits.length > 0 && (
          <div>
            <div className="relative flex max-w-[1000px] w-full h-[250px] bg-black items-start justify-center bg-gray-100 rounded-xl py-4">
              {/* Leaderboards Progress Bar */}
              <div 
                className="absolute inset-0 bg-center bg-cover rounded-xl"
                style={{ backgroundImage: `url(${bg2.src})`,
                backgroundSize: "100% 100%",}}
              />
              <div
                className="absolute inset-0 bg-center bg-cover transition-all duration-500 rounded-xl"
                style={{
                  backgroundImage: `url(${bg1.src})`,
                  backgroundSize: "100% 100%",
                  clipPath: `inset(0 ${100-commits[commits.length-1]?.percentage}% 0 0)`,
                }}
              />

              {/* Leaderboards Legends */}
              <div className="relative flex flex-col w-full h-[210px] items-start justify-end">
                {commits.map((c) => (
                  <div>
                    <Image 
                      key={c.author}
                      src={marioRun} 
                      alt="marioRun" 
                      className="absolute bottom-4"
                      style={{ 
                        width: "auto", 
                        height: "auto", 
                        maxWidth: "180px", 
                        left: `${c.percentage < 4 ? 4 : c.percentage > 97 ? 97 : c.percentage}%`,
                        transform: `translateX(-45%)`,
                        transition: "transform 0.3s ease", // smooth movement 
                      }}
                    />
                    {/* <div className="absolute w-full min-w-md bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`bg-teal-600 h-full animate-[progress_2s_infinite_alternate_ease-in-out]`}
                        style={{ width: `${score.percentage}%` }} 
                      ></div>
                    </div> */}
                    <div className="absolute w-full min-w-md h-8  mt-9">
                      <div className={`flex flex-row items-end justify-end h-full w-full animate-[progress_2s_infinite_alternate_ease-in-out]`}>
                        <div className="absolute flex bg-white w-[60px] h-[35px] rounded-lg items-center justify-center"
                          style={{
                              left: `${c.percentage < 4 ? 4 : c.percentage > 96 ? 96 : c.percentage}%`,
                              transform: "translateX(-50%)"
                          }}>
                          <p>{c.points}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              {commits.map((c) => (
                <div key={c.author} className="border p-4 rounded">
                  <p className="font-bold">{c.author}</p>
                  <p>
                    <strong>Score:</strong> {c.qualityScore ?? "N/A"}
                  </p>
                  <p>
                    <strong>Reasoning:</strong> {c.reasoning}
                  </p>
                  <p>
                    <strong>TotalCommits:</strong> +{c.totalCommits}
                  </p>
                  <p>
                    <strong>+-:</strong> +{c.linesAdded}
                    <strong>+-:</strong> +{c.linesDeleted}
                  </p>
                  <p>
                    <pre>{c.patch}</pre>
                  </p>
                </div>
              ))}
            </div>
          </div>
          )}
          {/* {Scores.length > 0 
            ? Scores.map((score) => (
            <div key={score.name} className="relative flex w-[80%] h-[150px] items-start justify-center py-2 bg-gray-100 rounded-xl px-4 py-4">
              <div 
                className="absolute inset-0 bg-center bg-[1000px] rounded-xl"
                style={{ backgroundImage: `url(${bg2.src})`}}
              >
              </div>
              <div
                className="absolute inset-0 bg-center bg-cover transition-all duration-500 rounded-xl"
                style={{
                  backgroundImage: `url(${bg1.src})`,
                  clipPath: `inset(0 ${100-score.percentage}% 0 0)`,
                }}
              />
              <div className="relative flex flex-col w-full h-[140px] items-start justify-end">
                <Image 
                  src={marioRun} 
                  alt="marioRun" 
                  className="absolute bottom-16"
                  style={{ 
                    width: "auto", 
                    height: "auto", 
                    maxWidth: "180px", 
                    left: `${score.percentage < 2 ? 2 : score.percentage > 98 ? 98 : score.percentage}%`,
                    transform: `translateX(-45%)`,
                    transition: "transform 0.3s ease", // smooth movement 
                  }}/>
                <div className="w-full min-w-md bg-gray-100 rounded-full h-4 overflow-hidden ">
                  <div className={`bg-teal-600 h-full animate-[progress_2s_infinite_alternate_ease-in-out]`}
                    style={{ width: `${score.percentage}%` }} 
                  ></div>
                </div>
                <div className="w-full min-w-md h-8 overflow-hidden mt-4">
                  <div className={`flex flex-row items-end justify-end h-full w-full animate-[progress_2s_infinite_alternate_ease-in-out]`}>
                    <div className="absolute flex bg-white w-[60px] h-[35px] rounded-lg items-center justify-center"
                      style={{
                          left: `${score.percentage < 2 ? 2 : score.percentage > 98 ? 98 : score.percentage}%`,
                          transform: "translateX(-50%)"
                      }}>
                      <p>{score.points}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>))
            : <div className="flex w-full h-full items-center justify-center py-2 text-md">
              <p className="w-1/2 text-center text-5xl text-gray-700 font-extrabold tracking-tight">Add your Github Repositories to see leaderboards!</p>
            </div>
          } */}
        </div>
      </main>
  );
}
