#!/bin/bash
# log_response.sh

# Get the message from arguments
MESSAGE="$1"
SOURCE="$2"  # Either "user" or "jarvis"

# Send the message to the API
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"$MESSAGE\",\"source\":\"$SOURCE\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"

echo "Response logged successfully" 