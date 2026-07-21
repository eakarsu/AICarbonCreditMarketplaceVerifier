#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."&&pwd)";set -a;. "$root/.env";set +a;: "${DATABASE_URL:?}";for f in "$root"/server/migrations/*.sql;do psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f "$f";done
