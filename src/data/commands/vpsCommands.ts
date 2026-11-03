import { ICommandCard } from "@/types/global.type";


export const vpsCommands : ICommandCard[] = [
    {
        title: "First Login & Updates",
        commands: [
            { cmd: "ssh root@<server-ip>", desc: "# First login to a fresh VPS" },
            { cmd: "apt update && apt upgrade -y", desc: "# Update all packages" },
            { cmd: "hostnamectl set-hostname <name>", desc: "# Set the server hostname" },
            { cmd: "timedatectl set-timezone Asia/Dhaka", desc: "# Set the time zone" },
            { cmd: "timedatectl list-timezones | grep <city>", desc: "# Find a time zone name" },
            { cmd: "apt install -y curl git ufw htop unzip build-essential", desc: "# Install essential tools" }
        ]
    },
    {
        title: "Create a Deploy User",
        commands: [
            { cmd: "adduser deploy", desc: "# Create a non-root user" },
            { cmd: "usermod -aG sudo deploy", desc: "# Give the user sudo access" },
            { cmd: "rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy", desc: "# Copy root's SSH keys to the new user" },
            { cmd: "ssh-copy-id deploy@<server-ip>", desc: "# Add your local key from your own machine" },
            { cmd: "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys", desc: "# Fix SSH folder permissions" },
            { cmd: "su - deploy", desc: "# Switch to the deploy user" },
            { cmd: "ssh deploy@<server-ip>", desc: "# Test login as the new user (before locking root)" }
        ]
    },
    {
        title: "SSH Hardening",
        commands: [
            { cmd: "sudo nano /etc/ssh/sshd_config", desc: "# Edit SSH server config" },
            { cmd: "PermitRootLogin no", desc: "# sshd_config: disable root login" },
            { cmd: "PasswordAuthentication no", desc: "# sshd_config: allow key-based login only" },
            { cmd: "Port 2222", desc: "# sshd_config: change the SSH port (optional)" },
            { cmd: "sudo sshd -t", desc: "# Test SSH config for errors before restarting" },
            { cmd: "sudo systemctl restart ssh", desc: "# Apply SSH changes (Ubuntu/Debian; 'sshd' on RHEL)" },
            { cmd: "ssh -p 2222 deploy@<server-ip>", desc: "# Connect on a custom port (keep your old session open until this works)" },
            { cmd: "Host myvps\\n  HostName <server-ip>\\n  User deploy\\n  Port 2222\\n  IdentityFile ~/.ssh/<key>", desc: "# ~/.ssh/config entry so you can just run: ssh myvps" }
        ]
    },
    {
        title: "Firewall (UFW)",
        commands: [
            { cmd: "sudo ufw status verbose", desc: "# Show firewall status and rules" },
            { cmd: "sudo ufw default deny incoming", desc: "# Block all incoming by default" },
            { cmd: "sudo ufw default allow outgoing", desc: "# Allow all outgoing by default" },
            { cmd: "sudo ufw allow OpenSSH", desc: "# Allow SSH (do this BEFORE enabling)" },
            { cmd: "sudo ufw allow 2222/tcp", desc: "# Allow a custom SSH port" },
            { cmd: "sudo ufw allow 80/tcp", desc: "# Allow HTTP" },
            { cmd: "sudo ufw allow 443/tcp", desc: "# Allow HTTPS" },
            { cmd: "sudo ufw allow 'Nginx Full'", desc: "# Allow HTTP + HTTPS for Nginx" },
            { cmd: "sudo ufw allow from <ip> to any port 5432", desc: "# Allow a specific IP to a specific port" },
            { cmd: "sudo ufw enable", desc: "# Turn the firewall on" },
            { cmd: "sudo ufw status numbered", desc: "# List rules with numbers" },
            { cmd: "sudo ufw delete <number>", desc: "# Delete a rule by number" },
            { cmd: "sudo ufw reload", desc: "# Reload firewall rules" },
            { cmd: "sudo ufw disable", desc: "# Turn the firewall off" }
        ]
    },
    {
        title: "Security (Fail2ban & Auto-updates)",
        commands: [
            { cmd: "sudo apt install fail2ban -y", desc: "# Install Fail2ban (blocks brute-force attempts)" },
            { cmd: "sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local", desc: "# Create an editable local config" },
            { cmd: "sudo systemctl enable --now fail2ban", desc: "# Start Fail2ban and enable on boot" },
            { cmd: "sudo fail2ban-client status", desc: "# List active jails" },
            { cmd: "sudo fail2ban-client status sshd", desc: "# Show banned IPs for SSH" },
            { cmd: "sudo fail2ban-client set sshd unbanip <ip>", desc: "# Unban an IP" },
            { cmd: "sudo apt install unattended-upgrades -y", desc: "# Install automatic security updates" },
            { cmd: "sudo dpkg-reconfigure --priority=low unattended-upgrades", desc: "# Enable automatic security updates" },
            { cmd: "sudo ss -tulpn", desc: "# Audit open ports and listening services" },
            { cmd: "last -a", desc: "# Review recent logins" },
            { cmd: "sudo lastb", desc: "# Review failed login attempts" },
            { cmd: "sudo grep 'Failed password' /var/log/auth.log | tail", desc: "# Recent failed SSH logins" }
        ]
    },
    {
        title: "Swap Space",
        commands: [
            { cmd: "swapon --show", desc: "# Check if swap exists" },
            { cmd: "sudo fallocate -l 2G /swapfile", desc: "# Create a 2GB swap file" },
            { cmd: "sudo chmod 600 /swapfile", desc: "# Secure the swap file" },
            { cmd: "sudo mkswap /swapfile", desc: "# Format it as swap" },
            { cmd: "sudo swapon /swapfile", desc: "# Enable swap" },
            { cmd: "echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab", desc: "# Make swap permanent across reboots" },
            { cmd: "sudo sysctl vm.swappiness=10", desc: "# Make the system prefer RAM over swap" },
            { cmd: "free -h", desc: "# Verify memory and swap" },
            { cmd: "sudo swapoff /swapfile", desc: "# Disable swap" }
        ]
    },
    {
        title: "Runtime & Web Stack Setup",
        commands: [
            { cmd: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash", desc: "# Install nvm (Node version manager)" },
            { cmd: "nvm install --lts", desc: "# Install the latest Node.js LTS" },
            { cmd: "sudo npm install -g pm2", desc: "# Install the PM2 process manager" },
            { cmd: "sudo apt install nginx -y", desc: "# Install Nginx" },
            { cmd: "curl -fsSL https://get.docker.com | sh", desc: "# Install Docker" },
            { cmd: "sudo usermod -aG docker $USER", desc: "# Run Docker without sudo (re-login required)" },
            { cmd: "sudo apt install postgresql postgresql-contrib -y", desc: "# Install PostgreSQL" },
            { cmd: "sudo apt install redis-server -y", desc: "# Install Redis" },
            { cmd: "ssh-keygen -t ed25519 -C 'deploy@server'", desc: "# Generate a deploy key to add to GitHub (read-only)" }
        ]
    },
    {
        title: "Domain & SSL (Let's Encrypt)",
        commands: [
            { cmd: "dig +short example.com", desc: "# Check domain points to your server IP" },
            { cmd: "sudo apt install certbot python3-certbot-nginx -y", desc: "# Install Certbot for Nginx" },
            { cmd: "sudo certbot --nginx -d example.com -d www.example.com", desc: "# Get and install an SSL certificate" },
            { cmd: "sudo certbot renew --dry-run", desc: "# Test automatic renewal" },
            { cmd: "sudo certbot certificates", desc: "# List installed certificates and expiry dates" },
            { cmd: "systemctl list-timers | grep certbot", desc: "# Confirm the auto-renew timer is active" }
        ]
    },
    {
        title: "Monitoring & Resources",
        commands: [
            { cmd: "htop", desc: "# Live CPU, RAM and process view" },
            { cmd: "uptime", desc: "# Load average and uptime" },
            { cmd: "free -h", desc: "# Memory usage" },
            { cmd: "df -h", desc: "# Disk usage" },
            { cmd: "sudo du -sh /var/log/*", desc: "# Find large log folders" },
            { cmd: "ncdu /", desc: "# Interactive disk usage explorer" },
            { cmd: "vmstat 1 5", desc: "# CPU, memory and I/O stats over 5 seconds" },
            { cmd: "ss -s", desc: "# Network connection summary" },
            { cmd: "sudo journalctl -p err -b", desc: "# Errors since last boot" }
        ]
    },
    {
        title: "Deploy Files & Backups",
        commands: [
            { cmd: "scp -r ./dist deploy@<server-ip>:/var/www/<app>", desc: "# Upload a folder to the server" },
            { cmd: "rsync -avz --delete ./build/ deploy@<server-ip>:/var/www/<app>/", desc: "# Sync a build folder to the server" },
            { cmd: "rsync -avz deploy@<server-ip>:/var/www/<app> ./backup", desc: "# Download a backup from the server" },
            { cmd: "tar -czf backup-$(date +%F).tar.gz /var/www/<app>", desc: "# Create a dated backup archive" },
            { cmd: "sudo chown -R deploy:www-data /var/www/<app>", desc: "# Set correct ownership for web files" },
            { cmd: "find /backups -type f -mtime +7 -delete", desc: "# Delete backups older than 7 days" }
        ]
    },
    {
        title: "SSH Keys & Tunnels",
        commands: [
            { cmd: "ssh-keygen -t ed25519 -f ~/.ssh/<name> -C 'comment'", desc: "# Generate a named SSH key" },
            { cmd: "ssh-add -l", desc: "# List keys loaded in the agent" },
            { cmd: "ssh-keygen -R <server-ip>", desc: "# Remove an old host key (after reinstalling a server)" },
            { cmd: "ssh -L 5432:localhost:5432 deploy@<server-ip> -N", desc: "# Tunnel a remote DB port to your machine" },
            { cmd: "ssh -R 8080:localhost:3000 deploy@<server-ip> -N", desc: "# Expose a local port on the server" },
            { cmd: "ssh -D 1080 deploy@<server-ip> -N", desc: "# Create a SOCKS proxy through the server" },
            { cmd: "ssh -v deploy@<server-ip>", desc: "# Verbose output for debugging connection issues" }
        ]
    },
    {
        title: "Maintenance & Reboot",
        commands: [
            { cmd: "cat /var/run/reboot-required", desc: "# Check if a reboot is needed after updates" },
            { cmd: "uname -r", desc: "# Show the running kernel version" },
            { cmd: "sudo reboot", desc: "# Reboot the server" },
            { cmd: "sudo shutdown -r +5", desc: "# Reboot in 5 minutes" },
            { cmd: "sudo shutdown -h now", desc: "# Power off immediately" },
            { cmd: "sudo apt autoremove -y && sudo apt autoclean", desc: "# Clean unused packages and cache" },
            { cmd: "sudo journalctl --vacuum-time=7d", desc: "# Trim system logs older than 7 days" },
            { cmd: "docker system prune -af", desc: "# Remove all unused Docker data (careful!)" }
        ]
    }
];
