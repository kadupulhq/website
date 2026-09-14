---
title: Realms and permissions
description: Every authorization realm in Kadupul, the page each one gates, and
  the object permissions and policy values that decide what a user can see.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 12
slug: 1.2.31/reference/realms-and-permissions
---

Authorization has two independent layers. A realm decides whether a user may open
a page. An object permission decides which graphs, devices, graph templates and
trees that user sees once there. Both are inherited from Cacti 1.2.x.

## Realms

Numbers and names are from `$user_auth_realms` in `include/global_arrays.php`.
Grants live in `user_auth_realm` for users and `user_auth_group_realm` for
groups; `is_realm_allowed()` accepts either.

| Realm | Name |
|---|---|
| 1 | Users/Groups |
| 2 | Data Input Methods |
| 3 | Sites/Devices/Data |
| 4 | Trees |
| 5 | Graphs |
| 7 | View Graphs |
| 8 | Console Access |
| 9 | Data Source Profiles |
| 10 | Graph Templates |
| 11 | Data Templates |
| 12 | Device Templates |
| 13 | Data Queries |
| 14 | Presets |
| 15 | Settings/Utilities |
| 16 | Export Templates |
| 17 | Import Templates |
| 18 | Log Administration |
| 19 | Log Viewing |
| 20 | Update Profile |
| 21 | Reports Administration |
| 22 | Reports Creation |
| 23 | Automation |
| 24 | External Links |
| 25 | Realtime Graphs |
| 26 | Installation/Upgrades |
| 27 | Show Graph Action Icons |
| 28 | Show User Help Links |
| 101 | Plugin Administration |
| 1043 | Spike Handling |

There is no realm 6. Numbers above 100 are plugin realms: `plugin_realms.id`
plus 100. Realm 101 comes from the seeded `internal` row in `plugin_realms`,
which maps `plugins.php` and is displayed as Plugin Management once
`api_plugin_load_realms()` has run.

Realms 27 and 28 gate interface elements, not pages. They have no entry in the
filename map.

## Which page each realm gates

`$user_auth_realm_filenames` maps a page filename to a realm.
`include/auth.php` looks up `get_current_page()` in it and refuses the request
when the user does not hold that realm. A value of `-1` means no realm is
required. A page absent from the map gets realm id 0, and realm 0 is never
authorized.

| Realm | Pages |
|---|---|
| 1 | `user_admin.php`, `user_domains.php`, `user_group_admin.php` |
| 2 | `data_input.php` |
| 3 | `data_sources.php`, `sites.php`, `pollers.php`, `host.php` |
| 4 | `tree.php` |
| 5 | `color.php`, `gprint_presets.php`, `graphs.php`, `graphs_items.php`, `graphs_new.php`, `color_templates.php`, `color_templates_items.php`, `aggregate_templates.php`, `aggregate_graphs.php` |
| 7 | `graph.php`, `graph_image.php`, `graph_json.php`, `graph_xport.php`, `graph_view.php` |
| 8 | `index.php`, reserved mappings for `smtp_servers.php`, `email_templates.php`, `event_queue.php`, `smtp_queue.php` (these files are not shipped) |
| 9 | `data_source_profiles.php` |
| 10 | `graph_templates.php`, `graph_templates_inputs.php`, `graph_templates_items.php` |
| 11 | `data_templates.php` |
| 12 | `host_templates.php` |
| 13 | `data_queries.php` |
| 14 | `cdef.php`, `vdef.php` |
| 15 | `data_debug.php`, `managers.php`, `rrdcleaner.php`, `rrdcheck.php`, `settings.php`, `links.php`, `utilities.php` |
| 16 | `templates_export.php` |
| 17 | `templates_import.php`, `package_import.php` |
| 18 | `clog.php` |
| 19 | `clog_user.php` |
| 20 | `auth_profile.php` |
| 21 | `reports_admin.php` |
| 22 | `reports_user.php` |
| 23 | `automation_graph_rules.php`, `automation_tree_rules.php`, `automation_templates.php`, `automation_networks.php`, `automation_devices.php`, `automation_snmp.php` |
| 25 | `graph_realtime.php` |
| 26 | `install.php`, `step_json.php` |
| 1043 | `spikekill.php` |
| none (`-1`) | `about.php`, `logout.php`, `auth_changepassword.php`, `permission_denied.php`, `help.php` |

Two entries surprise people. `graph_realtime.php` needs realm 25, not realm 7,
so a user who can view graphs cannot necessarily open a realtime one. And
`settings.php` and `utilities.php` share realm 15 with `data_debug.php`,
`managers.php`, `rrdcleaner.php`, `rrdcheck.php` and `links.php`, so granting
access to any one of those grants the rest.

Realm 26 gets special handling on upgrade. When a page maps to realm 26 and no
user holds it, `include/auth.php` grants realm 26 to every user who already holds
realm 15, so an upgrade from a pre-1.2 install is not locked out of its own
installer.

