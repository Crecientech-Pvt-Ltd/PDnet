const fs = require("fs");
const readline = require("readline");

// Create a readable stream to read the input file line by line
const fileStream = fs.createReadStream("9606.protein.links.v12.0.txt");

// Create a readline interface
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

// Array to store protein data
let proteinData = [];
rl.on("line", async (line) => {
  const [protein1, protein2, combinedScore] = line.trim().split(" ");
  const score = parseInt(combinedScore);

  proteinData.push({ protein1, protein2, score }); // Store protein data
});

// When all lines have been processed, calculate new combined score
rl.on("close", () => {
  console.log("All lines have been read!");
  const totalRecords = proteinData.length;

  // Max score calc (calculated)
  let maxScore = 999;
  const cumulativeCounts = Array.from({ length: maxScore + 1 }, () => 0);
  console.log(cumulativeCounts.length);
  proteinData.forEach(({ score }) => cumulativeCounts[score]++);
  for (let i = 1; i < cumulativeCounts.length; i++) {
    cumulativeCounts[i] += cumulativeCounts[i - 1];
  }
  console.log("Cumulative counts have been calculated!");
  // Calculate new combined scores
  const newCombinedScores = proteinData.map(
    ({ score }) => cumulativeCounts[score] / totalRecords
  );

  console.log("New combined scores have been calculated!");
  const outputStream = fs.createWriteStream(
    "9606.protein.links.v12.0-normalized.csv"
  );

  outputStream.write("protein1,protein2,combined_score,new_combined_score\n");

  // Write the protein data and new combined scores to the output CSV file
  for (let i = 0; i < proteinData.length; i++) {
    outputStream.write(
      `${proteinData[i].protein1},${proteinData[i].protein2},${proteinData[i].score},${newCombinedScores[i]}\n`
    );
  }

  outputStream.end();
  console.log("CSV file has been created successfully!");
});
