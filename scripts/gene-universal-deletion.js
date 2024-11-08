import yargs from "yargs";
import chalk from "chalk";
import inquirer from "inquirer";
import neo4j from "neo4j-driver";

const args = yargs(process.argv.slice(2))
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
    .option("diseaseIndependent", {
        alias: "di",
        description: "Specify whether data is disease independent",
        type: "boolean",
    }).option("type", {
        alias: "t",
        description: "Specify the type of data to delete",
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
    ).argv;

async function promptForDetails(answer) {
    const questions = [
        !answer.dbUrl && {
            type: "input",
            name: "dbUrl",
            message: `Enter the database URL:`,
            default: "bolt://localhost:7687",
            required: true,
            validate: (input) => {
                input = input?.trim();
                if (!input) {
                    return "Please enter a valid database URL";
                }
                return true;
            },
        },
        !answer.username && {
            type: "input",
            name: "username",
            message: `Enter the database username:`,
            default: "neo4j",
            required: true,
            validate: (input) => {
                input = input?.trim();
                if (!input) {
                    return "Please enter a valid database username";
                }
                return true;
            },
        },
        !answer.password && {
            type: "password",
            name: "password",
            message: `Enter the database password:`,
            required: true,
            validate: (input) => {
                input = input?.trim();
                if (!input) {
                    return "Please enter a valid database password";
                }
                return true;
            },
        },
        !answer.database && {
            type: "input",
            name: "database",
            message: `Enter the database name:`,
            default: "pdnet",
            required: true,
            validate: (input) => {
                input = input?.trim();
                if (!input) {
                    return "Please enter a valid database name";
                }
                return true;
            },
        },
        !answer.disease && {
            type: "input",
            name: "disease",
            message: `Enter the disease name (Press Enter if disease independent):`,
        },
        !answer.type && {
            type: "list",
            name: "type",
            message: `Enter the type of data to delete:`,
            choices: [
                "TE",
                "database",
                "pathway",
                "Druggability",
                "GDA",
                "Genetics",
                "logFC",
            ],
            required: true,
        },
    ];

    const answers = await inquirer.prompt(questions.filter(Boolean));
    return {
        ...answer,
        ...answers,
    };
}

(async function deleteData() {
    let { dbUrl, username, password, database, disease, diseaseIndependent, type } = args;

    if (!dbUrl || !username || !password || !database || !disease || !diseaseIndependent || !type) {
        let answers;
        if (diseaseIndependent && !type) {
            answers = await promptForDetails({ dbUrl, username, password, database, disease });
        } else {
            answers = await promptForDetails({ dbUrl, username, password, database, disease, type });
        }
        dbUrl = answers.dbUrl;
        username = answers.username;
        password = answers.password;
        database = answers.database;
        disease = answers.disease.toUpperCase();
        type = answers.type;
    }
    const diseaseIndependentData = [
        "TE",
        "database",
        "pathway",
        "Druggability"
    ];

    if (diseaseIndependentData.includes(type)) {
        disease = "";
    } else {
        disease = disease.toUpperCase();
    }

    const driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));
    const session = driver.session({ database: database });
    const column = `${disease}${disease === '' ? '' : '_'}${type}_`;
    try {
        const query = `
        CALL db.schema.nodeTypeProperties()
        YIELD propertyName
        WITH [k IN COLLECT(propertyName) WHERE k STARTS WITH '${column}'] AS keys
        CALL apoc.periodic.iterate(
        'MATCH (g:Gene) RETURN g, $keys AS keys',
        'CALL apoc.create.removeProperties(g,keys) YIELD node FINISH',
        { batchSize:1000, parallel:true, params: { keys: keys } })
        YIELD committedOperations
        RETURN keys, committedOperations;
        `;
        
        const result = await session.run(query);
        console.log(chalk.green(`Successfully deleted ${type} data for ${disease || "disease independent"} data`));
        console.log(chalk.green(`Properties deleted: \n${result.records[0].get("keys").join("\n ")}`));
        console.log(chalk.green(`Committed operations: ${result.records[0].get("committedOperations")}`));
        

    } catch (error) {
        console.error(chalk.red(`Error deleting ${type} data`), error);
    } finally {
        await session.close();
        await driver.close();
    }
})();