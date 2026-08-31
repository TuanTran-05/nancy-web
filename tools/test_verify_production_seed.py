import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "docs" / "baselines" / "2026-08-29-production-seed.json"
VERIFIER = ROOT / "tools" / "verify_production_seed.py"


class ProductionSeedManifestTest(unittest.TestCase):
    def test_every_entry_records_the_release_mode(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["entry_count"], len(manifest["entries"]))
        self.assertEqual({entry.get("mode") for entry in manifest["entries"]}, {"0664"})


class ProductionSeedVerifierTest(unittest.TestCase):
    def make_fixture(self, root, mode):
        site = root / "site"
        site.mkdir()
        page = site / "index.html"
        page.write_bytes(b"seed fixture\r\n")
        os.chmod(page, mode)
        manifest = root / "manifest.json"
        manifest.write_text(
            json.dumps(
                {
                    "entry_count": 1,
                    "entries": [
                        {
                            "path": "index.html",
                            "bytes": 14,
                            "sha256": "f97b4f405b40ea6a66016952a21d839bb9ed91e5cbdc9de8e31cfa4e0ec18c5b",
                            "mode": "0664",
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        subprocess.run(["git", "init", "-q", str(root)], check=True)
        subprocess.run(["git", "-C", str(root), "config", "user.name", "test"], check=True)
        subprocess.run(["git", "-C", str(root), "config", "user.email", "test@example.invalid"], check=True)
        subprocess.run(["git", "-C", str(root), "add", "site"], check=True)
        subprocess.run(["git", "-C", str(root), "commit", "-qm", "fixture"], check=True)
        return site, manifest

    def test_reapplies_manifest_release_modes_before_verifying(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            site, manifest = self.make_fixture(root, 0o644)
            result = subprocess.run(
                [
                    sys.executable,
                    str(VERIFIER),
                    "--manifest",
                    str(manifest),
                    "--site",
                    str(site),
                    "--repo",
                    str(root),
                    "--reapply",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((site / "index.html").stat().st_mode & 0o777, 0o664)

    def test_rejects_a_worktree_file_when_its_release_mode_is_not_reapplied(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            site, manifest = self.make_fixture(root, 0o644)
            result = subprocess.run(
                [
                    sys.executable,
                    str(VERIFIER),
                    "--manifest",
                    str(manifest),
                    "--site",
                    str(site),
                    "--repo",
                    str(root),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("mode mismatch", result.stderr)

    def test_reapply_rejects_symlink_without_changing_an_outside_target(self):
        with tempfile.TemporaryDirectory() as temporary, tempfile.TemporaryDirectory() as outside_temporary:
            root = Path(temporary)
            site, manifest = self.make_fixture(root, 0o644)
            outside = Path(outside_temporary) / "outside.txt"
            outside.write_bytes(b"outside target must not change\n")
            os.chmod(outside, 0o600)
            outside_mode = outside.stat().st_mode & 0o777
            outside_content = outside.read_bytes()
            (site / "index.html").unlink()
            (site / "index.html").symlink_to(outside)

            result = subprocess.run(
                [
                    sys.executable,
                    str(VERIFIER),
                    "--manifest",
                    str(manifest),
                    "--site",
                    str(site),
                    "--repo",
                    str(root),
                    "--reapply",
                ],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlink", result.stderr)
            self.assertEqual(outside.stat().st_mode & 0o777, outside_mode)
            self.assertEqual(outside.read_bytes(), outside_content)


if __name__ == "__main__":
    unittest.main()
