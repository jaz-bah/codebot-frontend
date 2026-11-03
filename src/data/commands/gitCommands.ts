import { ICommandCard } from "@/types/global.type";


export const gitCommands : ICommandCard[] = [
    {
        title: "Setup & Configuration",
        commands: [
            { cmd: "git config --global user.name 'Your Name'", desc: "# Set your Git username" },
            { cmd: "git config --global user.email 'you@example.com'", desc: "# Set your Git email" },
            { cmd: "git config --list", desc: "# View all Git configurations" },
            { cmd: "git config --global init.defaultBranch main", desc: "# Set default branch name for new repos" },
            { cmd: "git config --global core.editor 'code --wait'", desc: "# Set VS Code as default editor" },
            { cmd: "git config --global pull.rebase true", desc: "# Rebase instead of merge on pull" },
            { cmd: "git config --global credential.helper store", desc: "# Save credentials to disk" },
            { cmd: "git config --global alias.st status", desc: "# Create a shortcut alias (git st)" },
            { cmd: "git config --global core.autocrlf input", desc: "# Normalize line endings (macOS/Linux)" },
            { cmd: "git config --global --unset <key>", desc: "# Remove a config value" },
            { cmd: "git config --global --edit", desc: "# Open global config in editor" }
        ]
    },
    {
        title: "SSH Setup",
        commands: [
            { cmd: "ssh-keygen -t ed25519 -C 'you@example.com'", desc: "# Generate a new SSH key" },
            { cmd: "eval \"$(ssh-agent -s)\"", desc: "# Start the SSH agent" },
            { cmd: "ssh-add ~/.ssh/id_ed25519", desc: "# Add your key to the agent" },
            { cmd: "cat ~/.ssh/id_ed25519.pub", desc: "# Print public key to add on GitHub" },
            { cmd: "ssh -T git@github.com", desc: "# Test SSH connection to GitHub" }
        ]
    },
    {
        title: "GitHub CLI - Auth & Setup",
        commands: [
            { cmd: "gh auth login", desc: "# Log in to GitHub (interactive)" },
            { cmd: "gh auth login --web", desc: "# Log in via browser" },
            { cmd: "gh auth login --with-token < token.txt", desc: "# Log in using a personal access token" },
            { cmd: "gh auth status", desc: "# Check current login status" },
            { cmd: "gh auth logout", desc: "# Log out of GitHub" },
            { cmd: "gh auth refresh -s <scope>", desc: "# Add extra token scopes (e.g. workflow)" },
            { cmd: "gh auth setup-git", desc: "# Use gh as Git credential helper" },
            { cmd: "gh auth token", desc: "# Print the current auth token" },
            { cmd: "gh config set editor 'code --wait'", desc: "# Set editor for gh" },
            { cmd: "gh config list", desc: "# View gh configuration" },
            { cmd: "gh alias set <name> '<command>'", desc: "# Create a gh command alias" },
            { cmd: "gh extension install <owner/repo>", desc: "# Install a gh extension" }
        ]
    },
    {
        title: "Starting a Repository",
        commands: [
            { cmd: "git init", desc: "# Initialize a new Git repository" },
            { cmd: "git init -b main", desc: "# Initialize with a specific branch name" },
            { cmd: "git clone <repo-url>", desc: "# Clone a remote repository" },
            { cmd: "git clone <repo-url> <folder-name>", desc: "# Clone into a custom folder" },
            { cmd: "git clone --depth 1 <repo-url>", desc: "# Shallow clone (latest commit only)" },
            { cmd: "git clone -b <branch-name> <repo-url>", desc: "# Clone a specific branch" },
            { cmd: "git clone --recurse-submodules <repo-url>", desc: "# Clone with submodules" },
            { cmd: "gh repo clone <owner/repo>", desc: "# Clone using GitHub CLI" }
        ]
    },
    {
        title: "Basic Snapshotting",
        commands: [
            { cmd: "git status", desc: "# Check status of files" },
            { cmd: "git status -s", desc: "# Short status output" },
            { cmd: "git add <file>", desc: "# Add a specific file" },
            { cmd: "git add .", desc: "# Add all changes" },
            { cmd: "git add -p", desc: "# Stage changes interactively (hunks)" },
            { cmd: "git add -u", desc: "# Stage modified and deleted tracked files" },
            { cmd: "git commit -m 'Your commit message'", desc: "# Commit changes" },
            { cmd: "git commit -am 'Your commit message'", desc: "# Stage tracked files and commit" },
            { cmd: "git commit --amend", desc: "# Edit the last commit" },
            { cmd: "git commit --amend --no-edit", desc: "# Add staged changes to last commit, keep message" },
            { cmd: "git commit --allow-empty -m 'Trigger CI'", desc: "# Create an empty commit" },
            { cmd: "git diff", desc: "# Show unstaged changes" },
            { cmd: "git diff --staged", desc: "# Show staged changes" },
            { cmd: "git diff <branch1>..<branch2>", desc: "# Compare two branches" },
            { cmd: "git diff --stat", desc: "# Show a summary of changes" },
            { cmd: "git rm <file>", desc: "# Delete a file and stage the removal" },
            { cmd: "git rm --cached <file>", desc: "# Untrack a file but keep it locally" },
            { cmd: "git mv <old> <new>", desc: "# Rename or move a file" }
        ]
    },
    {
        title: "Ignoring Files",
        commands: [
            { cmd: "echo 'node_modules/' >> .gitignore", desc: "# Add a pattern to .gitignore" },
            { cmd: "git rm -r --cached .", desc: "# Untrack everything (then re-add to apply .gitignore)" },
            { cmd: "git check-ignore -v <file>", desc: "# See which rule ignores a file" },
            { cmd: "git status --ignored", desc: "# Show ignored files" },
            { cmd: "git update-index --assume-unchanged <file>", desc: "# Temporarily ignore local changes to a tracked file" },
            { cmd: "git update-index --no-assume-unchanged <file>", desc: "# Stop ignoring local changes" }
        ]
    },
    {
        title: "Branching & Merging",
        commands: [
            { cmd: "git branch", desc: "# List all branches" },
            { cmd: "git branch -a", desc: "# List local and remote branches" },
            { cmd: "git branch -vv", desc: "# List branches with upstream and last commit" },
            { cmd: "git branch <branch-name>", desc: "# Create a new branch" },
            { cmd: "git checkout <branch-name>", desc: "# Switch to a branch" },
            { cmd: "git switch <branch-name>", desc: "# Modern alternative to checkout" },
            { cmd: "git switch -", desc: "# Switch back to the previous branch" },
            { cmd: "git checkout -b <branch-name>", desc: "# Create + switch to new branch" },
            { cmd: "git switch -c <branch-name>", desc: "# Create + switch (modern)" },
            { cmd: "git branch -m <new-name>", desc: "# Rename the current branch" },
            { cmd: "git merge <branch-name>", desc: "# Merge a branch into current branch" },
            { cmd: "git merge --no-ff <branch-name>", desc: "# Merge and always create a merge commit" },
            { cmd: "git merge --squash <branch-name>", desc: "# Squash all branch commits into one change" },
            { cmd: "git merge --abort", desc: "# Cancel an in-progress merge" },
            { cmd: "git branch -d <branch-name>", desc: "# Delete a merged branch" },
            { cmd: "git branch -D <branch-name>", desc: "# Force delete a branch" },
            { cmd: "git push origin --delete <branch-name>", desc: "# Delete a remote branch" },
            { cmd: "git branch --merged", desc: "# List branches already merged into current" },
            { cmd: "git branch --no-merged", desc: "# List branches not yet merged" }
        ]
    },
    {
        title: "Merge Conflicts",
        commands: [
            { cmd: "git status", desc: "# See files with conflicts" },
            { cmd: "git diff --name-only --diff-filter=U", desc: "# List conflicted files only" },
            { cmd: "git checkout --ours <file>", desc: "# Keep your version of a conflicted file" },
            { cmd: "git checkout --theirs <file>", desc: "# Keep the incoming version" },
            { cmd: "git mergetool", desc: "# Open configured merge tool" },
            { cmd: "git add <file>", desc: "# Mark conflict as resolved" },
            { cmd: "git merge --continue", desc: "# Finish merge after resolving" },
            { cmd: "git merge --abort", desc: "# Abort and return to pre-merge state" }
        ]
    },
    {
        title: "Rebase & Cherry-pick",
        commands: [
            { cmd: "git rebase <branch-name>", desc: "# Reapply commits on top of another branch" },
            { cmd: "git rebase -i HEAD~3", desc: "# Interactively edit last 3 commits (squash, reword...)" },
            { cmd: "git rebase --continue", desc: "# Continue after resolving conflicts" },
            { cmd: "git rebase --skip", desc: "# Skip the current conflicting commit" },
            { cmd: "git rebase --abort", desc: "# Cancel the rebase" },
            { cmd: "git rebase --onto <new-base> <old-base> <branch>", desc: "# Move a range of commits onto a new base" },
            { cmd: "git pull --rebase", desc: "# Pull and rebase local commits" },
            { cmd: "git cherry-pick <commit-id>", desc: "# Apply a specific commit to current branch" },
            { cmd: "git cherry-pick <id1> <id2>", desc: "# Cherry-pick multiple commits" },
            { cmd: "git cherry-pick <start>..<end>", desc: "# Cherry-pick a range of commits" },
            { cmd: "git cherry-pick --abort", desc: "# Cancel a cherry-pick" }
        ]
    },
    {
        title: "Remote Repositories",
        commands: [
            { cmd: "git remote -v", desc: "# View remote URLs" },
            { cmd: "git remote add origin <repo-url>", desc: "# Add remote repository" },
            { cmd: "git remote set-url origin <new-url>", desc: "# Change a remote's URL" },
            { cmd: "git remote rename <old> <new>", desc: "# Rename a remote" },
            { cmd: "git remote remove <name>", desc: "# Remove a remote" },
            { cmd: "git remote show origin", desc: "# Show details about a remote" },
            { cmd: "git remote prune origin", desc: "# Remove stale remote-tracking branches" },
            { cmd: "git push -u origin <branch-name>", desc: "# Push branch for first time" },
            { cmd: "git push", desc: "# Push commits to remote" },
            { cmd: "git push --force-with-lease", desc: "# Safer force push (fails if remote changed)" },
            { cmd: "git push --force", desc: "# Force push (overwrites remote history)" },
            { cmd: "git pull", desc: "# Pull updates from remote" },
            { cmd: "git pull origin <branch-name>", desc: "# Pull a specific branch" },
            { cmd: "git fetch", desc: "# Fetch changes without merging" },
            { cmd: "git fetch --all --prune", desc: "# Fetch all remotes and prune deleted branches" },
            { cmd: "git branch --set-upstream-to=origin/<branch-name>", desc: "# Link local branch to a remote branch" }
        ]
    },
    {
        title: "Undoing Changes",
        commands: [
            { cmd: "git restore <file>", desc: "# Discard changes in working directory" },
            { cmd: "git restore --staged <file>", desc: "# Unstage a file (modern)" },
            { cmd: "git restore --source=<commit-id> <file>", desc: "# Restore a file from a specific commit" },
            { cmd: "git reset <file>", desc: "# Unstage a file" },
            { cmd: "git reset --soft HEAD~1", desc: "# Undo last commit, keep changes staged" },
            { cmd: "git reset --mixed HEAD~1", desc: "# Undo last commit, keep changes unstaged" },
            { cmd: "git reset --hard", desc: "# Reset all changes to last commit" },
            { cmd: "git reset --hard HEAD~1", desc: "# Undo last commit and discard changes" },
            { cmd: "git reset --hard origin/<branch-name>", desc: "# Make local branch match remote exactly" },
            { cmd: "git revert <commit-id>", desc: "# Revert a specific commit safely" },
            { cmd: "git revert -m 1 <merge-commit-id>", desc: "# Revert a merge commit" },
            { cmd: "git checkout <commit-id>", desc: "# Checkout a specific commit (detached HEAD)" },
            { cmd: "git checkout -- <file>", desc: "# Discard file changes (legacy)" }
        ]
    },
    {
        title: "History & Logs",
        commands: [
            { cmd: "git log", desc: "# Show commit history" },
            { cmd: "git log --oneline --graph --decorate", desc: "# Compact visual commit history" },
            { cmd: "git log --oneline --graph --all", desc: "# Visual history of all branches" },
            { cmd: "git log -n 5", desc: "# Show last 5 commits" },
            { cmd: "git log --author='Name'", desc: "# Filter commits by author" },
            { cmd: "git log --since='2 weeks ago'", desc: "# Filter commits by date" },
            { cmd: "git log --grep='keyword'", desc: "# Search commit messages" },
            { cmd: "git log -S 'code'", desc: "# Find commits that added/removed a string" },
            { cmd: "git log -p <file>", desc: "# Show history with diffs for a file" },
            { cmd: "git log --follow <file>", desc: "# Track file history across renames" },
            { cmd: "git log <branch1>..<branch2>", desc: "# Commits in branch2 not in branch1" },
            { cmd: "git show <commit-id>", desc: "# Show details of a specific commit" },
            { cmd: "git show <commit-id>:<file>", desc: "# View a file as of a specific commit" },
            { cmd: "git blame <file>", desc: "# Show who modified each line in a file" },
            { cmd: "git blame -L 10,20 <file>", desc: "# Blame only a range of lines" },
            { cmd: "git shortlog -sn", desc: "# Commit count per author" },
            { cmd: "git reflog", desc: "# Show history of HEAD movements (recover lost commits)" }
        ]
    },
    {
        title: "Searching",
        commands: [
            { cmd: "git grep 'text'", desc: "# Search tracked files for text" },
            { cmd: "git grep -n 'text'", desc: "# Search with line numbers" },
            { cmd: "git grep 'text' <commit-id>", desc: "# Search in a specific commit" },
            { cmd: "git bisect start", desc: "# Start binary search for a bug-introducing commit" },
            { cmd: "git bisect bad", desc: "# Mark current commit as bad" },
            { cmd: "git bisect good <commit-id>", desc: "# Mark a known good commit" },
            { cmd: "git bisect reset", desc: "# End bisect and return to original branch" }
        ]
    },
    {
        title: "Stashing (Temporary Save)",
        commands: [
            { cmd: "git stash", desc: "# Stash current uncommitted changes" },
            { cmd: "git stash push -m 'message'", desc: "# Stash with a descriptive message" },
            { cmd: "git stash -u", desc: "# Stash including untracked files" },
            { cmd: "git stash list", desc: "# List all stashed changes" },
            { cmd: "git stash show -p stash@{0}", desc: "# Show contents of a stash" },
            { cmd: "git stash pop", desc: "# Apply and remove latest stash" },
            { cmd: "git stash apply", desc: "# Apply latest stash without removing it" },
            { cmd: "git stash apply stash@{2}", desc: "# Apply a specific stash" },
            { cmd: "git stash branch <branch-name>", desc: "# Create a branch from a stash" },
            { cmd: "git stash drop stash@{0}", desc: "# Delete a specific stash" },
            { cmd: "git stash clear", desc: "# Delete all stashes" }
        ]
    },
    {
        title: "Cleaning Up",
        commands: [
            { cmd: "git clean -n", desc: "# Dry run: preview untracked files to be removed" },
            { cmd: "git clean -f", desc: "# Remove untracked files" },
            { cmd: "git clean -fd", desc: "# Remove untracked files and directories" },
            { cmd: "git clean -fdx", desc: "# Also remove ignored files" },
            { cmd: "git gc", desc: "# Run garbage collection to optimize repo" },
            { cmd: "git fsck", desc: "# Check repository integrity" },
            { cmd: "git prune", desc: "# Remove unreachable objects" }
        ]
    },
    {
        title: "Tagging (Releases)",
        commands: [
            { cmd: "git tag", desc: "# List all tags" },
            { cmd: "git tag <tagname>", desc: "# Create a new tag" },
            { cmd: "git tag -a v1.0.0 -m 'Release 1.0.0'", desc: "# Create an annotated tag" },
            { cmd: "git tag <tagname> <commit-id>", desc: "# Tag a past commit" },
            { cmd: "git show <tagname>", desc: "# Show tag details" },
            { cmd: "git push origin <tagname>", desc: "# Push a specific tag to remote" },
            { cmd: "git push origin --tags", desc: "# Push all tags to remote" },
            { cmd: "git tag -d <tagname>", desc: "# Delete a local tag" },
            { cmd: "git push origin --delete <tagname>", desc: "# Delete a remote tag" },
            { cmd: "git checkout tags/<tagname>", desc: "# Check out a tag" }
        ]
    },
    {
        title: "Submodules",
        commands: [
            { cmd: "git submodule add <repo-url> <path>", desc: "# Add a submodule" },
            { cmd: "git submodule init", desc: "# Initialize submodules" },
            { cmd: "git submodule update --init --recursive", desc: "# Fetch and update all submodules" },
            { cmd: "git submodule update --remote", desc: "# Update submodules to latest remote commit" },
            { cmd: "git submodule status", desc: "# Show submodule status" },
            { cmd: "git submodule deinit -f <path>", desc: "# Unregister a submodule" }
        ]
    },
    {
        title: "Worktrees",
        commands: [
            { cmd: "git worktree add ../<folder> <branch-name>", desc: "# Check out a branch in a separate folder" },
            { cmd: "git worktree add -b <new-branch> ../<folder>", desc: "# Create new branch in a new worktree" },
            { cmd: "git worktree list", desc: "# List all worktrees" },
            { cmd: "git worktree remove ../<folder>", desc: "# Remove a worktree" },
            { cmd: "git worktree prune", desc: "# Clean up stale worktree info" }
        ]
    },
    {
        title: "Patches & Archive",
        commands: [
            { cmd: "git format-patch -1 <commit-id>", desc: "# Create a patch file from a commit" },
            { cmd: "git apply <patch-file>", desc: "# Apply a patch file" },
            { cmd: "git am <patch-file>", desc: "# Apply a patch with commit info" },
            { cmd: "git diff > changes.patch", desc: "# Save current changes as a patch" },
            { cmd: "git archive --format=zip HEAD -o project.zip", desc: "# Export the repo as a zip" }
        ]
    },
    {
        title: "GitHub CLI - Repositories",
        commands: [
            { cmd: "gh repo create <name> --public --source=. --push", desc: "# Create a repo from current folder and push" },
            { cmd: "gh repo create <name> --private", desc: "# Create a new private repository" },
            { cmd: "gh repo view --web", desc: "# Open repo in browser" },
            { cmd: "gh repo list", desc: "# List your repositories" },
            { cmd: "gh repo fork", desc: "# Fork the current repository" },
            { cmd: "gh repo fork --clone", desc: "# Fork and clone it" },
            { cmd: "gh repo edit --visibility private --accept-visibility-change-consequences", desc: "# Change repo visibility" },
            { cmd: "gh repo rename <new-name>", desc: "# Rename repository" },
            { cmd: "gh repo sync", desc: "# Sync a fork with its upstream" },
            { cmd: "gh repo delete <owner/repo>", desc: "# Delete a repository" },
            { cmd: "gh browse", desc: "# Open the repo in your browser" }
        ]
    },
    {
        title: "GitHub CLI - Pull Requests",
        commands: [
            { cmd: "gh pr create", desc: "# Create a pull request (interactive)" },
            { cmd: "gh pr create --title 'Title' --body 'Description'", desc: "# Create a PR with title and body" },
            { cmd: "gh pr create --fill", desc: "# Create a PR from commit info" },
            { cmd: "gh pr create --draft", desc: "# Create a draft PR" },
            { cmd: "gh pr list", desc: "# List open pull requests" },
            { cmd: "gh pr status", desc: "# Show PRs relevant to you" },
            { cmd: "gh pr view <number> --web", desc: "# Open a PR in browser" },
            { cmd: "gh pr checkout <number>", desc: "# Check out a PR locally" },
            { cmd: "gh pr diff <number>", desc: "# View PR diff" },
            { cmd: "gh pr checks <number>", desc: "# View CI status for a PR" },
            { cmd: "gh pr review <number> --approve", desc: "# Approve a PR" },
            { cmd: "gh pr review <number> --request-changes -b 'Comment'", desc: "# Request changes on a PR" },
            { cmd: "gh pr comment <number> -b 'Comment'", desc: "# Comment on a PR" },
            { cmd: "gh pr ready <number>", desc: "# Mark a draft PR as ready" },
            { cmd: "gh pr merge <number> --squash --delete-branch", desc: "# Squash merge and delete the branch" },
            { cmd: "gh pr close <number>", desc: "# Close a PR" },
            { cmd: "gh pr reopen <number>", desc: "# Reopen a PR" }
        ]
    },
    {
        title: "GitHub CLI - Issues",
        commands: [
            { cmd: "gh issue create", desc: "# Create an issue (interactive)" },
            { cmd: "gh issue create --title 'Title' --body 'Details' --label bug", desc: "# Create an issue with label" },
            { cmd: "gh issue list", desc: "# List open issues" },
            { cmd: "gh issue list --assignee @me", desc: "# List issues assigned to you" },
            { cmd: "gh issue view <number>", desc: "# View an issue" },
            { cmd: "gh issue comment <number> -b 'Comment'", desc: "# Comment on an issue" },
            { cmd: "gh issue edit <number> --add-label <label>", desc: "# Add a label to an issue" },
            { cmd: "gh issue close <number>", desc: "# Close an issue" },
            { cmd: "gh issue reopen <number>", desc: "# Reopen an issue" },
            { cmd: "gh issue develop <number> --checkout", desc: "# Create and check out a branch for an issue" }
        ]
    },
    {
        title: "GitHub CLI - Actions & Workflows",
        commands: [
            { cmd: "gh workflow list", desc: "# List workflows" },
            { cmd: "gh workflow run <workflow>", desc: "# Trigger a workflow manually" },
            { cmd: "gh workflow enable <workflow>", desc: "# Enable a workflow" },
            { cmd: "gh workflow disable <workflow>", desc: "# Disable a workflow" },
            { cmd: "gh run list", desc: "# List recent workflow runs" },
            { cmd: "gh run view <run-id>", desc: "# View a workflow run" },
            { cmd: "gh run view <run-id> --log", desc: "# View run logs" },
            { cmd: "gh run watch <run-id>", desc: "# Watch a run in real time" },
            { cmd: "gh run rerun <run-id>", desc: "# Re-run a workflow run" },
            { cmd: "gh run rerun <run-id> --failed", desc: "# Re-run only failed jobs" },
            { cmd: "gh run download <run-id>", desc: "# Download run artifacts" },
            { cmd: "gh cache list", desc: "# List Actions caches" }
        ]
    },
    {
        title: "GitHub CLI - Releases, Gists & More",
        commands: [
            { cmd: "gh release create v1.0.0 --generate-notes", desc: "# Create a release with auto notes" },
            { cmd: "gh release create v1.0.0 ./dist/*.zip", desc: "# Create a release with assets" },
            { cmd: "gh release list", desc: "# List releases" },
            { cmd: "gh release download v1.0.0", desc: "# Download release assets" },
            { cmd: "gh release delete v1.0.0", desc: "# Delete a release" },
            { cmd: "gh gist create <file>", desc: "# Create a gist from a file" },
            { cmd: "gh gist create --public <file>", desc: "# Create a public gist" },
            { cmd: "gh gist list", desc: "# List your gists" },
            { cmd: "gh secret set <NAME>", desc: "# Set a repository secret" },
            { cmd: "gh secret list", desc: "# List repository secrets" },
            { cmd: "gh variable set <NAME> --body <value>", desc: "# Set a repository variable" },
            { cmd: "gh ssh-key add ~/.ssh/id_ed25519.pub", desc: "# Add an SSH key to your GitHub account" },
            { cmd: "gh codespace create", desc: "# Create a codespace" },
            { cmd: "gh codespace list", desc: "# List codespaces" },
            { cmd: "gh codespace ssh", desc: "# SSH into a codespace" },
            { cmd: "gh search repos <query>", desc: "# Search repositories" },
            { cmd: "gh api repos/<owner>/<repo>", desc: "# Make a raw GitHub API request" },
            { cmd: "gh status", desc: "# Show your notifications, PRs, and issues" },
            { cmd: "gh help", desc: "# Show help for gh commands" }
        ]
    }
];
