#!/bin/bash

# AgentDesk Backend Starter Script
# Use this script to properly start the backend after killing old processes

echo "🧹 Cleaning up old processes on port 3001..."

# Find process using port 3001
PID=$(netstat -ano | grep :3001 | grep LISTENING | awk '{print $5}' | head -1)

if [ ! -z "$PID" ]; then
    echo "Found process $PID using port 3001. Killing it..."
    taskkill.exe //PID $PID //F
    sleep 2
else
    echo "No process found on port 3001"
fi

echo "🚀 Starting Backend..."
cd backend
npm run dev

