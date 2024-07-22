import neo4j from "neo4j-driver";
import inquirer from "inquirer";
import { existsSync, createReadStream } from "fs";
import { createInterface } from "readline";
import yargs from "yargs";
import chalk from "chalk";

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
        if (!existsSync(input)) {
          return "Please enter file path that exists";
        }
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
      required: true,
    },
    !answer.username && {
      type: "input",
      name: "username",
      message: `Enter the username:`,
      required: true,
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
      default: "pdnet",
    },
    !answer.disease && {
      type: "input",
      name: "disease",
      message: `Enter the disease name:`,
      required: true,
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

  if (!existsSync(file)) {
    console.error(
      chalk.bold("[ERROR]"),
      `Filename not found in directory: ${file}. \nExiting...`
    );
    process.exit(1);
  }

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
    headers = headers.map((header) => {
      header = header.trim();
      if (
        header.startsWith("pathway_") ||
        header.startsWith("Druggability_") ||
        header.startsWith("TE_") ||
        header.startsWith("GDA_") ||
        header.startsWith("GWAS_") ||
        header.startsWith("logFC_") ||
        header.startsWith("database_")
      ) {
        return `${disease}_${header}`;
      }
    });

    console.log(chalk.green(chalk.bold("[LOG]"), "Headers (filtered):", chalk.underline(headers)));
    console.log(chalk.green(chalk.bold("[LOG]"), "Gene ID Header:", chalk.underline(ID)));

    const driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));

    const session = driver.session({
      database: database,
    });

    const query = `
    LOAD CSV WITH HEADERS FROM 'file:///${file}' AS row
    MERGE (g:Gene { ID: row.${ID} })
    SET ${headers.map((header) => `g.${header} = row.${header}`).join(",\n")} ;
  `;

    try {
      console.log(
        chalk.green(chalk.bold("[LOG]"), "This will take a while...")
      );
      const result = await session.run(query);
      console.log(
        chalk.green(
          chalk.bold("[LOG]"),
          "Data loaded:",
          result.summary.counters
        )
      );

      const indexQuery = `CREATE INDEX Gene_name IF NOT EXISTS FOR (g:Gene) ON (g.Gene_name)`;
      await session.run(indexQuery);
      console.log(chalk.green(chalk.bold("[LOG]"), "Index created."));
      console.log(chalk.green(chalk.bold("[LOG]"), "Data seeding completed"));
    } catch (error) {
      console.error(
        chalk.bold("[ERROR]"),
        `Error connecting to database. \nMake sure database is active and database URL/credentials are valid`
      );
      process.exit(1);
    } finally {
      await session.close();
      await driver.close();
    }
  });
}

seedData();
