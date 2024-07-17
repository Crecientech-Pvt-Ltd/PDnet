// Write code to convert gyan.csv to gyan.json format
const csv = require("csvtojson");
const fs = require("fs");

const fileName = "FILENAME";
const fileNameWithoutExtension = fileName.split(".")?.[0];

csv()
  .fromFile(`${fileNameWithoutExtension}.csv`)
  .then((jsonObj) => {
    fs.writeFileSync(
      `${fileNameWithoutExtension}.json`,
      JSON.stringify(jsonObj, null, 2)
    );
    console.log("File converted successfully");
  });
