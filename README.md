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

1. Go to `Settings`.

<img src="https://github.com/user-attachments/assets/a496915a-449a-4313-a285-fac3d8899308" width="350px" />

2. Go to `Developer Settings`.

<img src="https://github.com/user-attachments/assets/2f54f566-6eb3-4f59-80ae-57bf4a87f2f3" width="350px" />

3. Go to `Personal Access Tokens` -> `Fine Grained Tokens`.

<img src="https://github.com/user-attachments/assets/d7f930d7-579a-4614-937b-30ed4808d346" width="350px" />

4. Set `Administration` to `Read/Write`.
   
<img src="https://github.com/user-attachments/assets/5befc468-2a9b-498f-8e66-15f923fff49d" width="350px" />


