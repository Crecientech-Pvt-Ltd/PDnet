#!/bin/bash

echo -n "Enter password: "
read -s password
echo

for file in *.csv; do
    if [ -f "$file" ]; then
        echo "Processing file: $file"
        node gene-universal-seed.js -f "$file" -u neo4j -p "$password" -d pdnet -U bolt://localhost:7687
    fi
done
