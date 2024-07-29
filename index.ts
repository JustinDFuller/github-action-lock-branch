import * as core from "@actions/core";
import * as github from "@actions/github";

async function main() {
  try {
    const token = core.getInput("token");
    if (!token) {
      throw new Error(`Expected a token but got: "${token}"`);
    }

    const lock = core.getBooleanInput("lock");

    let repository = core.getInput("repository");
    if (!repository) {
      repository = github.context.repo.repo;
      core.notice(`No repository provided, using "${repository}"`);
    }

    let owner = core.getInput("owner");
    if (!owner) {
      owner = github.context.repo.owner;
      core.notice(`No owner provided, using "${owner}"`);
    }

    let branch = core.getInput("branch");
    if (!branch) {
      branch = github.context.ref;

      // GitHub Actions ref can be a tag or branch
      if (branch.startsWith("refs/heads/")) {
        branch = branch.replace("refs/heads/", "");
      } else if (branch.startsWith("refs/tags/")) {
        branch = branch.replace("refs/tags/", "");
      }

      core.notice(`No branch provided, using "${branch}"`);
    }

    console.log(
      `${lock ? "locking" : "unlocking"} branch="${branch}" repository="${repository}" owner="${owner}"`,
    );

    const kit = github.getOctokit(token);
    if (!kit) {
      throw new Error(`Failed to initialize octokit: ${kit}`);
    }

    try {
      const { data: branchProtection } = await kit.request(
        "GET /repos/{owner}/{repo}/branches/{branch}/protection",
        {
          owner,
          repo: repository,
          branch,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      console.log(branchProtection);
    } catch (e) {
      throw new Error(`error retrieving branch protections: ${e.message}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
