import csv from "csvtojson";
import inquirer from "inquirer";
import { existsSync, writeFileSync } from "fs";
import yargs from "yargs";
import chalk from "chalk";

const scriptVersion = "1.0.0";

const argv = yargs(process.argv.slice(2))
  .option("file", {
    alias: "f",
    description: "Specify the CSV file to convert",
    type: "string",
  })
  .version(scriptVersion)
  .help()
  .alias("help", "h")
  .alias("version", "v")
  .usage(chalk.green("Usage: $0 [-f | --file] [filename]"))
  .example(
    chalk.blue("node $0 --file data.csv"),
    chalk.cyan("Converts data.csv to JSON format")
  ).argv;

(async () => {
  let fileName = argv.file;
  if (!fileName) {
    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "fileName",
          message: `Enter the file name:`,
          validate: (input) => {
            input = input?.trim();
            if (!existsSync(input)) {
              return "Please enter file name that exists";
            }
            if (!input.endsWith(".csv")) {
              return "Please enter a CSV file";
            }
            return true;
          },
        },
      ]);
      fileName = answers.fileName;
    } catch (error) {
      console.info(chalk.blue.bold("[INFO]"), chalk.cyan("Exiting..."));
      process.exit(0);
    }
  }

  if (!existsSync(fileName)) {
    console.error(
      chalk.bold("[ERROR]"),
      `Filename not found in directory: ${fileName}. \nExiting...`
    );
    process.exit(1);
  }

  if (!fileName.endsWith(".csv")) {
    console.error(chalk.bold("[ERROR]"), "Please enter a CSV file. Exiting...");
    process.exit(1);
  }

  try {
    const jsonObj = await csv().fromFile(fileName);
    writeFileSync(
      `${fileName.split(".").pop()}.json`,
      JSON.stringify(jsonObj, null, 2)
    );
    console.log(chalk.green(chalk.bold("[LOG]"), "File converted successfully"));
  } catch (err) {
    console.error(chalk.bold("[ERROR]"), "Error converting file:", err);
  }
})();
