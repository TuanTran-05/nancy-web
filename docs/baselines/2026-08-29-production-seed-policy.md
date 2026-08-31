# Production-seed validation policy

The annotated tag `production-seed-20260830-041108-9da123e` is immutable. It
captures the 124-file active release from
`/srv/thienuy-site/releases/20260830-041108-9da123e`; do not retag, amend, or
rewrite it. Its successor manifest records the corresponding filesystem modes
so a release can reproduce both payload bytes and required permissions.

## Filesystem modes and Git normalization

The captured regular files are mode `0664`. Verify the production-side fact
without copying or changing `/srv`:

```bash
find /srv/thienuy-site/releases/20260830-041108-9da123e -xdev -type f -printf '%m\n' | sort -u
```

Git cannot represent the group-write bit on a normal file: its tree mode is
`100644` even when the release requirement is `0664`. Verify that intentional
normalization against the immutable seed tag with:

```bash
git ls-tree -r production-seed-20260830-041108-9da123e -- site
```

At every release boundary, the release operator must reapply and then verify
the manifest modes in the prepared `site/` directory. The verifier checks all
manifest paths, requires their filesystem mode, and confirms that the selected
Git tree uses the intentional regular-file mode `100644`:

```bash
python3 tools/verify_production_seed.py \
  --manifest docs/baselines/2026-08-29-production-seed.json \
  --site site --repo . \
  --git-ref production-seed-20260830-041108-9da123e --reapply
python3 tools/verify_production_seed.py \
  --manifest docs/baselines/2026-08-29-production-seed.json \
  --site site --repo . \
  --git-ref production-seed-20260830-041108-9da123e
```

The `--reapply` invocation changes only the manifest-listed regular files to
their recorded modes. It is a release-boundary action, never a reason to alter
the production source or move the seed tag.

## CRLF byte-identity waiver

The active seed contains CRLF text files. During the original staged seed
import, `git diff --cached --check` exited with status `2` and emitted exactly
`20,728` trailing-whitespace diagnostics. Those diagnostics identify CRLF, not
an allowed content change. Converting line endings to satisfy that check would
break the mandatory byte-identical seed.

Therefore, `git diff --check` is not a validation gate for this immutable CRLF
seed. The required alternative checks are:

1. compare the 124 sorted manifest paths, byte lengths, and SHA-256 values to
   the active release;
2. compare each seed-tag `site/` Git blob with the active-release byte hash;
3. compare the recorded `0664` modes with a release-boundary filesystem check
   using the verifier above; and
4. use `git diff --check` normally for non-seed source changes, where it passed
   for the separate remote-source integration commit.
