#!/bin/bash

# Read password from user input with * as mask
read -s "Enter password: " password

exclude_files=("ppi_db_string.csv" "funppi_db_string.csv" "hgnc_master_gene_list_with_uniprot.csv" )

for file in $(find ../data -type f -name "*.csv"); do
    if [[ ! " ${exclude_files[@]} " =~ " ${file} " ]] && [ -e "$file" ]; then
        echo "Processing file: $(basename "$file")"
        node ../gene-universal-seed.js -f "$file" -u neo4j -p  -d pdnet -U bolt://localhost:7687 --nh
    fi
done