## Roles

`$user_auth_roles` is a convenience grouping used when a new account is built
from a template. It is not a stored object; nothing checks a role at request
time.

| Role | Realms |
|---|---|
| Normal User | 7, 19, 20, 22, 24, 25, 27, 28 |
| Template Editor | 8, 2, 9, 10, 11, 12, 13, 14, 16, 17 |
| General Administration | 8, 3, 4, 5, 23, 1043 |
| System Administration | 8, 15, 26, 1, 18, 21, 101 |

Plugins extend a role with `auth_augment_roles($role_name, $files)`, which
resolves each filename through `$user_auth_realm_filenames` and then, failing
that, through `plugin_realms`. `auth_augment_roles_byname()` does the same
starting from a realm's display name. Both create the role if it does not exist.

## Permission objects

Exceptions are rows in `user_auth_perms` for a user and `user_auth_group_perms`
for a group. Each row is a user or group id, an item id, and a type.

| Type | Object | `item_id` references |
|---|---|---|
| 1 | Graph | `graph_local.id` |
| 2 | Tree | `graph_tree.id` |
| 3 | Device | `host.id` |
| 4 | Graph template | `graph_templates.id` |

## Policies

Each user row and each group row carries four policy columns, one per object
type: `policy_graphs`, `policy_trees`, `policy_hosts`,
`policy_graph_templates`.

| Value | Name | Effect |
|---|---|---|
| 1 | Allow | Everything is permitted except the objects listed as exceptions. |
| 2 | Deny | Nothing is permitted except the objects listed as exceptions. |

The default for all four is `1`. `auth_check_perms($objects, $policy)` states the
rule in full: with policy 1 a match denies and no match allows; with policy 2 a
match allows and no match denies.

`get_policies($user_id)` returns the user's own row plus one row per enabled
group the user belongs to. Permission evaluation walks the set, so a user's
effective access is the combination of their own policy and every group policy.

## Graph permission method

The `graph_auth_method` setting decides how the four object types combine into a
verdict on one graph. Default is `1`.

| Value | Name | Rule |
|---|---|---|
| 1 | Permissive | Access to the graph, the device, or the graph template is enough. |
| 2 | Restrictive | The user needs the graph, or both the device and the graph template. |
| 3 | Device Based | Access to the graph or the device. |
| 4 | Graph Template Based | Access to the graph or the graph template. |

The setting's own description notes that 1 and 2 scale poorly on very large
installs, which is why 3 and 4 exist.

## Group view rights

A group can override three of a user's own view flags. The values come from
`$gperm_options` in `user_group_admin.php`.

| Value | Meaning |
|---|---|
| 1 | Defer to the user's setting |
| 2 | Grant access |
| 3 | Restrict access |

They apply to `show_tree`, `show_list` and `show_preview`, all defaulting to `1`.
`graph_settings` uses the same column pattern and decides whether group members
may keep their own graph settings.

`is_view_allowed()` resolves the four in this order: any enabled group holding
`3` denies outright; otherwise `on` or `2` from any group allows; otherwise the
user's own column must equal `on`.

## Authentication methods

Set by `auth_method`. Default is `1`. Options 3 and 4 appear only when PHP's
`ldap_connect()` exists.

| Value | Method |
|---|---|
| 1 | Builtin Authentication |
| 2 | Web Basic Authentication |
| 3 | LDAP Authentication |
| 4 | Multiple LDAP/AD Domains |

The dropdown offers only these four. Value `0` is not among them but the code
tests for it: `is_realm_allowed()` and `is_view_allowed()` both short-circuit to
true when `auth_method` is `0`, which turns authorization off entirely.

## Login realms

A login realm identifies the credential store, and is separate from an
authorization realm. `get_auth_realms()` returns:

| Value | Store |
|---|---|
| 0 | Local |
| 2 | Web Basic |
| 3 | LDAP |
| 1000 + `domain_id` | A row in `user_domains`, when `auth_method` is 4 |

With `auth_method` 4 and at least one enabled domain, only `0` and the
`1000 + domain_id` entries are offered. The domain flagged `defdomain=1` is
preselected; with none flagged, Local is.

## Caching and invalidation

Realm answers are cached in `$_SESSION['sess_user_realms']` for the session.
`is_realm_allowed()` calls `is_user_perms_valid()` first; when an administrator
has changed something it clears `sess_user_realms`, `sess_user_config_array`,
`sess_config_array`, `sess_auth_names`, `sess_tree_perms`, `sess_simple_perms`
and `sess_simple_template_perms`, then forces the page to reload.

A disabled account is handled at the same point. When `user_auth.enabled` is
empty and the account is not the guest account, the row is dropped from
`user_auth_cache`, `sess_user_id` is killed, and the session ends.

`reset_user_perms($user_id)` and `reset_group_perms($group_id)` are what the
admin pages call after any permission change, and are what makes
`is_user_perms_valid()` return false on the next request.
