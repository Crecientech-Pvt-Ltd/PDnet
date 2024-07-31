import { existsSync, writeFileSync } from "fs";
import { Parser } from "json2csv";
import inquirer from "inquirer";
import yargs from "yargs";
import chalk from "chalk";
import { createRequire } from "module";

// Default file names
const defaultOutputFile = "universal.csv";

// Command-line argument parsing with yargs
const argv = yargs(process.argv.slice(2))
  .option("inputFile", {
    alias: "i",
    description: "Specify the input JSON file name",
    type: "string",
  })
  .option("outputFile", {
    alias: "o",
    description: "Specify the output CSV file name",
    type: "string",
  })
  .help()
  .alias("help", "h")
  .version("1.0.0")
  .alias("version", "v")
  .usage(
    chalk.green("Usage: $0 [-i | --inputFile] <inputFile> [-o | --outputFile] <outputFile>")
  )
  .example(
    chalk.blue("node $0 -i universal.json -o universal.csv"),
    chalk.cyan("Convert JSON to CSV")
  ).argv;

async function promptForDetails(answer) {
  const questions = [
    !answer.inputFile && {
      type: "input",
      name: "inputFile",
      message: `Enter the input file name:`,
      validate: (input) => {
        input = input?.trim();
        if (!existsSync(input)) {
          return "Please enter file path that exists";
        }
        if (!input.endsWith(".json")) {
          return "Please enter a JSON file";
        }
        return true;
      },
    },
    !answer.outputFile && {
      type: "input",
      name: "outputFile",
      message: `Enter the output file name:`,
      default: defaultOutputFile,
    },
  ].filter(Boolean);

  return inquirer.prompt(questions);
}

const transformData = (data) => {
  return data.map((entry) => {
    return entry.row.reduce((obj, item) => {
      obj[item.name] = item.value;
      return obj;
    }, {});
  });
};

(async () => {
  try {
    let { inputFile, outputFile } = argv;

    if (!inputFile || !outputFile) {
      try {
        const answers = await promptForDetails({ inputFile, outputFile });
        inputFile = inputFile || answers.inputFile;
        outputFile = outputFile || answers.outputFile;
      } catch (error) {
        console.info(chalk.blue.bold("[INFO]"), chalk.cyan("Exiting..."));
        process.exit(0);
      }
    }

    if (!existsSync(inputFile)) {
      console.error(
        chalk.bold("[ERROR]"),
        `Filename not found in directory: ${inputFile}. \nExiting...`
      );
      process.exit(1);
    }

    if (!inputFile.endsWith(".json")) {
      console.error(
        chalk.bold("[ERROR]"),
        "Please enter a JSON file. Exiting..."
      );
      process.exit(1);
    }

    if (!outputFile.endsWith(".csv")) {
      outputFile += ".csv";
    }
    const require = createRequire(import.meta.url);
    const jsonData = require(`./${inputFile}`);
    const transformedData = transformData(jsonData);

    const fields = transformedData[0] ? Object.keys(transformedData[0]) : [];

    // Convert JSON to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transformedData);

    // Write CSV to file
    writeFileSync(outputFile, csv);

    console.log(chalk.green(chalk.bold("[LOG]"), "Conversion complete"));
    console.log(
      chalk.green(
        chalk.bold("[LOG]"),
        `CSV file has been written to ${outputFile}`
      )
    );
  } catch (error) {
    console.error(chalk.bold("[ERROR]"), "An error occurred:");
    console.error(error);
    process.exit(1);
  }
})();
