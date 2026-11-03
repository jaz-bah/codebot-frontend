import { ICommandCard } from "@/types/global.type";


export const linuxCommands : ICommandCard[] = [
    {
        title: "Navigation & Directories",
        commands: [
            { cmd: "pwd", desc: "# Print current directory" },
            { cmd: "ls", desc: "# List files and folders" },
            { cmd: "ls -lah", desc: "# List all files with details and human-readable sizes" },
            { cmd: "ls -lt", desc: "# List sorted by modified time (newest first)" },
            { cmd: "cd <folder>", desc: "# Change directory" },
            { cmd: "cd ..", desc: "# Go up one level" },
            { cmd: "cd ~", desc: "# Go to your home directory" },
            { cmd: "cd -", desc: "# Go back to the previous directory" },
            { cmd: "mkdir <folder>", desc: "# Create a directory" },
            { cmd: "mkdir -p path/to/folder", desc: "# Create nested directories" },
            { cmd: "rmdir <folder>", desc: "# Remove an empty directory" },
            { cmd: "tree -L 2", desc: "# Show directory tree 2 levels deep" }
        ]
    },
    {
        title: "File Management",
        commands: [
            { cmd: "touch <file>", desc: "# Create an empty file or update its timestamp" },
            { cmd: "cp <src> <dest>", desc: "# Copy a file" },
            { cmd: "cp -r <src-dir> <dest-dir>", desc: "# Copy a directory recursively" },
            { cmd: "mv <src> <dest>", desc: "# Move or rename a file" },
            { cmd: "rm <file>", desc: "# Delete a file" },
            { cmd: "rm -r <folder>", desc: "# Delete a directory recursively" },
            { cmd: "rm -rf <folder>", desc: "# Force delete a directory (no confirmation, careful!)" },
            { cmd: "ln -s <target> <link-name>", desc: "# Create a symbolic link" },
            { cmd: "file <file>", desc: "# Show file type" },
            { cmd: "stat <file>", desc: "# Show detailed file info" },
            { cmd: "basename <path>", desc: "# Get the file name from a path" },
            { cmd: "dirname <path>", desc: "# Get the directory from a path" }
        ]
    },
    {
        title: "Viewing & Editing Files",
        commands: [
            { cmd: "cat <file>", desc: "# Print file contents" },
            { cmd: "less <file>", desc: "# Scroll through a file (q to quit)" },
            { cmd: "head -n 20 <file>", desc: "# Show first 20 lines" },
            { cmd: "tail -n 20 <file>", desc: "# Show last 20 lines" },
            { cmd: "tail -f <file>", desc: "# Follow a file live (great for logs)" },
            { cmd: "wc -l <file>", desc: "# Count lines in a file" },
            { cmd: "nano <file>", desc: "# Edit a file with nano" },
            { cmd: "vim <file>", desc: "# Edit a file with vim (:wq save, :q! quit)" },
            { cmd: "diff <file1> <file2>", desc: "# Compare two files" },
            { cmd: "echo 'text' > <file>", desc: "# Write text to a file (overwrites)" },
            { cmd: "echo 'text' >> <file>", desc: "# Append text to a file" }
        ]
    },
    {
        title: "Searching",
        commands: [
            { cmd: "find . -name '*.js'", desc: "# Find files by name" },
            { cmd: "find . -type f -mtime -1", desc: "# Files modified in the last day" },
            { cmd: "find . -type f -size +100M", desc: "# Files larger than 100MB" },
            { cmd: "find . -name '*.log' -delete", desc: "# Find and delete matching files" },
            { cmd: "find . -name '*.js' -exec grep -l 'foo' {} +", desc: "# Find files then run a command on them" },
            { cmd: "grep 'text' <file>", desc: "# Search for text in a file" },
            { cmd: "grep -rn 'text' .", desc: "# Search recursively with line numbers" },
            { cmd: "grep -i 'text' <file>", desc: "# Case-insensitive search" },
            { cmd: "grep -v 'text' <file>", desc: "# Show lines that do NOT match" },
            { cmd: "grep -E 'foo|bar' <file>", desc: "# Search with regex (OR)" },
            { cmd: "which <command>", desc: "# Show the path of a command" },
            { cmd: "locate <name>", desc: "# Quickly find files by name (uses index)" }
        ]
    },
    {
        title: "Text Processing",
        commands: [
            { cmd: "sort <file>", desc: "# Sort lines" },
            { cmd: "sort -u <file>", desc: "# Sort and remove duplicates" },
            { cmd: "uniq -c", desc: "# Count adjacent duplicate lines (use after sort)" },
            { cmd: "cut -d',' -f1 <file>", desc: "# Extract first column of a CSV" },
            { cmd: "awk '{print $1}' <file>", desc: "# Print the first column" },
            { cmd: "sed 's/old/new/g' <file>", desc: "# Replace text (prints result)" },
            { cmd: "sed -i 's/old/new/g' <file>", desc: "# Replace text in place" },
            { cmd: "tr 'a-z' 'A-Z'", desc: "# Convert lowercase to uppercase" },
            { cmd: "xargs", desc: "# Build commands from piped input" },
            { cmd: "column -t <file>", desc: "# Align output into columns" },
            { cmd: "jq '.' <file.json>", desc: "# Pretty-print and query JSON" },
            { cmd: "sort <file> | uniq -c | sort -nr | head", desc: "# Top most frequent lines" }
        ]
    },
    {
        title: "Permissions & Ownership",
        commands: [
            { cmd: "ls -l", desc: "# View permissions" },
            { cmd: "chmod 755 <file>", desc: "# rwx for owner, rx for group/others" },
            { cmd: "chmod 644 <file>", desc: "# rw for owner, r for group/others" },
            { cmd: "chmod 600 <file>", desc: "# Owner-only read/write (SSH keys, .env)" },
            { cmd: "chmod +x <file>", desc: "# Make a file executable" },
            { cmd: "chmod -R 755 <folder>", desc: "# Change permissions recursively" },
            { cmd: "chown user:group <file>", desc: "# Change owner and group" },
            { cmd: "chown -R user:group <folder>", desc: "# Change ownership recursively" },
            { cmd: "umask", desc: "# Show default permission mask" },
            { cmd: "stat -c '%a %n' <file>", desc: "# Show numeric permissions" }
        ]
    },
    {
        title: "Users & Groups",
        commands: [
            { cmd: "whoami", desc: "# Show current user" },
            { cmd: "id", desc: "# Show user ID and groups" },
            { cmd: "who", desc: "# Show logged-in users" },
            { cmd: "last", desc: "# Show login history" },
            { cmd: "sudo <command>", desc: "# Run a command as root" },
            { cmd: "sudo su -", desc: "# Switch to the root user" },
            { cmd: "adduser <username>", desc: "# Create a new user" },
            { cmd: "usermod -aG sudo <username>", desc: "# Add a user to the sudo group" },
            { cmd: "passwd <username>", desc: "# Change a user's password" },
            { cmd: "deluser --remove-home <username>", desc: "# Delete a user and their home folder" },
            { cmd: "groups <username>", desc: "# Show a user's groups" },
            { cmd: "visudo", desc: "# Safely edit the sudoers file" }
        ]
    },
    {
        title: "Processes",
        commands: [
            { cmd: "ps aux", desc: "# List all running processes" },
            { cmd: "ps aux | grep <name>", desc: "# Find a specific process" },
            { cmd: "top", desc: "# Live process monitor" },
            { cmd: "htop", desc: "# Better interactive process monitor" },
            { cmd: "pgrep -f <name>", desc: "# Get PIDs by name" },
            { cmd: "kill <pid>", desc: "# Gracefully stop a process" },
            { cmd: "kill -9 <pid>", desc: "# Force kill a process" },
            { cmd: "pkill -f <name>", desc: "# Kill processes by name" },
            { cmd: "lsof -i :3000", desc: "# See what is using port 3000" },
            { cmd: "kill -9 $(lsof -t -i:3000)", desc: "# Kill whatever is using port 3000" },
            { cmd: "<command> &", desc: "# Run a command in the background" },
            { cmd: "jobs", desc: "# List background jobs" },
            { cmd: "fg %1", desc: "# Bring job 1 to the foreground" },
            { cmd: "nohup <command> &", desc: "# Keep running after logout" },
            { cmd: "uptime", desc: "# Show uptime and load average" }
        ]
    },
    {
        title: "Disk & Memory",
        commands: [
            { cmd: "df -h", desc: "# Disk space usage per filesystem" },
            { cmd: "du -sh <folder>", desc: "# Total size of a folder" },
            { cmd: "du -h --max-depth=1 | sort -hr", desc: "# Folder sizes sorted, biggest first" },
            { cmd: "ncdu", desc: "# Interactive disk usage explorer" },
            { cmd: "free -h", desc: "# Memory usage" },
            { cmd: "lsblk", desc: "# List block devices and partitions" },
            { cmd: "mount", desc: "# Show mounted filesystems" },
            { cmd: "sudo umount <mount-point>", desc: "# Unmount a filesystem" }
        ]
    },
    {
        title: "Networking",
        commands: [
            { cmd: "ip a", desc: "# Show network interfaces and IPs" },
            { cmd: "hostname -I", desc: "# Show IP addresses of this machine" },
            { cmd: "ping -c 4 <host>", desc: "# Test connectivity" },
            { cmd: "curl <url>", desc: "# Fetch a URL" },
            { cmd: "curl -I <url>", desc: "# Fetch only response headers" },
            { cmd: "curl -O <url>", desc: "# Download a file" },
            { cmd: "curl -X POST -H 'Content-Type: application/json' -d '{\"a\":1}' <url>", desc: "# Send a JSON POST request" },
            { cmd: "wget <url>", desc: "# Download a file" },
            { cmd: "ss -tulpn", desc: "# List listening ports and their processes" },
            { cmd: "dig +short <domain>", desc: "# DNS lookup" },
            { cmd: "traceroute <host>", desc: "# Trace the route to a host" },
            { cmd: "nc -zv <host> <port>", desc: "# Check if a port is open" },
            { cmd: "ip route", desc: "# Show routing table" }
        ]
    },
    {
        title: "Package Management (apt / dnf / snap)",
        commands: [
            { cmd: "sudo apt update", desc: "# Refresh package lists" },
            { cmd: "sudo apt upgrade -y", desc: "# Upgrade installed packages" },
            { cmd: "sudo apt install <package>", desc: "# Install a package" },
            { cmd: "sudo apt remove <package>", desc: "# Remove a package" },
            { cmd: "sudo apt purge <package>", desc: "# Remove a package and its config" },
            { cmd: "sudo apt autoremove", desc: "# Remove unused dependencies" },
            { cmd: "apt search <keyword>", desc: "# Search for packages" },
            { cmd: "apt list --installed", desc: "# List installed packages" },
            { cmd: "sudo dpkg -i <file.deb>", desc: "# Install a .deb file" },
            { cmd: "sudo dnf install <package>", desc: "# Install a package (Fedora/RHEL)" },
            { cmd: "sudo dnf update", desc: "# Update packages (Fedora/RHEL)" },
            { cmd: "sudo snap install <package>", desc: "# Install a snap package" }
        ]
    },
    {
        title: "Archives & Compression",
        commands: [
            { cmd: "tar -czvf archive.tar.gz <folder>", desc: "# Create a .tar.gz archive" },
            { cmd: "tar -xzvf archive.tar.gz", desc: "# Extract a .tar.gz archive" },
            { cmd: "tar -xzvf archive.tar.gz -C <dest>", desc: "# Extract into a specific folder" },
            { cmd: "tar -tf archive.tar.gz", desc: "# List archive contents" },
            { cmd: "zip -r archive.zip <folder>", desc: "# Create a zip archive" },
            { cmd: "unzip archive.zip", desc: "# Extract a zip archive" },
            { cmd: "unzip archive.zip -d <dest>", desc: "# Extract a zip into a folder" },
            { cmd: "gzip <file>", desc: "# Compress a file" },
            { cmd: "gunzip <file.gz>", desc: "# Decompress a file" }
        ]
    },
    {
        title: "System Info",
        commands: [
            { cmd: "uname -a", desc: "# Kernel and system info" },
            { cmd: "cat /etc/os-release", desc: "# Show OS/distro version" },
            { cmd: "hostnamectl", desc: "# Hostname and OS details" },
            { cmd: "lscpu", desc: "# CPU information" },
            { cmd: "date", desc: "# Show current date and time" },
            { cmd: "timedatectl", desc: "# Show time zone and clock status" },
            { cmd: "env", desc: "# Show environment variables" },
            { cmd: "dmesg | tail", desc: "# Latest kernel messages" },
            { cmd: "history", desc: "# Show command history" }
        ]
    },
    {
        title: "Environment & Shell",
        commands: [
            { cmd: "export NAME=value", desc: "# Set an environment variable for this session" },
            { cmd: "echo $NAME", desc: "# Print a variable" },
            { cmd: "echo $PATH", desc: "# Show PATH" },
            { cmd: "export PATH=$PATH:/new/path", desc: "# Add a folder to PATH" },
            { cmd: "unset NAME", desc: "# Remove a variable" },
            { cmd: "source ~/.bashrc", desc: "# Reload shell config" },
            { cmd: "alias ll='ls -lah'", desc: "# Create a shortcut" },
            { cmd: "history | grep <text>", desc: "# Search command history" },
            { cmd: "!!", desc: "# Re-run the last command" },
            { cmd: "sudo !!", desc: "# Re-run the last command with sudo" },
            { cmd: "Ctrl + R", desc: "# Reverse search command history" },
            { cmd: "Ctrl + C", desc: "# Stop the running command" },
            { cmd: "Ctrl + L", desc: "# Clear the screen" },
            { cmd: "clear", desc: "# Clear the terminal" }
        ]
    },
    {
        title: "Pipes & Redirection",
        commands: [
            { cmd: "cmd1 | cmd2", desc: "# Pipe output of cmd1 into cmd2" },
            { cmd: "cmd > file", desc: "# Redirect output to a file (overwrite)" },
            { cmd: "cmd >> file", desc: "# Append output to a file" },
            { cmd: "cmd 2> errors.log", desc: "# Redirect errors only" },
            { cmd: "cmd > out.log 2>&1", desc: "# Redirect output and errors together" },
            { cmd: "cmd > /dev/null 2>&1", desc: "# Silence all output" },
            { cmd: "cmd | tee file", desc: "# Show output and save it to a file" },
            { cmd: "cmd1 && cmd2", desc: "# Run cmd2 only if cmd1 succeeds" },
            { cmd: "cmd1 || cmd2", desc: "# Run cmd2 only if cmd1 fails" },
            { cmd: "cmd1 ; cmd2", desc: "# Run both regardless of result" },
            { cmd: "echo $(date)", desc: "# Use command output inside another command" }
        ]
    },
    {
        title: "SSH & File Transfer",
        commands: [
            { cmd: "ssh user@host", desc: "# Connect to a remote server" },
            { cmd: "ssh -p 2222 user@host", desc: "# Connect using a custom port" },
            { cmd: "ssh -i ~/.ssh/<key> user@host", desc: "# Connect with a specific key" },
            { cmd: "ssh-copy-id user@host", desc: "# Copy your public key to a server" },
            { cmd: "scp <file> user@host:/path/", desc: "# Copy a file to a server" },
            { cmd: "scp user@host:/path/<file> .", desc: "# Copy a file from a server" },
            { cmd: "scp -r <folder> user@host:/path/", desc: "# Copy a folder to a server" },
            { cmd: "rsync -avz <src>/ user@host:/path/", desc: "# Sync files to a server (fast, resumable)" },
            { cmd: "rsync -avz --delete <src>/ user@host:/path/", desc: "# Sync and delete extra files on destination" },
            { cmd: "sftp user@host", desc: "# Interactive file transfer session" }
        ]
    },
    {
        title: "Cron & Scheduling",
        commands: [
            { cmd: "crontab -e", desc: "# Edit your cron jobs" },
            { cmd: "crontab -l", desc: "# List your cron jobs" },
            { cmd: "crontab -r", desc: "# Remove all your cron jobs" },
            { cmd: "0 2 * * * /path/script.sh", desc: "# Cron: run daily at 2:00 AM" },
            { cmd: "*/5 * * * * /path/script.sh", desc: "# Cron: run every 5 minutes" },
            { cmd: "@reboot /path/script.sh", desc: "# Cron: run at system startup" },
            { cmd: "watch -n 2 <command>", desc: "# Re-run a command every 2 seconds" },
            { cmd: "sleep 5", desc: "# Pause for 5 seconds" }
        ]
    },
    {
        title: "Terminal Multiplexers (tmux / screen)",
        commands: [
            { cmd: "tmux new -s <name>", desc: "# Start a named tmux session" },
            { cmd: "tmux ls", desc: "# List tmux sessions" },
            { cmd: "tmux attach -t <name>", desc: "# Reattach to a session" },
            { cmd: "Ctrl + B, then D", desc: "# Detach from the tmux session" },
            { cmd: "Ctrl + B, then %", desc: "# Split pane vertically" },
            { cmd: "Ctrl + B, then \"", desc: "# Split pane horizontally" },
            { cmd: "tmux kill-session -t <name>", desc: "# Kill a session" },
            { cmd: "screen -S <name>", desc: "# Start a named screen session" },
            { cmd: "screen -r <name>", desc: "# Reattach to a screen session" }
        ]
    },
    {
        title: "Help & Documentation",
        commands: [
            { cmd: "man <command>", desc: "# Open the manual for a command" },
            { cmd: "<command> --help", desc: "# Quick usage help" },
            { cmd: "apropos <keyword>", desc: "# Search manuals by keyword" },
            { cmd: "tldr <command>", desc: "# Short, practical examples (needs tldr)" },
            { cmd: "type <command>", desc: "# Show if a command is a builtin, alias or binary" }
        ]
    }
];
