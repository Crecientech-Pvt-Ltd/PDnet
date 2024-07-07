const neo4j = require("neo4j-driver");

async function seedData() {
  const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "AIDNITRA#P98")
  );

  const session = driver.session({
    database: "pdnet",
    defaultAccessMode: neo4j.session.WRITE,
  });

  const filePath = "universal_new_json.csv"; // Replace with your actual CSV file path

  /**
   * The query below loads the CSV file and creates a new node for each row.
   * The properties name need to be changed to follow the naming convention of the GraphQL APIs.
   */
  const query = `
    LOAD CSV WITH HEADERS FROM 'file:///${filePath}' AS row
    MERGE (g:Gene { ID: row.ID })
    SET
      g.\`database_Mendelian_GenCC_ALS\` = toInteger(row.\`database_Mendelian_GenCC_ALS\`),
      g.\`GDA_Score_opentargets_overall_association_score\` = toFloat(row.\`GDA_Score_opentargets_overall_association_score\`),
      g.\`GDA_Score_opentargets_eva\` = toFloat(row.\`GDA_Score_opentargets_eva\`),
      g.\`GDA_Score_opentargets_genomics_england\` = toFloat(row.\`GDA_Score_opentargets_genomics_england\`),
      g.\`GDA_Score_opentargets_uniprot_literature\` = toFloat(row.\`GDA_Score_opentargets_uniprot_literature\`),  
      g.\`GDA_Score_opentargets_orphanet\` = toFloat(row.\`GDA_Score_opentargets_uniprot_literature\`),
      g.\`GDA_Score_opentargets_europepmc\` = toFloat(row.\`GDA_Score_opentargets_europepmc\`),
      g.\`GDA_Score_opentargets_impc\` = toFloat(row.\`GDA_Score_opentargets_europepmc\`),
      g.\`GDA_Score_opentargets_literature\` = toFloat(row.\`GDA_Score_opentargets_literature\`),
      g.\`GDA_Score_opentargets_animal_model\` = toFloat(row.\`GDA_Score_opentargets_literature\`),
      g.\`GDA_Score_opentargets_genetic_association\` = toFloat(row.\`GDA_Score_opentargets_literature\`),
      g.\`GDA_Score_MantisML_HPO\` = toFloat(row.\`GDA_Score_MantisML_HPO\`),
      g.\`GDA_Score_MantisML_OT\` = toFloat(row.\`GDA_Score_MantisML_OT\`),
      g.\`Druggability_Score_drugnome_small molecule\` = toFloat(row.\`Druggability_Score_drugnome_small molecule\`),
      g.\`Druggability_Score_drugnome_antibody\` = toFloat(row.\`Druggability_Score_drugnome_antibody\`),
      g.\`Druggability_Score_drugnome_protac\` = toFloat(row.\`Druggability_Score_drugnome_protac\`),
      g.\`Druggability_Score_drugnome_tclin\` = toFloat(row.\`Druggability_Score_drugnome_tclin\`),
      g.\`Druggability_Score_drugnome_tier 1\` = toFloat(row.\`Druggability_Score_drugnome_tier 1\`),
      g.\`Druggability_Score_drugnome_tclin & tier 1\` = toFloat(row.\`Druggability_Score_drugnome_tclin & tier 1\`),
      g.\`Druggability_Score_drugnome_tclin & tchem\` = toFloat(row.\`Druggability_Score_drugnome_tclin & tchem\`),
      g.\`Druggability_Score_drugnome_tchem\` = toFloat(row.\`Druggability_Score_drugnome_tchem\`),
      g.\`Druggability_Score_drugnome_tier 1 & 2\` = toFloat(row.\`Druggability_Score_drugnome_tier 1 & 2\`),
      g.\`Druggability_Score_drugnome_tier 1 & 2 & 3a\` = toFloat(row.\`Druggability_Score_drugnome_tier 1 & 2 & 3a\`),
      g.\`pathway_AMPK signaling pathway\` = toFloat(row.\`pathway_AMPK signaling pathway\`), 
      g.\`pathway_OXO-mediated transcription (R-HSA-9614085)\` = toFloat(row.\`pathway_OXO-mediated transcription (R-HSA-9614085)\`),
      g.\`pathway_MAPK signaling pathway\` = toFloat(row.\`pathway_MAPK signaling pathway\`),
      g.\`pathway_p38 MAPK signaling pathway (R-HSA-450302)\` = toFloat(row.\`pathway_p38 MAPK signaling pathway (R-HSA-450302)\`),
      g.\`pathway_p130Cas linkage to MAPK signaling for integrins\` = toFloat(row.\`pathway_p130Cas linkage to MAPK signaling for integrins\`),
      g.\`pathway_Macroautophagy\` = toFloat(row.\`pathway_Macroautophagy\`),
      g.\`pathway_Chaperone Mediated Autophagy\` = toFloat(row.\`pathway_Chaperone Mediated Autophagy\`),
      g.\`pathway_Endocytosis\` = toFloat(row.\`pathway_Endocytosis\`),
      g.\`pathway_Synaptic vesicle cycle\` = toFloat(row.\`pathway_Synaptic vesicle cycle\`),
      g.\`pathway_Vesicle-mediated transport\` = toFloat(row.\`pathway_Vesicle-mediated transport\`),
      g.\`pathway_Chaperone Mediated Autophagy.1\` = toFloat(row.\`pathway_Chaperone Mediated Autophagy.1\`),
      g.\`pathway_Proteasome\` = toFloat(row.\`pathway_Proteasome\`),
      g.\`pathway_Proteasome Degradation (R-HSA-983168)\` = toFloat(row.\`pathway_Proteasome Degradation (R-HSA-983168)\`),
      g.\`pathway_Ubiquitin mediated proteolysis\` = toFloat(row.\`pathway_Ubiquitin mediated proteolysis\`),
      g.\`pathway_Cellular response to hypoxia\` = toFloat(row.\`pathway_Cellular response to hypoxia\`),
      g.\`pathway_Longevity regulating pathway - Homo sapiens (human)\` = toFloat(row.\`pathway_Longevity regulating pathway - Homo sapiens (human)\`),
      g.\`pathway_Lysosome - Homo sapiens (human)\` = toFloat(row.\`pathway_Lysosome - Homo sapiens (human)\`),
      g.\`pathway_Lysosome Vesicle Biogenesis\` = toFloat(row.\`pathway_Lysosome Vesicle Biogenesis\`),
      g.\`pathway_Mitophagy - animal - Homo sapiens (human)\` = toFloat(row.\`pathway_Mitophagy - animal - Homo sapiens (human)\`),
      g.\`pathway_Ribosome - Homo sapiens (human)\` = toFloat(row.\`pathway_Ribosome - Homo sapiens (human)\`),
      g.\`pathway_Oxidative Stress Induced Senescence\` = toFloat(row.\`pathway_Oxidative Stress Induced Senescence\`),
      g.\`pathway_Protein processing in endoplasmic reticulum - Homo sapiens\` = toFloat(row.\`pathway_Protein processing in endoplasmic reticulum - Homo sapiens\`),
      g.\`pathway_Unfolded Protein Response (UPR) R-HSA-381119\` = toFloat(row.\`pathway_Unfolded Protein Response (UPR) R-HSA-381119\`),
      g.\`pathway_Ubiquitination And Proteasome Degradation R-HSA-983168\` = toFloat(row.\`pathway_Ubiquitination And Proteasome Degradation R-HSA-983168\`),
      g.\`pathway_Autodegradation Of E3 Ubiquitin Ligase COP1 R-HSA-349425\` = toFloat(row.\`pathway_Autodegradation Of E3 Ubiquitin Ligase COP1 R-HSA-349425\`),
      g.\`pathway_E3 Ubiquitin Ligases Ubiquitinate Target Proteins R-HSA-8866654\` = toFloat(row.\`pathway_E3 Ubiquitin Ligases Ubiquitinate Target Proteins R-HSA-8866654\`),
      g.\`pathway_Protein Ubiquitination R-HSA-8852135\` = toFloat(row.\`pathway_Protein Ubiquitination R-HSA-8852135\`),
      g.\`pathway_Regulation Of FZD By Ubiquitination R-HSA-4641263\` = toFloat(row.\`pathway_Regulation Of FZD By Ubiquitination R-HSA-4641263\`),
      g.\`pathway_SUMOylation Of Ubiquitinylation Proteins R-HSA-3232142\` = toFloat(row.\`pathway_SUMOylation Of Ubiquitinylation Proteins R-HSA-3232142\`),
      g.\`pathway_Synthesis Of Active Ubiquitin: Roles Of E1 And E2 Enzymes R-HSA-8866652\` = toFloat(row.\`pathway_Synthesis Of Active Ubiquitin: Roles Of E1 And E2 Enzymes R-HSA-8866652\`),
      g.\`pathway_Ubiquitin Mediated Degradation Of Phosphorylated Cdc25A R-HSA-69601\` = toFloat(row.\`pathway_Ubiquitin Mediated Degradation Of Phosphorylated Cdc25A R-HSA-69601\`),
      g.\`pathway_Ubiquitin-dependent Degradation Of Cyclin D R-HSA-75815\` = toFloat(row.\`pathway_Ubiquitin-dependent Degradation Of Cyclin D R-HSA-75815\`),
      g.\`pathway_Chaperone Mediated Autophagy R-HSA-9613829\` = toFloat(row.\`pathway_Chaperone Mediated Autophagy R-HSA-9613829\`),
      g.\`pathway_Chaperonin-mediated Protein Folding R-HSA-390466\` = toFloat(row.\`pathway_Chaperonin-mediated Protein Folding R-HSA-390466\`),
      g.\`pathway_IRE1alpha Activates Chaperones R-HSA-381070\` = toFloat(row.\`pathway_IRE1alpha Activates Chaperones R-HSA-381070\`),
      g.\`pathway_XBP1(S) Activates Chaperone Genes R-HSA-381038\` = toFloat(row.\`pathway_XBP1(S) Activates Chaperone Genes R-HSA-381038\`),
      g = row
    ;
  `;

  try {
    const result = await session.run(query);
    console.log("Data loaded using LOAD CSV:", result.summary.counters);
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
  }
}

seedData()
  .then(() => {
    console.log("Data seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
