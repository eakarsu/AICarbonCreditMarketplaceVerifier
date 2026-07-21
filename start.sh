#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")"&&pwd)";[ -f "$root/.env" ]||{ echo "Copy .env.example to .env." >&2;exit 1;};[ -d "$root/node_modules" ]&&[ -d "$root/client/node_modules" ]||{ echo "Run scripts/bootstrap.sh." >&2;exit 1;};set -a;. "$root/.env";set +a
server_pid='';client_pid='';cleanup(){ [ -z "$server_pid" ]||kill "$server_pid" 2>/dev/null||true;[ -z "$client_pid" ]||kill "$client_pid" 2>/dev/null||true;};trap cleanup EXIT INT TERM
(node "$root/server/index.js")&server_pid=$!;(cd "$root/client"&&BROWSER=none npm start)&client_pid=$!;wait "$server_pid" "$client_pid"
