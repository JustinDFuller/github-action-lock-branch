import * as core from "@actions/core";
import * as github from "@actions/github";
import type { GraphQlQueryResponseData } from "@octokit/graphql";

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

    const query = `query getBranchProtections($owner: String!, $repository: String!){
  repository(owner: $owner, name: $repository){
    branchProtectionRules(first: 100){
      nodes{
        lockBranch
        id
        matchingRefs(first: 100){
          nodes{
            id
            name
          }
        }
      }
    }
  }
}`;

    const graphqlWithAuth = kit.graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });

    core.debug(`Query getBranchProtections: ${query} ${owner} ${repository}`);

    const response: GraphQlQueryResponseData = await graphqlWithAuth(query, {
      owner,
      repository,
    });

    core.debug(`Branch Protection JSON: ${JSON.stringify(response, null, 2)}`);

    if (!response) {
      throw new Error("Branch protection not found.");
    }

    if (!response.repository) {
      throw new Error("Repository not found.");
    }

    if (!response.repository.branchProtectionRules) {
      throw new Error("Branch protection rules not found.");
    }

    if (!response.repository.branchProtectionRules.nodes) {
      throw new Error("Branch protection rules nodes not found.");
    }

    if (!response.repository.branchProtectionRules.nodes.length) {
      throw new Error("Branch protection rules nodes empty.");
    }

    let alreadyLocked;
    let branchProtectionId;

    for (const rule of response.repository.branchProtectionRules.nodes) {
      if (rule.matchingRefs.nodes.some((n) => n.name === branch)) {
        if (!("lockBranch" in rule)) {
          throw new Error("Lock Branch Setting not found.");
        }

        if (!("id" in rule)) {
          throw new Error("Branch Protection ID not found.");
        }

        alreadyLocked = rule.lockBranch;
        branchProtectionId = rule.id;
        break;
      }
    }

    if (!branchProtectionId) {
      throw new Error(
        `Branch protection ID not found. For branch=${branch} in repository=${repository} owner=${owner}`,
      );
    }

    if (alreadyLocked === lock) {
      core.notice(
        `Branch is currently locked=${alreadyLocked} which is the same as lock setting requested=${lock}. Stopping here.`,
      );
      core.setOutput("changed", false);
      core.setOutput("success", true);

      return;
    }

    const data = await graphqlWithAuth(`
    mutation updateBranchProtections {
  updateBranchProtectionRule(input: { lockBranch: ${lock}, branchProtectionRuleId: "${branchProtectionId}" }) {
    branchProtectionRule{
      lockBranch
      id
    }
  }
}
    `);

    core.debug(`Update Response JSON: ${JSON.stringify(data, null, 2)}`);

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
