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

    core.notice(
      `${lock ? "locking" : "unlocking"} branch="${branch}" repository="${repository}" owner="${owner}"`,
    );
    core.setOutput("branch", branch);
    core.setOutput("repository", repository);
    core.setOutput("owner", owner);
    core.setOutput("locked", lock);
    core.setOutput("unlocked", !lock);

    const kit = github.getOctokit(token);
    if (!kit) {
      throw new Error(`Failed to initialize octokit: ${kit}`);
    }

    const { data: branchProtection } = await kit.rest.repos.getBranchProtection(
      {
        owner,
        repo: repository,
        branch,
      },
    );

    core.debug(`Branch Protection JSON: ${JSON.stringify(branchProtection, null, 2)}`);

    if (!branchProtection) {
      throw new Error("Branch protection not found.");
    }

    if (!branchProtection.lock_branch) {
      throw new Error("Lock Branch Setting not found.");
    }

    if (branchProtection.lock_branch.enabled === lock) {
      core.notice(
        `Branch is currently locked=${branchProtection.lock_branch.enabled} which is the same as lock setting requested=${lock}. Stopping here.`,
      );
      core.setOutput("changed", false);
      core.setOutput("success", true);

      return;
    }

    const update = {
      owner,
      repo: repository,
      branch,
      ...branchProtection,
    };

    for (const key in update) {
      const value = update[key];

      if (typeof value === "object" && "enabled" in value) {
        update[key] = value.enabled;
      }
    }

    if (!update.restrictions) {
      update.restrictions = null;
    }

    if (!update.required_status_checks) {
      update.required_status_checks = null;
    } else if (update.required_status_checks.contexts) {
      // Obsolete setting returned by GET but not allowed in POST
      update.required_status_checks.contexts = null;
    }

    // @ts-expect-error
    update.lock_branch = lock;

    core.debug(`Update JSON: ${JSON.stringify(update, null, 2)}`);

    // @ts-expect-error
    const { data } = await kit.rest.repos.updateBranchProtection(update);

    core.debug(`Update Response JSON: ${JSON.stringify(data, null, 2)}`);

    core.notice(`Branch is now locked=${data.lock_branch?.enabled}`);
    core.setOutput("changed", true);
    core.setOutput("success", true);
    core.setOutput("failure", false);
  } catch (error) {
    core.setOutput("changed", false);
    core.setOutput("success", false);
    core.setOutput("failure", true);
    core.setFailed(error.message);
  }
}

main();
