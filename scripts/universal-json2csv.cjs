const fs = require('fs');
const { Parser } = require('json2csv');
const jsonData = require('./universal_new_merged.json');

// Read JSON data from file
// const jsonFile = 'universal_new_merged.json';
// const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Transform the JSON data to a format suitable for CSV
const transformData = (data) => {
  return data.map(entry => {
    const transformedEntry = { };
    // const transformedEntry = { geneId: entry.geneId };
    entry.row.forEach(item => {
      transformedEntry[item.name] = item.value;
    });
    return transformedEntry;
  });
};

const transformedData = transformData(jsonData);

const fields = transformedData[0] ? Object.keys(transformedData[0]) : [];

// Convert JSON to CSV
const json2csvParser = new Parser({ fields });
const csv = json2csvParser.parse(transformedData);

// Write CSV to file
const csvFile = 'universal_new_merged2.csv';
fs.writeFileSync(csvFile, csv);

console.log(`CSV file has been written to ${csvFile}`);
