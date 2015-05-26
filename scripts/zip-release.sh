#!/bin/bash
# This script zips all of the releases into separate zip files for
# easy uploading to Github or wherever else necessary.

for i in */; do cd "$i"; zip -r "../${i%/}.zip" "*"; cd ../; done