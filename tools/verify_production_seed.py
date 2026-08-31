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
    if not isinstance(value, str):
        raise ValueError("path must be a safe relative path")
    path = PurePosixPath(value)
    if path == PurePosixPath(".") or path.is_absolute() or ".." in path.parts:
        raise ValueError("path must be a safe relative path")
    return path


def is_within(root, candidate):
    try:
        return Path(os.path.commonpath((str(root), str(candidate)))) == root
    except ValueError:
        return False


def secure_manifest_file(site_root, relative):
    target = site_root / relative
    if not is_within(site_root, target):
        raise ValueError(f"lexical path escapes site root: {relative}")

    try:
        target_stat = target.lstat()
        real_target = target.resolve(strict=True)
    except FileNotFoundError:
        raise ValueError(f"missing regular file: {relative}")

    if not is_within(site_root, real_target):
        if stat.S_ISLNK(target_stat.st_mode):
            raise ValueError(f"symlink rejected; real path escapes site root: {relative}")
        raise ValueError(f"real path escapes site root: {relative}")
    if stat.S_ISLNK(target_stat.st_mode):
        raise ValueError(f"symlink rejected: {relative}")
    if not stat.S_ISREG(target_stat.st_mode):
        raise ValueError(f"non-regular file rejected: {relative}")
    return target, target_stat


def reapply_mode(target, expected_mode, expected_stat):
    if not hasattr(os, "O_NOFOLLOW"):
        raise RuntimeError("safe no-follow mode reapplication is unavailable")
    descriptor = os.open(target, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        current_stat = os.fstat(descriptor)
        if not stat.S_ISREG(current_stat.st_mode):
            raise RuntimeError(f"non-regular file rejected during reapply: {target}")
        if (current_stat.st_dev, current_stat.st_ino) != (
            expected_stat.st_dev,
            expected_stat.st_ino,
        ):
            raise RuntimeError(f"file changed during reapply: {target}")
        os.fchmod(descriptor, expected_mode)
        if stat.S_IMODE(os.fstat(descriptor).st_mode) != expected_mode:
            raise RuntimeError(f"mode reapply failed: {target}")
    finally:
        os.close(descriptor)


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

    try:
        site_stat = site.lstat()
    except FileNotFoundError:
        raise ValueError("site root is missing")
    if stat.S_ISLNK(site_stat.st_mode) or not stat.S_ISDIR(site_stat.st_mode):
        raise ValueError("site root must be a non-symlink directory")
    site_root = site.resolve(strict=True)

    expected_paths = set()
    validated_files = []
    problems = []
    for entry in entries:
        try:
            relative = safe_relative_path(entry.get("path"))
            expected_mode = parse_mode(entry.get("mode"))
        except ValueError as error:
            problems.append(str(error))
            continue
        if relative.as_posix() in expected_paths:
            problems.append(f"duplicate manifest path: {relative}")
            continue
        expected_paths.add(relative.as_posix())
        try:
            target, target_stat = secure_manifest_file(site_root, relative)
        except ValueError as error:
            problems.append(str(error))
            continue
        validated_files.append((relative, target, target_stat, expected_mode))

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
    if reapply:
        for _, target, target_stat, expected_mode in validated_files:
            reapply_mode(target, expected_mode, target_stat)
    else:
        for relative, _, target_stat, expected_mode in validated_files:
            actual_mode = stat.S_IMODE(target_stat.st_mode)
            if actual_mode != expected_mode:
                problems.append(
                    f"mode mismatch: {relative}: expected {expected_mode:04o}, got {actual_mode:04o}"
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
