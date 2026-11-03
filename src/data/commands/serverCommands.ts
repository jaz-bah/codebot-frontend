import { ICommandCard } from "@/types/global.type";


export const serverCommands : ICommandCard[] = [
    {
        title: "Systemd Services",
        commands: [
            { cmd: "sudo systemctl status <service>", desc: "# Check service status" },
            { cmd: "sudo systemctl start <service>", desc: "# Start a service" },
            { cmd: "sudo systemctl stop <service>", desc: "# Stop a service" },
            { cmd: "sudo systemctl restart <service>", desc: "# Restart a service" },
            { cmd: "sudo systemctl reload <service>", desc: "# Reload config without downtime" },
            { cmd: "sudo systemctl enable <service>", desc: "# Start automatically on boot" },
            { cmd: "sudo systemctl enable --now <service>", desc: "# Enable on boot and start now" },
            { cmd: "sudo systemctl disable <service>", desc: "# Disable start on boot" },
            { cmd: "systemctl is-active <service>", desc: "# Print active/inactive" },
            { cmd: "systemctl list-units --type=service --state=running", desc: "# List running services" },
            { cmd: "systemctl --failed", desc: "# List failed services" },
            { cmd: "sudo nano /etc/systemd/system/<app>.service", desc: "# Create a custom service file" },
            { cmd: "sudo systemctl daemon-reload", desc: "# Reload systemd after editing service files" },
            { cmd: "systemd-analyze blame", desc: "# See what slows down boot" }
        ]
    },
    {
        title: "Journal Logs (journalctl)",
        commands: [
            { cmd: "sudo journalctl -u <service>", desc: "# Logs for a service" },
            { cmd: "sudo journalctl -u <service> -f", desc: "# Follow service logs live" },
            { cmd: "sudo journalctl -u <service> -n 100", desc: "# Last 100 log lines" },
            { cmd: "sudo journalctl -u <service> --since today", desc: "# Logs since today" },
            { cmd: "sudo journalctl --since '1 hour ago'", desc: "# Logs from the last hour" },
            { cmd: "sudo journalctl -p err -b", desc: "# Errors since last boot" },
            { cmd: "sudo journalctl -xe", desc: "# Latest logs with explanations" },
            { cmd: "sudo journalctl --disk-usage", desc: "# Show log disk usage" },
            { cmd: "sudo journalctl --vacuum-time=7d", desc: "# Delete logs older than 7 days" }
        ]
    },
    {
        title: "Nginx",
        commands: [
            { cmd: "sudo nginx -t", desc: "# Test config for syntax errors" },
            { cmd: "sudo systemctl reload nginx", desc: "# Apply config changes without downtime" },
            { cmd: "sudo systemctl restart nginx", desc: "# Restart Nginx" },
            { cmd: "sudo nginx -T", desc: "# Dump the full effective config" },
            { cmd: "nginx -v", desc: "# Show Nginx version" },
            { cmd: "sudo nano /etc/nginx/sites-available/<site>", desc: "# Create or edit a site config" },
            { cmd: "sudo ln -s /etc/nginx/sites-available/<site> /etc/nginx/sites-enabled/", desc: "# Enable a site" },
            { cmd: "sudo rm /etc/nginx/sites-enabled/<site>", desc: "# Disable a site" },
            { cmd: "sudo rm /etc/nginx/sites-enabled/default", desc: "# Remove the default site" },
            { cmd: "sudo tail -f /var/log/nginx/error.log", desc: "# Watch Nginx error log" },
            { cmd: "sudo tail -f /var/log/nginx/access.log", desc: "# Watch Nginx access log" },
            { cmd: "sudo chown -R www-data:www-data /var/www/<site>", desc: "# Give Nginx ownership of web files" },
            { cmd: "curl -I http://localhost", desc: "# Quick local check of the response" }
        ]
    },
    {
        title: "Apache",
        commands: [
            { cmd: "sudo apache2ctl configtest", desc: "# Test Apache config" },
            { cmd: "sudo systemctl reload apache2", desc: "# Reload Apache" },
            { cmd: "sudo a2ensite <site>", desc: "# Enable a site" },
            { cmd: "sudo a2dissite <site>", desc: "# Disable a site" },
            { cmd: "sudo a2enmod rewrite", desc: "# Enable a module (e.g. rewrite)" },
            { cmd: "sudo tail -f /var/log/apache2/error.log", desc: "# Watch Apache error log" }
        ]
    },
    {
        title: "PM2 (Node.js Process Manager)",
        commands: [
            { cmd: "pm2 start npm --name <app> -- start", desc: "# Start an npm script under PM2" },
            { cmd: "pm2 start dist/main.js --name <api>", desc: "# Start a built file (e.g. NestJS)" },
            { cmd: "pm2 start ecosystem.config.js", desc: "# Start apps from an ecosystem file" },
            { cmd: "pm2 start app.js -i max", desc: "# Run in cluster mode on all CPU cores" },
            { cmd: "pm2 list", desc: "# List all processes" },
            { cmd: "pm2 logs", desc: "# Stream all logs" },
            { cmd: "pm2 logs <app> --lines 100", desc: "# Show last 100 lines for one app" },
            { cmd: "pm2 monit", desc: "# Live CPU and memory dashboard" },
            { cmd: "pm2 describe <app>", desc: "# Detailed info about a process" },
            { cmd: "pm2 restart <app>", desc: "# Restart an app" },
            { cmd: "pm2 reload <app>", desc: "# Zero-downtime reload (cluster mode)" },
            { cmd: "pm2 stop <app>", desc: "# Stop an app" },
            { cmd: "pm2 delete <app>", desc: "# Remove an app from PM2" },
            { cmd: "pm2 save", desc: "# Save the current process list" },
            { cmd: "pm2 startup", desc: "# Generate a boot startup script (run the command it prints)" },
            { cmd: "pm2 flush", desc: "# Clear all logs" },
            { cmd: "pm2 update", desc: "# Update the in-memory PM2 daemon" }
        ]
    },
    {
        title: "Docker",
        commands: [
            { cmd: "docker ps", desc: "# List running containers" },
            { cmd: "docker ps -a", desc: "# List all containers" },
            { cmd: "docker images", desc: "# List images" },
            { cmd: "docker build -t <name>:<tag> .", desc: "# Build an image from a Dockerfile" },
            { cmd: "docker run -d -p 3000:3000 --name <name> <image>", desc: "# Run a container in the background" },
            { cmd: "docker run --rm -it <image> sh", desc: "# Run a temporary interactive container" },
            { cmd: "docker logs -f <container>", desc: "# Follow container logs" },
            { cmd: "docker exec -it <container> sh", desc: "# Open a shell inside a container" },
            { cmd: "docker stop <container>", desc: "# Stop a container" },
            { cmd: "docker restart <container>", desc: "# Restart a container" },
            { cmd: "docker rm <container>", desc: "# Remove a container" },
            { cmd: "docker rmi <image>", desc: "# Remove an image" },
            { cmd: "docker pull <image>", desc: "# Download an image" },
            { cmd: "docker cp <container>:/path/file ./", desc: "# Copy a file out of a container" },
            { cmd: "docker stats", desc: "# Live resource usage per container" },
            { cmd: "docker inspect <container>", desc: "# Show detailed container info" },
            { cmd: "docker volume ls", desc: "# List volumes" },
            { cmd: "docker network ls", desc: "# List networks" },
            { cmd: "docker system df", desc: "# Show Docker disk usage" },
            { cmd: "docker system prune -af", desc: "# Remove all unused data (careful!)" }
        ]
    },
    {
        title: "Docker Compose",
        commands: [
            { cmd: "docker compose up -d", desc: "# Start all services in the background" },
            { cmd: "docker compose up -d --build", desc: "# Rebuild images and start" },
            { cmd: "docker compose down", desc: "# Stop and remove containers" },
            { cmd: "docker compose down -v", desc: "# Also remove volumes (deletes data!)" },
            { cmd: "docker compose ps", desc: "# List compose services" },
            { cmd: "docker compose logs -f <service>", desc: "# Follow logs for a service" },
            { cmd: "docker compose restart <service>", desc: "# Restart a service" },
            { cmd: "docker compose exec <service> sh", desc: "# Open a shell in a service" },
            { cmd: "docker compose pull", desc: "# Pull latest images" },
            { cmd: "docker compose build --no-cache", desc: "# Rebuild images from scratch" },
            { cmd: "docker compose config", desc: "# Validate and view the final compose config" },
            { cmd: "docker compose run --rm <service> <command>", desc: "# Run a one-off command in a service" }
        ]
    },
    {
        title: "Logs & Troubleshooting",
        commands: [
            { cmd: "sudo tail -f /var/log/syslog", desc: "# Watch system log" },
            { cmd: "sudo tail -f /var/log/auth.log", desc: "# Watch authentication log" },
            { cmd: "ls -lh /var/log", desc: "# See log file sizes" },
            { cmd: "grep -i 'error' <logfile> | tail -50", desc: "# Latest errors in a log" },
            { cmd: "zcat /var/log/nginx/access.log.*.gz | grep <text>", desc: "# Search rotated (compressed) logs" },
            { cmd: "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head", desc: "# Top IPs hitting your server" },
            { cmd: "awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr", desc: "# Count of HTTP status codes" },
            { cmd: "sudo logrotate -d /etc/logrotate.conf", desc: "# Dry run log rotation" },
            { cmd: "dmesg | tail", desc: "# Latest kernel messages (OOM kills, disk errors)" },
            { cmd: "sudo dmesg | grep -i 'killed process'", desc: "# Check if the OOM killer stopped something" }
        ]
    },
    {
        title: "PostgreSQL",
        commands: [
            { cmd: "sudo systemctl status postgresql", desc: "# Check PostgreSQL service" },
            { cmd: "sudo -u postgres psql", desc: "# Open psql as the postgres user" },
            { cmd: "psql -U <user> -d <db> -h localhost", desc: "# Connect to a database" },
            { cmd: "\\l", desc: "# psql: list databases" },
            { cmd: "\\c <db>", desc: "# psql: connect to a database" },
            { cmd: "\\dt", desc: "# psql: list tables" },
            { cmd: "\\d <table>", desc: "# psql: describe a table" },
            { cmd: "\\du", desc: "# psql: list roles" },
            { cmd: "\\q", desc: "# psql: quit" },
            { cmd: "CREATE USER <user> WITH PASSWORD '<password>';", desc: "# SQL: create a user" },
            { cmd: "CREATE DATABASE <db> OWNER <user>;", desc: "# SQL: create a database" },
            { cmd: "pg_dump -U <user> <db> > backup.sql", desc: "# Backup a database" },
            { cmd: "pg_dump -Fc -U <user> <db> > backup.dump", desc: "# Backup in compressed custom format" },
            { cmd: "psql -U <user> <db> < backup.sql", desc: "# Restore from a SQL backup" },
            { cmd: "pg_restore -U <user> -d <db> backup.dump", desc: "# Restore from a custom-format backup" }
        ]
    },
    {
        title: "MySQL / MariaDB",
        commands: [
            { cmd: "sudo systemctl status mysql", desc: "# Check MySQL service" },
            { cmd: "sudo mysql_secure_installation", desc: "# Secure a fresh MySQL install" },
            { cmd: "mysql -u root -p", desc: "# Open the MySQL shell" },
            { cmd: "SHOW DATABASES;", desc: "# SQL: list databases" },
            { cmd: "CREATE DATABASE <db>;", desc: "# SQL: create a database" },
            { cmd: "CREATE USER '<user>'@'localhost' IDENTIFIED BY '<password>';", desc: "# SQL: create a user" },
            { cmd: "GRANT ALL PRIVILEGES ON <db>.* TO '<user>'@'localhost'; FLUSH PRIVILEGES;", desc: "# SQL: give a user access to a database" },
            { cmd: "mysqldump -u <user> -p <db> > backup.sql", desc: "# Backup a database" },
            { cmd: "mysql -u <user> -p <db> < backup.sql", desc: "# Restore a database" }
        ]
    },
    {
        title: "Redis",
        commands: [
            { cmd: "sudo systemctl status redis-server", desc: "# Check Redis service" },
            { cmd: "redis-cli", desc: "# Open the Redis shell" },
            { cmd: "redis-cli ping", desc: "# Test connection (expects PONG)" },
            { cmd: "redis-cli info memory", desc: "# Memory usage details" },
            { cmd: "redis-cli --scan --pattern 'user:*'", desc: "# Safely list keys by pattern (avoid KEYS in production)" },
            { cmd: "redis-cli get <key>", desc: "# Read a key" },
            { cmd: "redis-cli del <key>", desc: "# Delete a key" },
            { cmd: "redis-cli monitor", desc: "# Watch commands in real time" },
            { cmd: "redis-cli flushall", desc: "# Delete ALL data (careful!)" }
        ]
    },
    {
        title: "Git-based Deployment",
        commands: [
            { cmd: "cd /var/www/<app> && git pull origin main", desc: "# Pull the latest code" },
            { cmd: "npm ci --omit=dev", desc: "# Clean install of production dependencies" },
            { cmd: "npm run build", desc: "# Build the app" },
            { cmd: "pm2 reload <app>", desc: "# Reload the app with no downtime" },
            { cmd: "git pull && npm ci && npm run build && pm2 reload <app>", desc: "# One-line deploy" },
            { cmd: "git log --oneline -5", desc: "# See recent commits before rollback" },
            { cmd: "git reset --hard <commit-id> && npm ci && npm run build && pm2 reload <app>", desc: "# Roll back to a previous commit" },
            { cmd: "ln -sfn /var/www/releases/<id> /var/www/current", desc: "# Switch the 'current' release symlink (atomic deploys)" },
            { cmd: "chmod 600 .env", desc: "# Restrict access to environment secrets" },
            { cmd: "set -a; source .env; set +a", desc: "# Load .env variables into the current shell" }
        ]
    },
    {
        title: "Cron Jobs & Automated Backups",
        commands: [
            { cmd: "crontab -e", desc: "# Edit cron jobs" },
            { cmd: "0 2 * * * /home/deploy/backup.sh >> /var/log/backup.log 2>&1", desc: "# Run a backup script every day at 2 AM" },
            { cmd: "*/5 * * * * curl -fsS https://example.com/health > /dev/null", desc: "# Ping a health endpoint every 5 minutes" },
            { cmd: "0 3 * * 0 certbot renew --quiet", desc: "# Renew SSL weekly (if not using the systemd timer)" },
            { cmd: "chmod +x /home/deploy/backup.sh", desc: "# Make a script executable" },
            { cmd: "find /backups -type f -mtime +7 -delete", desc: "# Delete backups older than 7 days" },
            { cmd: "grep CRON /var/log/syslog | tail", desc: "# Check if cron jobs ran" }
        ]
    },
    {
        title: "Health & Performance Checks",
        commands: [
            { cmd: "curl -I https://example.com", desc: "# Check response headers and status" },
            { cmd: "curl -o /dev/null -s -w '%{http_code} %{time_total}s\\n' https://example.com", desc: "# Status code and response time" },
            { cmd: "ss -tulpn | grep :3000", desc: "# Check if the app is listening on a port" },
            { cmd: "lsof -i :3000", desc: "# See which process owns a port" },
            { cmd: "htop", desc: "# CPU and memory per process" },
            { cmd: "vmstat 1 5", desc: "# CPU, memory and I/O over time" },
            { cmd: "iostat -x 1 3", desc: "# Disk I/O stats (needs sysstat)" },
            { cmd: "ab -n 1000 -c 50 http://localhost:3000/", desc: "# Quick load test (apache2-utils)" },
            { cmd: "echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates", desc: "# Check SSL certificate expiry" }
        ]
    }
];
