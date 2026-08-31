#!/usr/bin/env bash
set -euo pipefail

readonly manifest_path='docs/baselines/2026-08-29-production-payload-manifest.json'

die() {
  printf 'prepare-release: %s\n' "$*" >&2
  exit 1
}

require_full_sha() {
  [[ "$1" =~ ^[0-9a-f]{40}$ ]] || die 'release ID must be a 40-character lowercase Git SHA'
}

ensure_directory() {
  local path=$1
  if [[ -L "$path" ]]; then
    die "symlinked directory rejected: $path"
  fi
  if [[ ! -e "$path" ]]; then
    mkdir "$path" || die "cannot create directory: $path"
  fi
  [[ -d "$path" ]] || die "directory required: $path"
  [[ "$(realpath -e "$path")" == "$path" ]] || die "directory must not resolve through a symlink: $path"
}

sha256_file() {
  sha256sum "$1" | awk '{print $1}'
}

extract_committed_tool() {
  local source_path=$1
  local destination_path=$2
  local entry mode type object path
  entry=$(git -C "$repo_root" ls-tree "$release_id" -- "$source_path") || die "could not inspect requested tool: $source_path"
  [[ -n "$entry" ]] || die "requested commit does not contain tool: $source_path"
  read -r mode type object path <<< "$entry"
  [[ "$path" == "$source_path" && "$type" == 'blob' ]] || die "requested commit does not contain tool: $source_path"
  case "$mode" in
    100644|100755) ;;
    *) die "requested commit tool must be a regular file: $source_path" ;;
  esac
  git -C "$repo_root" cat-file -e "${object}^{blob}" 2>/dev/null || die "requested commit tool is not a blob: $source_path"
  git -C "$repo_root" show "${release_id}:${source_path}" > "$destination_path"
  chmod 0600 "$destination_path"
}

if [[ $# -ne 2 ]]; then
  die 'usage: prepare-release.sh <full-git-sha> <dist-dir>'
fi

release_id=$1
dist_argument=$2
require_full_sha "$release_id"

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
repo_root=${THIENUY_REPO_ROOT:-$(cd -- "$script_dir/.." && pwd -P)}
release_root=${THIENUY_RELEASE_ROOT:-/srv/thienuy-site}

[[ "$release_root" == /* ]] || die 'release root must be absolute'
[[ ! -L "$repo_root" && -d "$repo_root" ]] || die 'repository root must be a non-symlink directory'
repo_root=$(realpath -e "$repo_root")

resolved_id=$(git -C "$repo_root" rev-parse --verify "${release_id}^{commit}" 2>/dev/null) \
  || die 'release ID is not an available commit'
[[ "$resolved_id" == "$release_id" ]] || die 'release ID must name the complete commit SHA exactly'
git -C "$repo_root" cat-file -e "${release_id}:${manifest_path}" 2>/dev/null \
  || die 'committed payload manifest is missing'
site_tree=$(git -C "$repo_root" rev-parse "${release_id}:site" 2>/dev/null) \
  || die 'commit does not contain a site tree'
git_tree=$(git -C "$repo_root" rev-parse "${release_id}^{tree}")

[[ ! -L "$dist_argument" && -d "$dist_argument" ]] || die 'dist directory must be a non-symlink directory'
dist_dir=$(realpath -e "$dist_argument")

ensure_directory "$release_root"
releases_dir="$release_root/releases"
metadata_dir="$release_root/release-metadata"
ensure_directory "$releases_dir"
ensure_directory "$metadata_dir"
release_dir="$releases_dir/$release_id"
metadata_release_dir="$metadata_dir/$release_id"
[[ ! -e "$release_dir" && ! -L "$release_dir" ]] || die 'release already exists'
[[ ! -e "$metadata_release_dir" && ! -L "$metadata_release_dir" ]] || die 'release metadata already exists'

expected_manifest=$(mktemp)
source_manifest=$(mktemp)
actual_manifest=$(mktemp)
committed_payload_root=$(mktemp -d)
tool_root=$(mktemp -d)
stage_root=$(mktemp -d "$releases_dir/.staging-${release_id}.XXXXXX")
metadata_stage=$(mktemp -d "$metadata_dir/.staging-${release_id}.XXXXXX")
metadata_published=0
release_published=0
cleanup() {
  rm -f "$expected_manifest" "$source_manifest" "$actual_manifest"
  rm -rf "$committed_payload_root"
  rm -rf "$tool_root"
  [[ -z "$stage_root" ]] || rm -rf "$stage_root"
  [[ -z "$metadata_stage" ]] || rm -rf "$metadata_stage"
  if [[ "$metadata_published" -eq 1 && "$release_published" -eq 0 ]]; then
    rm -rf "$metadata_release_dir" || true
  fi
}
trap cleanup EXIT

git -C "$repo_root" show "${release_id}:${manifest_path}" > "$expected_manifest"
git -C "$repo_root" archive --format=tar "$release_id" -- site | tar -x -C "$committed_payload_root" --strip-components=1
static_manifest_tool="$tool_root/static-manifest.mjs"
build_tool="$tool_root/build.mjs"
extract_committed_tool 'scripts/static-manifest.mjs' "$static_manifest_tool"
extract_committed_tool 'scripts/build.mjs' "$build_tool"
node "$static_manifest_tool" "$committed_payload_root" > "$source_manifest" \
  || die 'committed site tree is not a safe regular-file payload'
cmp --silent "$expected_manifest" "$source_manifest" \
  || die 'committed site tree does not equal its committed payload manifest'
node "$static_manifest_tool" "$dist_dir" > "$actual_manifest" \
  || die 'dist tree is not a safe regular-file payload'
cmp --silent "$expected_manifest" "$actual_manifest" \
  || die 'dist manifest does not equal the committed payload manifest'

THIENUY_BUILD_MODULE="$build_tool" node -e '
  import(process.env.THIENUY_BUILD_MODULE).then(({ buildStaticSite }) => buildStaticSite({ sourceDir: process.argv[1], outputDir: process.argv[2] }))
' "$dist_dir" "$stage_root/release" \
  || die 'safe payload copy failed'
node "$static_manifest_tool" "$stage_root/release" > "$actual_manifest" \
  || die 'copied release tree is unsafe'
cmp --silent "$expected_manifest" "$actual_manifest" \
  || die 'copied release tree no longer matches the committed payload manifest'

manifest_digest=$(sha256_file "$expected_manifest")
printf '{"release_id":"%s","git_sha":"%s","git_tree":"%s","site_tree":"%s","manifest_sha256":"%s"}\n' \
  "$release_id" "$release_id" "$git_tree" "$site_tree" "$manifest_digest" > "$metadata_stage/source-marker.json"
cp --no-preserve=mode "$expected_manifest" "$metadata_stage/payload-manifest.json"
chmod 0644 "$metadata_stage/source-marker.json" "$metadata_stage/payload-manifest.json"

mv -T "$metadata_stage" "$metadata_release_dir" || die 'could not publish release metadata'
metadata_stage=''
metadata_published=1
mv -T "$stage_root/release" "$release_dir" || die 'could not publish release'
release_published=1
printf 'prepared immutable release %s\n' "$release_id"
