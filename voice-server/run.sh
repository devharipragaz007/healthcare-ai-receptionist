#!/usr/bin/env bash
# Start the CareAI Pipecat voice server.
# Run from the voice-server/ directory after installing requirements.
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "No .env found. Copy .env.example to .env and fill in OPENAI_API_KEY."
  exit 1
fi

python bot.py
