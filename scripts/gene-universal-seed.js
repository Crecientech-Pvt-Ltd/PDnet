import neo4j from "neo4j-driver";
import inquirer from "inquirer";
import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import yargs from "yargs";
import chalk from "chalk";
import { platform } from "node:os";

const defaultUsername = "neo4j";
const defaultDatabase = "pdnet";
const defaultDbUrl = "bolt://localhost:7687";

async function askQuestion(question) {
  try {
    return inquirer.prompt(question);
  } catch (error) {
    console.info(chalk.blue.bold("[INFO]"), chalk.cyan("Exiting..."));
    process.exit(0);
  }
}

// Command-line argument parsing with yargs
const argv = yargs(process.argv.slice(2))
  .option("file", {
    alias: "f",
    description: "Specify the CSV file path",
    type: "string",
  })
  .option("dbUrl", {
    alias: "U",
    description: "Specify the database URL",
    type: "string",
  })
  .option("username", {
    alias: "u",
    description: "Specify the database username",
    type: "string",
  })
  .option("password", {
    alias: "p",
    description: "Specify the database password",
    type: "string",
  })
  .option("database", {
    alias: "d",
    description: "Specify the database name",
    type: "string",
  })
  .option("disease", {
    alias: "D",
    description: "Specify the disease name",
    type: "string",
  })
  .help()
  .alias("help", "h")
  .version("1.0.0")
  .alias("version", "v")
  .usage(
    chalk.green(
      "Usage: $0 [-f | --file] <filename> [-U | --dbUrl] <url> [-u | --username] <username> [-p | --password] <password> [-d | --database] <database> [-D | --disease] <disease>"
    )
  )
  .example(
    chalk.blue(
      "node $0 -f universal.csv -U bolt://localhost:7687 -u neo4j -p password -d pdnet -D ALS"
    ),
    chalk.cyan("Load data in Neo4j")
  ).argv;

async function promptForDetails(answer) {
  const questions = [
    !answer.file && {
      type: "input",
      name: "file",
      message: `Enter the file path:`,
      validate: (input) => {
        input = input?.trim();
        if (!input.endsWith(".csv")) {
          return "Please enter a CSV file";
        }
        return true;
      },
    },
    !answer.dbUrl && {
      type: "input",
      name: "dbUrl",
      message: `Enter the database URL:`,
      default: defaultDbUrl,
    },
    !answer.username && {
      type: "input",
      name: "username",
      message: `Enter the username: (default: neo4j)`,
      default: defaultUsername,
    },
    !answer.password && {
      type: "password",
      name: "password",
      message: `Enter the password:`,
      mask: "*",
      required: true,
    },
    !answer.database && {
      type: "input",
      name: "database",
      message: `Enter the database name: (default: pdnet)`,
      default: defaultDatabase,
      required: true,
    },
    !answer.disease && {
      type: "input",
      name: "disease",
      message: `Enter the disease name: (Press Enter if disease independent data)`,
    },
  ].filter(Boolean);

  return inquirer.prompt(questions);
}

