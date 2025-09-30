// src/server/api/router/github.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Octokit } from "octokit";
import { fetchGitHubCommits } from "~/server/api/githubapis/fetchCommit";

export const githubRouter = createTRPCRouter({
  getCommits: publicProcedure
    .input(z.object({ repoFullName: z.string() }))
    .query(async ({ input }) => {
      return fetchGitHubCommits(input.repoFullName);
    }),
});