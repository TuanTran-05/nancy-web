# Production deployment

This runbook publishes only a Git-identified, manifest-exact static payload. It
does not change source content, certificates, or historical releases.

## Preconditions

- Run from a clean checkout containing the requested commit and its committed
  current-payload manifest.
- Build the candidate with `npm run build`; the candidate directory is `dist`.
- Confirm the candidate is the current 125-file remote-derived payload. The
  124-file historical production seed is a separate compatibility record and
  must not replace it.
- Install the versioned Nginx configuration through the normal configuration
  management process. It intentionally retains the existing certificate file
  references; never copy certificate material into this repository.

## Prepare

Use the complete 40-character lowercase commit SHA, never an abbreviated SHA or
branch name:

```bash
deploy/prepare-release.sh <full-git-sha> dist
```

The script validates the SHA resolves to that exact commit, compares the
candidate tree with the manifest committed by that commit, rejects traversal,
symlink, hard-link, special-node, and extra secret paths, then safely copies it
to the immutable runtime release directory. It writes the committed manifest
digest and Git/tree identity as metadata outside the served tree. It never
changes the runtime `current` pointer.

Do not delete or overwrite an existing release ID. A repeated ID is an error;
investigate the existing immutable release instead.

## Activate and recover

```bash
deploy/activate-release.sh <full-git-sha>
```

Activation rechecks the release tree, metadata manifest, source marker, commit
tree, and manifest digest. It runs `nginx -t` before changing the runtime
pointer, atomically replaces `current` only after that preflight, reloads Nginx,
and restores the exact previous pointer if the reload fails.

If activation reports a preflight failure, the pointer was not changed. If it
reports a reload failure, it was restored automatically; inspect the Nginx
error log and run a normal corrective activation only after the configuration is
valid. Never manually point `current` at an unverified directory.

## Post-deployment checks

- Confirm the canonical HTTPS hostname serves the expected release and a
  nonexistent path returns `404`.
- Confirm the `www` hostname permanently redirects to canonical HTTPS, while
  the ACME challenge path remains reachable over HTTP.
- Confirm Nginx reports healthy service status through the normal operational
  channel. Do not read, print, or export certificate contents during these
  checks.
