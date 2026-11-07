#!/usr/bin/env bash
set -euo pipefail

# Each cloud task is isolated. Use this checkout; do not create a worktree.
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$project_root"
node_version="$(tr -d '\r\n' < .node-version)"
[[ "$node_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
[[ "$(uname -s)" == Linux ]] || { echo 'This helper is for Linux cloud environments.' >&2; exit 1; }
case "$(uname -m)" in
  x86_64) node_arch=x64 ;;
  aarch64) node_arch=arm64 ;;
  *) echo 'Unsupported Node architecture.' >&2; exit 1 ;;
esac

tools_root=/workspace/toolchains
cache_root=/workspace/.cache
node_directory="$tools_root/node-v$node_version-linux-$node_arch"
mkdir -p "$tools_root" "$cache_root"
if [[ ! -x "$node_directory/bin/node" ]]; then
  download_directory="$(mktemp -d /tmp/tabi-node.XXXXXX)"
  trap 'rm -rf "$download_directory"' EXIT
  archive="node-v$node_version-linux-$node_arch.tar.xz"
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v$node_version/$archive" -o "$download_directory/$archive"
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v$node_version/SHASUMS256.txt" -o "$download_directory/SHASUMS256.txt"
  (
    cd "$download_directory"
    awk -v archive="$archive" '$2 == archive { print }' SHASUMS256.txt | sha256sum --check -
    tar -xJf "$archive" -C "$tools_root"
  )
fi
export PATH="$node_directory/bin:$PATH"
[[ "$(node --version)" == "v$node_version" ]]
pnpm_version="$(node --input-type=module -e "import fs from 'node:fs'; console.log(JSON.parse(fs.readFileSync('package.json', 'utf8')).packageManager.replace('pnpm@', ''))")"
[[ "$pnpm_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
pnpm_directory="$tools_root/pnpm-$pnpm_version"
if [[ ! -x "$pnpm_directory/node_modules/.bin/pnpm" ]]; then
  npm install --prefix "$pnpm_directory" --cache "$cache_root/npm" --no-save --package-lock=false "pnpm@$pnpm_version"
fi
activation="$tools_root/tabi-log-env.sh"
{
  printf 'export PATH=%q:"$PATH"\n' "$node_directory/bin:$pnpm_directory/node_modules/.bin"
  printf 'export XDG_CACHE_HOME=%q\n' "$cache_root"
  printf 'export npm_config_store_dir=%q\n' /workspace/.pnpm-store
  printf 'export EXPO_NO_TELEMETRY=1\nexport STORYBOOK_DISABLE_TELEMETRY=1\n'
  printf 'export __UNSAFE_EXPO_HOME_DIRECTORY=%q\n' /workspace/.expo-user
  printf 'export EXPO_UNSTABLE_HEADLESS=1\n'
} > "$activation"
source "$activation"
[[ "$(pnpm --version)" == "$pnpm_version" ]]
pnpm install --frozen-lockfile
pnpm storybook:generate
pnpm hooks:install
printf 'Prepared Node %s / pnpm %s. Activate future shells with: source %s\n' "$node_version" "$pnpm_version" "$activation"
