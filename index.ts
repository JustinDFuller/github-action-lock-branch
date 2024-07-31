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

    core.debug(
      `Branch Protection JSON: ${JSON.stringify(branchProtection, null, 2)}`,
    );

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

    normalize(update);

    if (!update.restrictions) {
      update.restrictions = null;
    }

    if (!update.required_status_checks) {
      update.required_status_checks = null;
    } else if (update.required_status_checks.contexts) {
      // Obsolete setting returned by GET but not allowed in POST
      update.required_status_checks.contexts = [];
    }

    if (update.required_status_checks.checks) {
      for (const check of update.required_status_checks.checks) {
        if (check.app_id == null) {
          delete check.app_id;
        }
      }
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

// The response for GET /repos/{owner}/{repo}/branches/{branch}/protection
// Cannot be passed directly back into the PUT request to /repos/{owner}/{repo}/branches/{branch}/protection.
// Instead, we need to normalize the JSON to make it compliant with the PUT request.
function normalize(obj) {
  for (var key in obj) {
    var value = obj[key];
    // 1. Remove all extra _url keys.
    if (typeof value === "object") {
      if (key.endsWith("_url")) {
        delete obj[key];
        // 2. Convert enabled to boolean.
      } else if (value != null && "enabled" in value) {
        obj[key] = value.enabled;
        // 3. Remove empty arrays.
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          delete obj[key];
        }
      }
      // 4. Remove empty objects.
      if (value !== null && Object.keys(value).length === 0) {
        delete obj[key];
      }
      // recurse
      normalize(value);
    }
  }
}

main();
