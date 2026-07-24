#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$root/.env" ] || { echo "Copy .env.example to .env." >&2; exit 1; }
[ -d "$root/node_modules" ] && [ -d "$root/client/node_modules" ] || { echo "Run scripts/bootstrap.sh." >&2; exit 1; }
set -a
. "$root/.env"
set +a

backend_port="${BACKEND_PORT:-${PORT:-3001}}"
frontend_port="${FRONTEND_PORT:-3000}"
for port in "$backend_port" "$frontend_port"; do
  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; refusing to stop another process." >&2
    exit 1
  fi
done

if [ "${MIGRATE_ON_START:-false}" = true ]; then
  case "${ALLOW_SCHEMA_MIGRATION:-}" in
    1|true) ;;
    *) echo "Explicit schema migration acknowledgement is required." >&2; exit 1 ;;
  esac
  bash "$root/scripts/migrate.sh"
  node "$root/server/scripts/create-admin.js"
fi

server_pid=''
client_pid=''
cleanup() {
  [ -z "$server_pid" ] || kill "$server_pid" 2>/dev/null || true
  [ -z "$client_pid" ] || kill "$client_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
(PORT="$backend_port" node "$root/server/index.js") & server_pid=$!
(cd "$root/client" && BROWSER=none PORT="$frontend_port" ./node_modules/.bin/react-scripts start) & client_pid=$!
wait "$server_pid" "$client_pid"
