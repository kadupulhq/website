# DigitalOcean Weblate deployment

Status: prepared locally, not provisioned. The active DigitalOcean team is Relenz;
the owner must identify the team for Kadupul before creating paid resources.
The proposed hostname is `translate.kadupul.org`. Its authoritative DNS is outside
DigitalOcean (Squarespace/NS1). The SMTP service and verified sender are pending.

## Proposed resources

| Resource | Configuration |
| --- | --- |
| Project | Separate Kadupul project in the selected team |
| Droplet | `kadupul-weblate-01`, Ubuntu 24.04 LTS, `sfo3` |
| Size | `s-2vcpu-4gb`: 2 vCPUs, 4 GB RAM, 80 GB SSD |
| Backups | Daily DigitalOcean backups and Weblate's daily database dump |
| Monitoring | DigitalOcean monitoring agent; disk, memory and health alerts |
| Network | TCP 80/443 public; TCP 22 restricted to administrator IPs in the cloud firewall |
| DNS | A record `translate.kadupul.org` pointing to the new Droplet |

The checked account currently offers this size at $24/month. Basic daily backups
add 30%, for $31.20/month before tax, email service fees and any usage overages.
No managed database, load balancer, extra volume or paid AI provider is required
for the initial deployment. Account selection is pending; no resource IDs or live
URL are recorded because no server has been created.

## Configuration

The Compose stack uses immutable image digests verified from the registries:
Weblate 2026.9.1.0, PostgreSQL 18, Valkey 9.1.2 and Caddy 2.11.4. Caddy terminates
HTTPS. Weblate has no published port; it trusts only Caddy's fixed container IP.
The database and cache are on an internal network without published ports.
Check that `172.30.91.0/24` does not conflict with the selected host's networks.

Keep this deployment directory on the server at `/opt/kadupul-weblate`. Copy
`.env.example` to `.env` there and replace its non-secret settings. SMTP currently
expects STARTTLS on port 587; adjust both TLS flags if the chosen provider needs
implicit TLS. Store passwords in `/etc/kadupul-weblate/secrets`, outside Git:

- `db_password`: a generated database password shared by PostgreSQL and Weblate.
- `admin_password`: a generated initial administrator password.
- `smtp_password`: the selected email provider's credential.

The secrets directory must be owned by root with mode 0700. Compose mounts only
the named secret files into the containers, read-only. Their contents must be
readable by container users (mode 0444 inside the root-only host directory).
Keep the admin credential in the owner's password manager or Keychain and never
print it in terminal output. Supplying it on each startup resets the admin account
to that credential; after first login, remove its environment setting and mount
from the deployed Compose configuration and remove the bootstrap secret. Ensure
the existing admin account and recovery access work before doing so.

Never put credentials in cloud-init user-data, repository files, command-line
arguments or logs. Weblate data and backups contain credentials and must be
treated as sensitive. Registrations remain closed during setup.

## Provisioning sequence

1. Confirm the DigitalOcean team, create a separate Kadupul project, and choose an
   administrator SSH key whose private key is available to the owner.
2. Create a cloud firewall for a dedicated Weblate tag. Allow public TCP 80/443,
   allow TCP 22 only from administrator IP ranges, and allow required outbound
   traffic. Do not attach it to existing unrelated Droplets.
3. Create the Droplet in that project with the selected SSH key, monitoring,
   daily backups and `cloud-init.yaml`. The cloud-init file contains no secrets.
4. Wait for `cloud-init status --wait` to succeed. Confirm SSH key access,
   firewall rules, Docker startup, disk capacity, memory and backup policy.
5. Transfer the deployment configuration and install secrets through the
   authenticated SSH session. Use the owner's existing secret store as the source
   for external credentials. Generate the database and bootstrap admin passwords
   without printing them.
6. Have the DNS owner create the A record. Check its public resolution and any
   inherited CAA restrictions before requesting the HTTPS certificate.
7. From `/opt/kadupul-weblate`, run `docker compose config --quiet`,
   `docker compose pull`, and `docker compose up -d`. Do not print rendered Compose
   configuration after adding secrets through any local overrides.
8. Validate HTTPS, administrator login and `docker compose exec --user weblate
   weblate weblate check --deploy`. Resolve actionable failures before inviting
   contributors. Do not silence deployment checks merely to obtain a clean result.
9. Verify the email provider configuration and ask the owner to authorize a test
   message before sending one. Invitations and password resets remain unverified
   until an authorized message is delivered.
10. Configure the GitHub integration with access limited to `kadupulhq/website`,
    PR-based synchronization and reviewer permissions as described in
    [TRANSLATING.md](../../TRANSLATING.md). Complete the live review round trip
    before marking issue #3 complete.

## Backups and restore validation

Weblate's scheduler writes a daily native PostgreSQL dump to
`/app/data/backups/database.sql`. Verify that it exists, is nonempty and remains
fresh after the first scheduled run. The Docker data volumes, deployment `.env`
and root-only secrets directory must all be included in the daily Droplet backup.
Check that DigitalOcean records a successful backup; enabling the policy is not
proof that a backup exists.

Before relying on backups, restore one to an isolated recovery Droplet with
restricted networking. Keep the restored Weblate application stopped while
checking the database and files so it cannot send mail, push translations or
process duplicate jobs. Verify the administrator account, translation records,
review history, Weblate data directory and a matching database dump. Only then
perform a controlled application test. Record the backup timestamp, restore
duration, tested record counts and result in the operational handoff. Restore
testing and recovery Droplet costs are not included in the base monthly estimate.

For a logical restore into a fresh PostgreSQL instance, use the matching pinned
Compose version, restore the saved Weblate data volume and original secrets,
and load `database.sql` with `psql --set ON_ERROR_STOP=on` before starting Weblate.
Preserve Weblate data ownership (UID 1000). Do not replace a live database or remove
production volumes while testing recovery. A working GitHub repository alone does
not recover Weblate accounts, suggestions or review history.

## Validation and upgrades

`docker compose --env-file .env.example config --quiet` validates the Compose
model without real credentials. Proxy configuration can be checked using the
pinned Caddy image with `caddy adapt --validate`. Cloud-init YAML parsing alone
does not prove that Ubuntu provisioning succeeds; record the cloud-init result
on the actual host. No live deployment or restore test has run yet.

Update image digests deliberately, after taking a backup and testing the new
version. A PostgreSQL major-version change requires a planned database migration;
replacing the image tag is not an upgrade procedure. Do not configure automatic
container updates. OS security updates run automatically; review reboot needs
and schedule restarts.

Sources: [Weblate Docker installation](https://docs.weblate.org/en/latest/admin/install/docker.html),
[Weblate backups](https://docs.weblate.org/en/latest/admin/backup.html),
[DigitalOcean server pricing](https://www.digitalocean.com/pricing/droplets),
and [DigitalOcean backup pricing](https://docs.digitalocean.com/products/backups/details/pricing/).
