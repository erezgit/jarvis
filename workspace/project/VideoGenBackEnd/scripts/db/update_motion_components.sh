#!/bin/bash

# Script to update motion components in the prompt_components table
# This script runs in a supervised manner, showing the changes before applying them

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Motion Components Update Script${NC}"
echo "This script will update the motion category components in the prompt_components table."
echo "It will replace the existing motion components with new motion-focused options."
echo ""

# Check if PGDATABASE environment variable is set
if [ -z "$PGDATABASE" ]; then
  echo -e "${YELLOW}Database connection information:${NC}"
  read -p "Database name: " DB_NAME
  read -p "Database user: " DB_USER
  read -p "Database host (default: localhost): " DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  read -p "Database port (default: 5432): " DB_PORT
  DB_PORT=${DB_PORT:-5432}
  
  # Ask for password but don't echo it
  read -s -p "Database password: " DB_PASSWORD
  echo ""
  
  # Export as environment variables for psql
  export PGDATABASE=$DB_NAME
  export PGUSER=$DB_USER
  export PGHOST=$DB_HOST
  export PGPORT=$DB_PORT
  export PGPASSWORD=$DB_PASSWORD
else
  echo -e "${GREEN}Using existing database connection settings from environment variables.${NC}"
fi

echo ""
echo -e "${YELLOW}Step 1: Showing current motion components${NC}"
echo "Fetching current motion components from the database..."

# Show current motion components
psql -c "SELECT id, name, description, display_order FROM public.prompt_components WHERE category = 'motion' ORDER BY display_order;"

echo ""
echo -e "${YELLOW}Step 2: Preview of changes${NC}"
echo "The following motion components will be added:"

# Show the new components from the SQL file (parsing the SQL file)
echo -e "${GREEN}New motion components:${NC}"
grep -A 1 "Fade In\|Slide From Left\|Slide From Right\|Pop Up\|Zoom In\|Zoom Out\|Rotate\|Bounce\|Float Up\|Burst" scripts/db/update_motion_components.sql | grep -v -- "--" | sed 's/^[[:space:]]*//'

echo ""
echo -e "${YELLOW}Step 3: Confirmation${NC}"
read -p "Do you want to proceed with the update? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo -e "${RED}Update cancelled.${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Applying changes${NC}"
echo "Running SQL script to update motion components..."

# Run the SQL script
psql -f scripts/db/update_motion_components.sql

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Motion components updated successfully!${NC}"
  
  echo ""
  echo -e "${YELLOW}Step 5: Verifying changes${NC}"
  echo "Fetching updated motion components from the database..."
  
  # Show updated motion components
  psql -c "SELECT id, name, description, display_order FROM public.prompt_components WHERE category = 'motion' ORDER BY display_order;"
else
  echo -e "${RED}Error updating motion components. Please check the error message above.${NC}"
  exit 1
fi

# Clean up environment variables if we set them
if [ -z "$PGDATABASE" ]; then
  unset PGDATABASE PGUSER PGHOST PGPORT PGPASSWORD
fi

echo ""
echo -e "${GREEN}Motion components update completed.${NC}"
exit 0 