#!/bin/bash

# Script to kill Firebase emulator processes running on specific ports
# Ports based on firebase.json configuration:
# - 9099: Auth emulator
# - 5001: Functions emulator
# - 8181: Firestore emulator
# - 9199: Storage emulator

PORTS=(9099 5001 8181 9199)
echo "🔍 Checking for processes running on Firebase emulator ports..."

for PORT in "${PORTS[@]}"; do
    # Find process ID using the port
    PID=$(lsof -ti:$PORT 2>/dev/null)

    if [ ! -z "$PID" ]; then
        echo "⚠️  Found process $PID running on port $PORT"
        echo "🛑 Killing process $PID..."
        kill -9 $PID 2>/dev/null

        if [ $? -eq 0 ]; then
            echo "✅ Successfully killed process on port $PORT"
        else
            echo "❌ Failed to kill process on port $PORT"
        fi
    else
        echo "ℹ️  No process found on port $PORT"
    fi
done

echo "🎉 Port cleanup completed!"
echo "🚀 You can now run your Firebase emulators safely."