const neo4j = require("neo4j-driver");

async function seedData() {
  // Connection configuration
  const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "password")
  );

  // Change the database name if required
  const session = driver.session({
    database: "pdnet",
  });
  // Create uniqueness constraint on the name property of Gene nodes
  await session.run(`
      CREATE CONSTRAINT IF NOT EXISTS FOR (g:Gene)
      REQUIRE g.ID IS UNIQUE
    `);

  console.log("Created uniqueness constraint on Gene nodes");

  // Load data from the CSV file which is located in the import directory of neo4j database
  const filePath = "9606.protein.links.v12.0-converted.csv";
  const query = `
    LOAD CSV FROM 'file:///${filePath}' AS line
    CALL {
      WITH line
      MERGE (g1:Gene {ID: line[0]})
      MERGE (g2:Gene {ID: line[1]})
      MERGE (g1)-[r:GENE_GENE_CONNECTION]->(g2)
      ON CREATE SET r.score = toFloat(line[2])
    } IN TRANSACTIONS OF 10000 ROWS;
  `;
  // An extra node was mistakenly created in the previous query which contains the header name.
  // This query will delete that node.
  const deleteQuery = `MATCH (g:Gene) WHERE g.ID = 'node1' OR g.ID = 'node2' DETACH DELETE g`;
  try {
    const result = await session.run(query);
    console.log("Data loaded using LOAD CSV:", result.summary.counters);
    await session.run(deleteQuery);
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
  }
}

seedData().catch((error) => {
  console.error(error);
  process.exit(1);
});