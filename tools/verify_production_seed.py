#!/usr/bin/env python3
"""Verify and, when requested, reapply production-seed filesystem modes."""

import argparse
import json
import os
from pathlib import Path, PurePosixPath
import stat
import subprocess
import sys


GIT_REGULAR_FILE_MODE = "100644"


def parse_mode(value):
    if not isinstance(value, str) or len(value) != 4 or value[0] != "0":
        raise ValueError("mode must be a four-digit octal string")
    if any(character not in "01234567" for character in value):
        raise ValueError("mode must be a four-digit octal string")
    return int(value, 8)


def safe_relative_path(value):
    path = PurePosixPath(value)
    if not isinstance(value, str) or path.is_absolute() or ".." in path.parts:
        raise ValueError("path must be a safe relative path")
    return path


def git_tree_modes(repo, git_ref, git_prefix):
    result = subprocess.run(
        ["git", "-C", str(repo), "ls-tree", "-r", git_ref, "--", git_prefix],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "git ls-tree failed")
    return {
        line.split("\t", 1)[1]: line.split(" ", 1)[0]
        for line in result.stdout.splitlines()
        if "\t" in line
    }


def verify(manifest_path, site, repo, git_ref, git_prefix, reapply):
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entries = manifest.get("entries")
    if not isinstance(entries, list) or manifest.get("entry_count") != len(entries):
        raise ValueError("manifest entry_count does not match entries")

    expected_paths = set()
    problems = []
    for entry in entries:
        relative = safe_relative_path(entry.get("path"))
        if relative.as_posix() in expected_paths:
            problems.append(f"duplicate manifest path: {relative}")
            continue
        expected_paths.add(relative.as_posix())
        expected_mode = parse_mode(entry.get("mode"))
        target = site / relative
        if not target.is_file():
            problems.append(f"missing regular file: {relative}")
            continue
        if reapply:
            os.chmod(target, expected_mode)
        actual_mode = stat.S_IMODE(target.stat().st_mode)
        if actual_mode != expected_mode:
            problems.append(
                f"mode mismatch: {relative}: expected {expected_mode:04o}, got {actual_mode:04o}"
            )

    tree_modes = git_tree_modes(repo, git_ref, git_prefix)
    prefix = f"{git_prefix.rstrip('/')}/"
    for relative in sorted(expected_paths):
        git_path = f"{prefix}{relative}"
        git_mode = tree_modes.get(git_path)
        if git_mode != GIT_REGULAR_FILE_MODE:
            problems.append(
                f"Git mode mismatch: {git_path}: expected {GIT_REGULAR_FILE_MODE}, got {git_mode}"
            )

    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    print(
        f"filesystem modes verified: {len(entries)} files; "
        f"Git normalization verified: {GIT_REGULAR_FILE_MODE}"
    )
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--git-ref", default="HEAD")
    parser.add_argument("--git-prefix", default="site")
    parser.add_argument("--reapply", action="store_true")
    args = parser.parse_args()
    try:
        return verify(
            args.manifest,
            args.site,
            args.repo,
            args.git_ref,
            args.git_prefix,
            args.reapply,
        )
    except (OSError, ValueError, json.JSONDecodeError, RuntimeError) as error:
        print(f"verification failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
