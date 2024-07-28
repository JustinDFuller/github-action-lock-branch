import * as core from "@actions/core";
// import * as github from "@actions/github";

async function main() {
  try {
    core.notice("hello world");
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
