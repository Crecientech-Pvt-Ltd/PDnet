import neo4j from "neo4j-driver";
import inquirer from "inquirer";
import { existsSync } from "fs";
import chalk from "chalk";
import yargs from "yargs";
import { platform } from "os";
import { execSync } from "child_process";

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
            message: `Enter the import directory path:`,
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
          message: `Enter the import directory path:`,
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
  const fileDir = file.split(`${platform() === 'win32' ? '\\' : '/'}`).slice(0, -1).join(`${platform() === 'win32' ? '\\' : '/'}`);
  if (fileDir.length) {
    try {
      execSync(`mkdir ${importDir}${fileDir}`);
      console.log(
        chalk.green(
          chalk.bold("[LOG]"),
          `Created directory at Neo4j import directory`
        )
      );
    } catch (error) {}
  }
  
  importDir += file;
  try {
    execSync(`${platform() === "win32" ? "copy" : "cp"} ${file} ${importDir}`);
    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        `Transferred file to Neo4j import directory`
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
  .option("interactionType", {
    alias: "i",
    description: "Specify the interaction type",
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
      "Usage: $0 [-f | --file] <filename> [-U | --dbUrl] <url> [-u | --username] <username> [-p | --password] <password> [-d | --database] <database> [-i | --interactionType] <interactionType>"
    )
  )
  .example(
    chalk.blue(
      "node $0 -f data.csv -U bolt://localhost:7687 -u neo4j -p password -d pdnet -i PPI -U /var/lib/neo4j/import"
    )
  )
  .example(chalk.cyan("Load data in Neo4j")).argv;

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
    !answer.interactionType && {
      type: "input",
      name: "interactionType",
      message: `Enter the interaction type [Make sure it's just one word]:`,
      required: true,
    },
  ].filter(Boolean);

  return inquirer.prompt(questions);
}

(async function main() {
  let {
    file,
    dbUrl,
    username,
    password,
    database,
    interactionType,
    importDir,
  } = argv;
  console.info(
    chalk.blue.bold("[INFO]"),
    chalk.cyan("Make sure to not enter headers in CSV file")
  );
  console.info(
    chalk.blue.bold("[INFO]"),
    chalk.cyan(
      "'1st ENSG Gene ID,2nd ENSG Gene ID,Score' should be the format of CSV file"
    )
  );
  if (
    !file ||
    !dbUrl ||
    !username ||
    !password ||
    !database ||
    !interactionType
  ) {
    try {
      const answers = await promptForDetails({
        file,
        dbUrl,
        username,
        password,
        database,
        interactionType,
      });
      file = file || answers.file;
      dbUrl = dbUrl || answers.dbUrl;
      username = username || answers.username;
      password = password || answers.password;
      database = database || answers.database;
      interactionType = interactionType || answers.interactionType;
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
  
  const driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));

  const session = driver.session({
    database: database,
  });
  if (platform() === 'win32') file = file.replace(/\\/g, "/");
  try {
    await session.run(`
      CREATE CONSTRAINT IF NOT EXISTS FOR (g:Gene)
      REQUIRE g.ID IS UNIQUE
    `);
  } catch (error) {
    console.error(
      chalk.bold("[ERROR]"),
      `Error connecting to database. \nMake sure database is active and database URL/credentials are valid`
    );
    process.exit(1);
  }

  console.log(
    chalk.green(
      chalk.bold("[LOG]"),
      "Created uniqueness constraint on Gene nodes"
    )
  );
  console.log(
    chalk.green(
      chalk.bold("[LOG]"),
      "This process will take some time. Please wait..."
    )
  );

  const query = `
    LOAD CSV FROM 'file:///${file}' AS line
    CALL {
      WITH line
      MERGE (g1:Gene {ID: line[0]})
      MERGE (g2:Gene {ID: line[1]})
      MERGE (g1)-[r:${interactionType}]->(g2)
      ON CREATE SET r.score = toFloat(line[2])
    } IN TRANSACTIONS OF 10000 ROWS;
  `;

  try {
    const result = await session.run(query);
    console.log(chalk.green(chalk.bold("[LOG]"), "Data loaded using LOAD CSV"));
    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        `Nodes Created: ${result.summary.counters.updates().nodesCreated}`
      )
    );
    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        `Relationship Created: ${result.summary.counters.updates().relationshipsCreated}`
      )
    );
  } catch (error) {
    console.error(chalk.bold("[ERROR]"), "Error during data loading:", error);
    console.error(chalk.bold("[ERROR]"), `Make sure database is online`);
  } finally {
    await session.close();
    await driver.close();
  }
})();
