# Scripts for Data Pre-processing & Uploading to database

> For developers:
> You can automate the data pre-processing and uploading to the database using the scripts provided in this directory by providing necessary options to run script without human interactions. Use the command for help `node <script-name> [-h | --help]` to know more about the options available.

## Q: Do you have unnormlized protein-protein interaction data?

1. Run the following scripts to normalize the data & provide the required input in interactive mode.:

   ```bash
   npm run protein-normalizer-txt2csv
   # OR
   node protein-normalizer-txt2csv.js # with options
   ```

2. Now, protein to gene mapping is required to upload the data to the database. Run the following script to map protein to gene & provide the required input in interactive mode.:

   ```bash
   npm run protein2gene
   # OR
   node --max-old-space-size=6144 protein2gene.js # with options
   ```

## Database Seeding

### Seeding the Interaction database

> 💡 **NOTE**  
> Before running the following scripts, make sure you have transferred the seeding data to the server.
>
> - To transfer files to the server, you can use the following command:
>
> ```bash
> # Transfer files to the server
> scp -r <source-path> <username>@<server-ip>:<destination-path>
> ```
>
> > 💡 **NOTE**  
> > Replace `<destination-path>` with the path specified in the [docker-compose.yml](../docker-compose.yml) file.
> >
> > ```yaml
> > services:
> >   neo4j:
> >     ...
> >     volumes:
> >       - <destination-path>:/var/lib/neo4j/import
> > ```
>
> - If running the scripts remotely, make sure to transfer the file to import directory of neo4j database.

Now, you can upload the data to the database. Run the following script to upload the data to the database & provide the required input in interactive mode.:

```bash
npm run gene-score-seed
# OR
node gene-score-seed.js # with options
```

### Seeding the Universal Data

Now, you can upload the universal data to the database. Run the following script to upload the data to the database & provide the required input in interactive mode.:

> 💡 **NOTE**
> Before running the following scripts, make sure you have transferred the seeding data to the server. And csv data needs to be in the same folder as the script.
> You can choose whether to upload data in local environment or remote environment which starts or skips file transfering process respectively.

```bash
npm run gene-universal-seed
# OR
node gene-universal-seed.js # with options
```

### Reference Genome Update

Incase, you have a new reference genome data, you can update the reference genome data in the database. Run the following script to update the reference genome data in the database & provide the required input in interactive mode.:

```bash
npm run reference-genome-update
# OR
node reference-genome-update.js # with options
```

## Utitlity Scripts

1. csv2json: Convert CSV file to JSON file.

   ```bash
   npm run csv2json
   # OR
   node csv2json.js # with options
   ```

2. Universal-json2csv: Convert Universal JSON file to CSV file.

   ```bash
   npm run universal-json2csv
   # OR
   node universal-json2csv.js # with options
   ```

## FAQ

1. Q: How to install node.js and npm in linux system?

   A: Run the following commands to install node.js and npm in linux system:

   ```bash
   sudo apt update -y
   sudo apt install nodejs -y
   sudo apt install npm -y
   ```

2. Q: What is import directory of database?

   A: The import directory is the directory where the database looks for the files to import the data to the database.
   - For linux system, the default import directory is `/var/lib/neo4j/import`.
   - For windows system, the default import directory is `C:\Users\<username>\AppData\Neo4j\Relate\Data\dbmss\<dbms-id>\import`.
