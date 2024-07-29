# Github Action Lock Branch

This Github Action locks or unlocks a branch using [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule).

It is useful for automating the locking of a branch, particularly when paired with [Github Action Scheduler](https://github.com/JustinDFuller/github-action-scheduler).

## Usage

You can find a working demo in [.github/workflows/demo.yml](./.github/workflows/demo.yml). 

Here is a demo for locking a branch.

```yaml
- name: Lock branch
  id: lock
  uses: JustinDFuller/github-action-lock-branch@v1
  with:
    lock: true ## required
    token: ${{ secrets.LOCK_TOKEN }} # required
    owner: JustinDFuller # optional
    repository: github-action-lock-branch # optional
    branch: main # optional
```

Here is a demo for unlocking a branch.

```yaml
- name: Lock branch
  id: lock
  uses: JustinDFuller/github-action-lock-branch@v1
  with:
    lock: false ## required
    token: ${{ secrets.LOCK_TOKEN }} # required
    owner: JustinDFuller # optional
    repository: github-action-lock-branch # optional
    branch: main # optional
```

Here is a demo for inferring the current owner, repo, and branch.

```yaml
- name: Lock branch
  id: lock
  uses: JustinDFuller/github-action-lock-branch@v1
  with:
    lock: false ## required
    token: ${{ secrets.LOCK_TOKEN }} # required
```

## Token Requirements

The `token` must be a token with `Write` permissions for `Administration`.

