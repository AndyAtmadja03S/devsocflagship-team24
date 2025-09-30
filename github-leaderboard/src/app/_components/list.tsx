"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

export function GitHubCommits() {
  const [repoName, setRepoName] = useState("");

  const { data: commits, isLoading } = api.github.getCommits.useQuery(
    { repoFullName: repoName },
    { enabled: !!repoName } 
  );

  return (
    <div>
      <input
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        placeholder="owner/repo"
      />
      {isLoading && <p>Loading commits...</p>}
      {commits?.map((c) => (
        <div key={c.sha}>
          <p>{c.sha}</p>
          <p>{c.message}</p>
          <p>{c.author}</p>
        </div>
      ))}
    </div>
  );
}
