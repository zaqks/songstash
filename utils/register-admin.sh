#!/usr/bin/env bash

set -a
source ../.env
set +a

curl -i -X POST "$NEON_AUTH_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }"