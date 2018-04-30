#!/bin/sh

# Sync the build assets via rsync (via SSH)
# This is useful for pushing quick code updates,
# but isn't a complete deploy solution as it won't
# pull in new node modules. (Those need to be built on
# the pi itself, since some require native extensions
# and are architecture/OS specific.)

set -e

npm run-script build
rsync -Pavz dist/ pi@chromastat:~/chromastat/dist/
ssh -tt pi@chromastat 'cd ~/chromastat/dist && sudo npm start'
