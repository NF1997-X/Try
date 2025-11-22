#!/bin/bash
cd /workspaces/Try
mv Routevm/* .
mv Routevm/.* . 2>/dev/null || true
rmdir Routevm
rm "Routevm (3).zip"
echo "Done!"
