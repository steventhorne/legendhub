#!/bin/bash

# Choose directory
echo "Enter publish directory:"
read -e publishPath

# Move files
if [ -d "bin" ]; then
	rm -rf bin
fi
mkdir bin

cp -r .htaccess builder css img items maintenance.html php wiki error index.html js login.html mobs quests shared bin/
