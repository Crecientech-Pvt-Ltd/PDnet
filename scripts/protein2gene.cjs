const fs = require("fs");
const csv = require("csv-parser");

const proteinToGeneMap = new Map();
fs.createReadStream("human_genes_GRCh38_curated.csv")
  .pipe(csv())
  .on("data", (data) => {
    proteinToGeneMap.set(data["Protein.stable.ID"],data["Gene.stable.ID"]);
  })
  .on("end", () => {
    console.log("Map created successfully.");
    console.log(`Map size: ${proteinToGeneMap.size}`);
    const outputFile = "9606.protein.links.v12.0-converted-2.0.csv";
    const errFile = 'err.csv';

    const writer = fs.createWriteStream(outputFile);
    const errWriter = fs.createWriteStream(errFile);

    writer.write("node1,node2,weight\n");
    errWriter.write("protein1,gene1,protein2,gene2\n");
    
    console.log("Updating CSV2...");

    let errCount  = 0;
    fs.createReadStream("9606.protein.links.v12.0-normalized.csv")
      .pipe(csv())
      .on("data", (data) => {
        const protein1 = data["protein1"].split(".").pop();
        const protein2 = data["protein2"].split(".").pop();
        const weight = data["new_combined_score"];
        const gene1 = proteinToGeneMap.get(protein1);
        const gene2 = proteinToGeneMap.get(protein2);
        if (gene1 && gene2) {
          writer.write(`${gene1},${gene2},${weight}\n`);
        } else {
          errCount++;
          errWriter.write(`${protein1},${gene1},${protein2},${gene2}\n`);
        }
      })
      .on("end", () => {
        console.log("CSV2 updated successfully.");
        console.log("Output file: " + outputFile);
        console.log("Error file: " + errFile);
        console.log("Error count: " + errCount);
      });
  });
