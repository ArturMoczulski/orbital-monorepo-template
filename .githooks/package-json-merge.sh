#!/usr/bin/env bash
# Custom merge driver for package.json: detect conflicts and abort if merging from monorepo-template

BASE="$1"
LOCAL="$2"
REMOTE="$3"

# Only trigger for monorepo-template remote
TEMPLATE_URL=$(git remote get-url monorepo-template 2>/dev/null)
GITDIR=$(git rev-parse --git-dir)
if [ -z "$TEMPLATE_URL" ] || ! grep -q "$TEMPLATE_URL" "$GITDIR/FETCH_HEAD"; then
  # default merge
  git merge-file -p "$LOCAL" "$BASE" "$REMOTE" > "$LOCAL"
  exit $?
fi

# conflict detection (excluding name/version)
keys=$(jq -r 'keys[]' <(jq -s '.[0] + .[1] + .[2]' "$BASE" "$LOCAL" "$REMOTE") | sort -u)

conflicts=()
for key in $keys; do
  if [ "$key" = "name" ] || [ "$key" = "version" ]; then
    continue
  fi
  Bk=$(jq -c --arg k "$key" '.[$k] // empty' "$BASE")
  Lk=$(jq -c --arg k "$key" '.[$k] // empty' "$LOCAL")
  Rk=$(jq -c --arg k "$key" '.[$k] // empty' "$REMOTE")
  if [ "$Lk" != "$Rk" ]; then
    conflicts+=("$key")
  fi
done

if [ ${#conflicts[@]} -gt 0 ]; then
  echo "Conflict keys in package.json:" >&2
  for k in "${conflicts[@]}"; do echo "- $k" >&2; done
  exit 1
fi

# no conflicts, perform merge and preserve name/version
LOCAL_NAME=$(jq -r '.name // empty' "$LOCAL")
LOCAL_VER=$(jq -r '.version // empty' "$LOCAL")
merged=$(jq -s '.[0] * .[1] * .[2]' "$BASE" "$LOCAL" "$REMOTE")
echo "$merged" | jq --arg name "$LOCAL_NAME" --arg version "$LOCAL_VER" \
     '.name = $name | .version = $version' > "$LOCAL"
exit 0