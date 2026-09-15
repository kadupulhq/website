#!/bin/sh
# Run as root on the Weblate host. Credentials stay inside the database container.
set -eu
umask 077
cd /opt/kadupul-weblate
backup_dir=/var/backups/kadupul-weblate
install -d -m 0700 "$backup_dir"
backup_file="$backup_dir/database-$(date -u +%Y%m%dT%H%M%SZ).dump"
backup_temp=$(mktemp "$backup_dir/.database-XXXXXX")
trap 'rm -f "$backup_temp"' EXIT HUP INT TERM
/usr/bin/docker compose exec -T database pg_dump -U weblate -Fc weblate </dev/null > "$backup_temp"
test -s "$backup_temp"
/usr/bin/docker compose exec -T database pg_restore --list < "$backup_temp" > /dev/null
mv "$backup_temp" "$backup_file"
# Prune only completed dumps, and only after a new dump succeeds.
find "$backup_dir" -maxdepth 1 -type f -name 'database-????????T??????Z.dump' -mmin +10080 -delete
printf 'Database backup completed: %s\n' "$backup_file"
