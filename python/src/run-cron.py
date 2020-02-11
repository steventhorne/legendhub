# This is a horrible way to do this, I should revise this at some point.
# But I don't really care right now because I just want to get it working.

import os
from subprocess import call
import fileinput

for line in fileinput.input("/etc/cron.d/cron-python", inplace=1):
    print(line.replace("${MYSQL_PORT}", os.environ["MYSQL_PORT"])
            .replace("${MYSQL_HOST}", os.environ["MYSQL_HOST"])
            .replace("${MYSQL_USER}", os.environ["MYSQL_USER"])
            .replace("${MYSQL_PASSWORD}", os.environ["MYSQL_PASSWORD"])
            .replace("${MYSQL_DATABASE}", os.environ["MYSQL_DATABASE"]), end="")

args = ["cron", "-f", "-L 15"]
call(args)
