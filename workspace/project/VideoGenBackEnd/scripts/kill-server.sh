#!/bin/bash

# More targeted process killing for Replit environment

echo "=== Cleaning up server processes ==="

# Method 1: Find and kill any process using port 3000
echo "Looking for processes using port 3000..."
pid=$(lsof -t -i:3000 2>/dev/null)

if [ -z "$pid" ]; then
  echo "No process found using port 3000 with lsof."
else
  echo "Found process(es) $pid using port 3000. Killing..."
  for p in $pid; do
    kill -9 $p 2>/dev/null
    echo "Killed process $p"
  done
fi

# Check for other commonly used ports in development
for port in 8000 8080 5000 4000; do
  echo "Checking port $port..."
  port_pid=$(lsof -t -i:$port 2>/dev/null)
  if [ ! -z "$port_pid" ]; then
    echo "Found process(es) $port_pid using port $port. Killing..."
    for p in $port_pid; do
      kill -9 $p 2>/dev/null
      echo "Killed process $p"
    done
  fi
done

# Method 2: Use fuser to find and kill processes (alternative approach)
echo "Using fuser to find processes on port 3000..."
fuser -k 3000/tcp 2>/dev/null
echo "fuser command executed."

# Method 3: Only kill Node.js server processes
echo "Looking for Node.js server processes..."
node_pids=$(ps aux | grep -E "ts-node|node.*index.js" | grep -v grep | awk '{print $2}')

if [ -z "$node_pids" ]; then
  echo "No Node.js server processes found."
else
  echo "Found Node.js server processes: $node_pids. Killing them..."
  for p in $node_pids; do
    kill -9 $p 2>/dev/null
    echo "Killed Node.js server process $p"
  done
fi

# Wait a moment to ensure processes are terminated
echo "Waiting for processes to terminate..."
sleep 1

# Final check
echo "Final check for port 3000..."
final_check=$(lsof -t -i:3000 2>/dev/null)
if [ -z "$final_check" ]; then
  echo "Port 3000 is now free."
else
  echo "WARNING: Port 3000 is still in use by process(es): $final_check"
  echo "You may need to restart your Replit environment."
fi

echo "=== Server cleanup complete ===" 