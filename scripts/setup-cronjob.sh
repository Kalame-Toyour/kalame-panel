#!/bin/bash

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create a log directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/../logs"

# Add the cronjob to run every day at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * cd $SCRIPT_DIR/.. && GEMINI_API_KEY=your_api_key npx ts-node scripts/generate-lesson-plans.ts >> logs/lesson-plans-$(date +\%Y-\%m-\%d).log 2>&1") | crontab -

echo "Cronjob has been set up successfully!"
echo "The script will run daily at 2 AM"
echo "Logs will be saved in the logs directory" 