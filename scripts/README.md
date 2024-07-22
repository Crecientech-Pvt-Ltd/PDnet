# Scripts for Data Pre-processing & Uploading to database

> For developers:
> You can automate the data pre-processing and uploading to the database using the scripts provided in this directory by providing necessary options to run script without human interactions. Use the command for help `node <script-name> [-h | --help]` to know more about the options available.

## Q: Do you have unnormlized protein-protein interaction data?

1. Run the following scripts to normalize the data & provide the required input in interactive mode.:

```bash
npm run protein-normalizer-txt2csv
```

2. Now, protein to gene mapping is required to upload the data to the database. Run the following script to map protein to gene & provide the required input in interactive mode.:

```bash
npm run protein2gene
```

## Seeding the Interaction database

Now, you can upload the data to the database. Run the following script to upload the data to the database & provide the required input in interactive mode.:

```bash
node run gene-score-seed
```

## Seeding the Universal Data

Now, you can upload the universal data to the database. Run the following script to upload the data to the database & provide the required input in interactive mode.:

```bash
node run gene-universal-seed
```


## Utitlity Scripts

1. csv2json: Convert CSV file to JSON file.

```bash
node csv2json
```

2. Universal-json2csv: Convert JSON file to CSV file.

```bash
node universal-json2csv
```