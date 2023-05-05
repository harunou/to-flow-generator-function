#!/bin/bash
# vim:set et sw=2:

EXTENSIONS=("*.ts" "*.tsx" "*.js" "*.jsx" "*.html" "*.json" "*.scss" "*.css")
FILES=$(git diff --cached --name-only --diff-filter=ACMR "${EXTENSIONS[@]}" | sed 's| |\\ |g')
[ -z "$FILES" ] && exit 0

# Prettify all selected files
echo "$FILES" | xargs npx prettier --write
prettier_exit_status=$?

# Add back the modified/prettified files to staging
echo "$FILES" | xargs git add
exit $prettier_exit_status
