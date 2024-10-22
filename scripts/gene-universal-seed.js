import neo4j from "neo4j-driver";
import inquirer from "inquirer";
import { existsSync, createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import yargs from "yargs";
import chalk from "chalk";
import { platform } from "node:os";
import { execSync } from "node:child_process";

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

async function transferFile(file, importDir) {
  // Transfer file to Neo4j import directory
  if (!importDir) {
    if (platform() === "linux") {
      importDir = "/var/lib/neo4j/import";
      // ask confimation to use default import directory
      const { useDefault } = await askQuestion({
        type: "confirm",
        name: "useDefault",
        message: `Use default import directory: ${importDir}?`,
        default: true,
      });
      if (!useDefault) {
        importDir = (
          await askQuestion({
            type: "input",
            name: "importDir",
            message: "Enter the import directory path:",
            validate: (input) => {
              input = input?.trim();
              if (!existsSync(input)) {
                return "Please enter a valid directory path";
              }
              return true;
            },
          })
        ).importDir;
      }
    } else {
      importDir = (
        await askQuestion({
          type: "input",
          name: "importDir",
          message: "Enter the import directory path:",
          validate: (input) => {
            input = input?.trim();
            if (!existsSync(input)) {
              return "Please enter a valid directory path";
            }
            return true;
          },
        })
      ).importDir;
    }
  }
  if (platform() === "win32" && !importDir.endsWith("\\")) importDir += "\\";
  else if (platform() === "linux" && !importDir.endsWith("/")) importDir += "/";

  if (platform() === "win32") file = file.replace("/", "\\");
  const fileDir = file
    .split(`${platform() === "win32" ? "\\" : "/"}`)
    .slice(0, -1)
    .join(`${platform() === "win32" ? "\\" : "/"}`);

  if (fileDir.length) {
    try {
      execSync(`mkdir ${importDir}${fileDir}`);
      console.log(
        chalk.green(
          chalk.bold("[LOG]"),
          "Created directory at Neo4j import directory"
        )
      );
    } catch (error) { }
  }

  importDir += file;
  try {
    execSync(`${platform() === "win32" ? "copy" : "cp"} ${file} ${importDir}`);
    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        "Transferred file to Neo4j import directory"
      )
    );
  } catch (error) {
    console.error(
      chalk.bold("[ERROR]"),
      `Error transferring file to Neo4j import directory: ${error}`
    );
    process.exit(1);
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
  .option("importDir", {
    alias: "I",
    description: "Specify the import directory",
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
      message: "Enter the file path:",
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
      message: "Enter the database URL:",
      default: defaultDbUrl,
    },
    !answer.username && {
      type: "input",
      name: "username",
      message: "Enter the username: (default: neo4j)",
      default: defaultUsername,
    },
    !answer.password && {
      type: "password",
      name: "password",
      message: "Enter the password:",
      mask: "*",
      required: true,
    },
    !answer.database && {
      type: "input",
      name: "database",
      message: "Enter the database name: (default: pdnet)",
      default: defaultDatabase,
      required: true,
    },
    !answer.disease && {
      type: "input",
      name: "disease",
      message: "Enter the disease name: (Press Enter if disease independent data)",
    },
  ].filter(Boolean);

  return inquirer.prompt(questions);
}

async function seedData() {
  let { file, dbUrl, username, password, database, disease, importDir } = argv;

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

  const { environment } = await askQuestion({
    type: "list",
    name: "environment",
    message: "Select the environment",
    choices: ["Remote", "Local"],
  });

  if (environment === "Local") await transferFile(file, importDir);
  else {
    console.info(
      chalk.blue.bold("[INFO]"),
      chalk.cyan("Make sure to transfer the file to Neo4j import directory")
    );
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
      headers = headers.map((header) => {
        header = header.trim().replace(/"/g, "");
        if (['hgnc_gene_id', 'hgnc_gene_symbol', 'Description', 'Gene name'].includes(header)) {
          return header;
        }
        if (
          header.startsWith("GDA_") ||
          header.startsWith("GWAS_") ||
          header.startsWith("Genetics_") ||
          header.startsWith("logFC_")
        ) {
          if (header.startsWith("GWAS_")) header.replace("GWAS_", "Genetics_");
          return disease ? `${disease}_${header}` : header;
        } if (
          header.startsWith("pathway_") ||
          header.startsWith("Druggability_") ||
          header.startsWith("TE_") ||
          header.startsWith("database_")
        ) {
          return header;
        }
        console.warn(chalk.bold("[WARN]"), `Header "${header}" Ignored`);
      }).filter(Boolean);
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
    if (platform() === "win32") file = file.replace(/\\/g, "/");

    const query = `
    LOAD CSV WITH HEADERS FROM 'file:///${file}' AS row
    CALL {
    WITH row 
    MATCH (g:Gene { ID: row.\`${ID}\` })
    SET ${headers
        .map((header) => `g.\`${header === 'Gene name' ? 'Gene_name' : header}\` = row.\`${header.startsWith(`${disease}_`) ? header.slice(disease.length + 1) : header}\``)
        .join(",\n")} 
    } IN TRANSACTIONS OF 10000 ROWS;
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
