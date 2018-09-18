#!/bin/bash

#Reminders
read -p "Have you created your php config? [Y/n]:" configCreated
configCreated=${configCreated:-Y}
echo $configCreated
if ! [[ $configCreated == "y" || $configCreated == "Y" ]]; then
	echo "Please create your php config file using the template provided."
	exit 1
fi

# Choose directory
echo "Enter publish directory:"
read -e publishPath

# Move files to bin folder to work on
if [[ -d "bin" ]]; then
	rm -rf bin
fi
mkdir bin

cp -r .htaccess builder css items maintenance.html php wiki error index.html js login.html mobs quests shared bin/

# Copy to publish path
if ! [[ -d $publishPath ]]; then
	mkdir $publishPath
fi
	
cp -r bin/. $publishPath
