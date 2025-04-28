#!/bin/bash

# This script checks what processes are running when the application starts

echo "Checking running processes..."
ps aux | grep -E "node|ts-node" | grep -v grep

echo "Checking for test-paypal-integration.ts..."
ps aux | grep "test-paypal-integration" | grep -v grep

echo "Done checking processes." 