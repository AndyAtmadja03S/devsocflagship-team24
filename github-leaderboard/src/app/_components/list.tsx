"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

export function GitHubCommits() {
  const [repoName, setRepoName] = useState("");
  const [searchRepo, setSearchRepo] = useState("");

  const { data: commits, isLoading, error } = api.github.getCommits.useQuery(
    { repoFullName: searchRepo },
    { enabled: !!searchRepo } 
  );

  const handleSearch = () => {
    setSearchRepo(repoName);
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="owner/repo"
          className="border p-2 rounded"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500">Error: {error.message}</p>}
      {isLoading && <p>Loading commits...</p>}
      {commits && commits.length === 0 && <p>No commits found</p>}
      {commits && commits.length > 0 && (
        <div className="space-y-4">
          {commits.map((c) => (
            <div className="border p-4 rounded">
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
                <strong>+-:</strong> +{c.totalDelta}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}