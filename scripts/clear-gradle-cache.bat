@echo off
REM Clear Gradle cache and retry build
echo Clearing Gradle cache...

REM Clear local Gradle cache
rmdir /s /q "%USERPROFILE%\.gradle\caches\"
rmdir /s /q "%USERPROFILE%\.gradle\wrapper\"

REM Clear project-specific cache (if exists)
rmdir /s /q ".gradle\"
rmdir /s /q "android\.gradle\"

echo Gradle cache cleared. You can now retry your EAS build.
echo Run: eas build --profile production -p android