async function seedData() {
  let { file, dbUrl, username, password, database, disease } = argv;

  if (!file || !dbUrl || !username || !password || !database || !disease) {
    try {
      const answers = await promptForDetails({
        file,
        dbUrl,
        username,
        password,
        database,
        disease,
      });
      file = file || answers.file;
      dbUrl = dbUrl || answers.dbUrl;
      username = username || answers.username;
      password = password || answers.password;
      database = database || answers.database;
      disease = (disease || answers.disease).toUpperCase();
    } catch (error) {
      console.info(chalk.blue.bold("[INFO]"), chalk.cyan("Exiting..."));
      process.exit(0);
    }
  }

  if (platform() === "win32") file = file.replace("/", "\\");
  if (!file.endsWith(".csv")) {
    console.error(chalk.bold("[ERROR]"), "Please enter a CSV file. Exiting...");
    process.exit(1);
  }

  const readInterface = createInterface({
    input: createReadStream(file),
  });
  readInterface.once("line", async (line) => {
    readInterface.close();
    let headers = line.split(",");
    if (headers.length < 2) {
      console.error(
        chalk.bold("[ERROR]"),
        "CSV file must have at least two columns"
      );
      process.exit(1);
    }
    const ID = headers.shift();
    await (async () => {
      headers = headers = headers
        .map((header) => {
          header = header.trim().replace(/"/g, "");

          // Convert the header to lowercase for case-insensitive comparison
          const lowerHeader = header.toLowerCase();

          // Conditions for keeping the header as it is (ignoring case)
          if (
            [
              "hgnc_gene_id",
              "hgnc_gene_symbol",
              "description",
              "gene name",
              "gene_name",
            ].includes(lowerHeader)
          ) {
            return header; // Keep this header, original casing
          }

          // Conditions for modifying the header based on prefixes (ignoring case)
          if (
            lowerHeader.startsWith("gda_") ||
            lowerHeader.startsWith("gwas_") ||
            lowerHeader.startsWith("genetics_") ||
            lowerHeader.startsWith("logfc_")
          ) {
            if (lowerHeader.startsWith("gwas_")) {
              header = header.replace(/GWAS_/i, "Genetics_"); // Modify GWAS_ to Genetics_, case-insensitive
            }
            // If a disease is specified, prepend the disease name to the header
            return disease ? `${disease}_${header}` : header;
          } else if (
            // Conditions for keeping headers with specific prefixes (ignoring case)
            lowerHeader.startsWith("pathway_") ||
            lowerHeader.startsWith("druggability_") ||
            lowerHeader.startsWith("te_") ||
            lowerHeader.startsWith("database_")
          ) {
            return header; // Keep this header
          } else {
            // Warn that the header is ignored if it doesn't meet the above criteria
            console.warn(chalk.bold("[WARN]"), `Header "${header}" Ignored`);
          }
        })
        .filter(Boolean); // Filters out undefined or null values (i.e., ignored headers)
    })();

    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        "Headers (filtered):",
        chalk.underline(headers)
      )
    );
    console.log(
      chalk.green(chalk.bold("[LOG]"), "Gene ID Header:", chalk.underline(ID))
    );

    const driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));

    const session = driver.session({
      database: database,
    });

    const query = `
    LOAD CSV WITH HEADERS FROM 'file:///${file}' AS row
    CALL {
    WITH row
    MATCH (g:Gene { ID: row.\`${ID}\` })
    SET ${headers
      .map(
        (header) =>
          `g.\`${/^gene_?name$/i.test(header) ? "Gene_name" : header}\` = row.\`${
            header.startsWith(`${disease}_`)
              ? header.slice(disease.length + 1)
              : header
          }\``
      )
      .join(",\n")} 
      } IN TRANSACTIONS OF 1000 ROWS;
    `.replace(/"/g, "");

    const writeStream = createWriteStream("seed.cypher");
    writeStream.write(query);
    writeStream.end();

    try {
      console.log(
        chalk.green(chalk.bold("[LOG]"), "This will take a while...")
      );
      const result = await session.run(query);
      console.log(chalk.green(chalk.bold("[LOG]"), "Data loaded"));
      console.log(
        chalk.green(
          chalk.bold("[LOG]"),
          `Properties updated: ${result.summary.updateStatistics.updates().propertiesSet}`
        )
      );

      const indexQuery = "CREATE INDEX Gene_name IF NOT EXISTS FOR (g:Gene) ON (g.Gene_name)";
      await session.run(indexQuery);
      console.log(chalk.green(chalk.bold("[LOG]"), "Index created."));
      console.log(chalk.green(chalk.bold("[LOG]"), "Data seeding completed"));
    } catch (error) {
      console.error(
        chalk.bold("[ERROR]"),
        "Error connecting to database. \nMake sure database is active and database URL/credentials are valid",
        error
      );
      process.exit(1);
    } finally {
      await session.close();
      await driver.close();
    }
  });
}

seedData();
