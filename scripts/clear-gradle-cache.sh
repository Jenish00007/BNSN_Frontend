#!/bin/bash

# Clear Gradle cache and retry build
echo "Clearing Gradle cache..."

# Clear local Gradle cache
rm -rf ~/.gradle/caches/
rm -rf ~/.gradle/wrapper/

# Clear project-specific cache (if exists)
rm -rf .gradle/
rm -rf android/.gradle/

echo "Gradle cache cleared. You can now retry your EAS build."
echo "Run: eas build --profile production -p android"
