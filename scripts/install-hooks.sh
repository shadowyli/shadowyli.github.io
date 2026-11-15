#!/bin/bash
# Install the optional "commit => deploy to OSS" git hooks for this clone.
# Safe to run repeatedly; remove with: rm .git/hooks/post-commit .git/hooks/post-merge
set -euo pipefail
REPO=$(git rev-parse --show-toplevel)
SRC="$REPO/scripts/git-hooks/post-commit"
[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
install -m 0755 "$SRC" "$REPO/.git/hooks/post-commit"
install -m 0755 "$SRC" "$REPO/.git/hooks/post-merge"
echo "installed post-commit + post-merge hooks"
