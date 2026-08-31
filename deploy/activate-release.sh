#!/usr/bin/env bash
set -euo pipefail

readonly manifest_path='docs/baselines/2026-08-29-production-payload-manifest.json'

die() {
  printf 'activate-release: %s\n' "$*" >&2
  exit 1
}

require_full_sha() {
  [[ "$1" =~ ^[0-9a-f]{40}$ ]] || die 'release ID must be a 40-character lowercase Git SHA'
}

require_real_directory() {
  local path=$1
  [[ ! -L "$path" && -d "$path" ]] || die "non-symlink directory required: $path"
  [[ "$(realpath -e "$path")" == "$path" ]] || die "directory must not resolve through a symlink: $path"
}

sha256_file() {
  sha256sum "$1" | awk '{print $1}'
}

if [[ $# -ne 1 ]]; then
  die 'usage: activate-release.sh <full-git-sha>'
fi

release_id=$1
require_full_sha "$release_id"

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
repo_root=${THIENUY_REPO_ROOT:-$(cd -- "$script_dir/.." && pwd -P)}
release_root=${THIENUY_RELEASE_ROOT:-/srv/thienuy-site}
nginx_bin=${THIENUY_NGINX_BIN:-nginx}
systemctl_bin=${THIENUY_SYSTEMCTL_BIN:-systemctl}

[[ "$release_root" == /* ]] || die 'release root must be absolute'
require_real_directory "$release_root"
[[ ! -L "$repo_root" && -d "$repo_root" ]] || die 'repository root must be a non-symlink directory'
repo_root=$(realpath -e "$repo_root")
[[ -f "$repo_root/scripts/static-manifest.mjs" ]] || die 'static manifest tool is missing'

releases_dir="$release_root/releases"
metadata_dir="$release_root/release-metadata"
require_real_directory "$releases_dir"
require_real_directory "$metadata_dir"
release_dir="$releases_dir/$release_id"
metadata_release_dir="$metadata_dir/$release_id"
require_real_directory "$release_dir"
require_real_directory "$metadata_release_dir"

activation_lock="$release_root/.activation.lock"
exec 9>"$activation_lock"
flock -n 9 || die 'another activation already holds the runtime lock'

resolved_id=$(git -C "$repo_root" rev-parse --verify "${release_id}^{commit}" 2>/dev/null) \
  || die 'release ID is not an available commit'
[[ "$resolved_id" == "$release_id" ]] || die 'release ID must name the complete commit SHA exactly'
git -C "$repo_root" cat-file -e "${release_id}:${manifest_path}" 2>/dev/null \
  || die 'committed payload manifest is missing'
git_tree=$(git -C "$repo_root" rev-parse "${release_id}^{tree}")
site_tree=$(git -C "$repo_root" rev-parse "${release_id}:site" 2>/dev/null) \
  || die 'commit does not contain a site tree'

expected_manifest=$(mktemp)
source_manifest=$(mktemp)
actual_manifest=$(mktemp)
expected_marker=$(mktemp)
committed_payload_root=$(mktemp -d)
tool_root=$(mktemp -d)
cleanup() {
  rm -f "$expected_manifest" "$source_manifest" "$actual_manifest" "$expected_marker"
  rm -rf "$committed_payload_root"
  rm -rf "$tool_root"
}
trap cleanup EXIT

git -C "$repo_root" show "${release_id}:${manifest_path}" > "$expected_manifest"
git -C "$repo_root" archive --format=tar "$release_id" -- site | tar -x -C "$committed_payload_root" --strip-components=1
git -C "$repo_root" archive --format=tar "$release_id" -- scripts/static-manifest.mjs | tar -x -C "$tool_root"
static_manifest_tool="$tool_root/scripts/static-manifest.mjs"
[[ -f "$static_manifest_tool" ]] || die 'requested commit does not contain a static manifest verifier'
node "$static_manifest_tool" "$committed_payload_root" > "$source_manifest" \
  || die 'committed site tree is not a safe regular-file payload'
cmp --silent "$expected_manifest" "$source_manifest" \
  || die 'committed site tree does not equal its committed payload manifest'
manifest_digest=$(sha256_file "$expected_manifest")
printf '{"release_id":"%s","git_sha":"%s","git_tree":"%s","site_tree":"%s","manifest_sha256":"%s"}\n' \
  "$release_id" "$release_id" "$git_tree" "$site_tree" "$manifest_digest" > "$expected_marker"
cmp --silent "$expected_marker" "$metadata_release_dir/source-marker.json" \
  || die 'release source marker does not match the requested commit'
cmp --silent "$expected_manifest" "$metadata_release_dir/payload-manifest.json" \
  || die 'release metadata manifest does not match the requested commit'
node "$static_manifest_tool" "$release_dir" > "$actual_manifest" \
  || die 'release tree is not a safe regular-file payload'
cmp --silent "$expected_manifest" "$actual_manifest" \
  || die 'release tree does not match the committed payload manifest'

"$nginx_bin" -t || die 'nginx configuration preflight failed; current was not changed'

current="$release_root/current"
had_current=0
previous_target=''
if [[ -e "$current" || -L "$current" ]]; then
  [[ -L "$current" ]] || die 'current must be an atomic symlink or absent'
  previous_target=$(readlink "$current")
  had_current=1
fi
next="$release_root/.current-${release_id}.new"
[[ ! -e "$next" && ! -L "$next" ]] || die 'temporary current pointer already exists'
ln -s "$release_dir" "$next"
mv -Tf "$next" "$current"

if ! "$systemctl_bin" reload nginx; then
  if [[ "$had_current" -eq 1 ]]; then
    ln -s "$previous_target" "$next"
    mv -Tf "$next" "$current"
  else
    rm -f "$current"
  fi
  die 'nginx reload failed; current was restored'
fi

printf 'activated immutable release %s\n' "$release_id"
