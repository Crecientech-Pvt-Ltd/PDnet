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

  const filePath = "universal_new_merged.csv"; // Replace with your actual CSV file path

  /**
   * The query below loads the CSV file and creates a new node for each row.
   * The properties name need to be changed to follow the naming convention of the GraphQL APIs.
   */
  const query = `
    LOAD CSV WITH HEADERS FROM 'file:///${filePath}' AS row
    MERGE (g:Gene { ID: row.ID })
    SET
      g.\`Druggability_Score_drugnome_small_molecule\` = row.\`Druggability_Score_drugnome_small molecule\`,
      g.\`Druggability_Score_drugnome_tier_1\` = row.\`Druggability_Score_drugnome_tier 1\`,
      g.\`Druggability_Score_drugnome_tclin_and_tier_1\` = row.\`Druggability_Score_drugnome_tclin & tier 1\`,
      g.\`Druggability_Score_drugnome_tclin_and_tchem\` = row.\`Druggability_Score_drugnome_tclin & tchem\`,
      g.\`Druggability_Score_drugnome_tier_1_and_2\` = row.\`Druggability_Score_drugnome_tier 1 & 2\`,
      g.\`Druggability_Score_drugnome_tier_1_and_2_and_3a\` = row.\`Druggability_Score_drugnome_tier 1 & 2 & 3a\`,
      g.\`pathway_AMPK_signaling_pathway\` = row.\`pathway_AMPK signaling pathway\`,
      g.\`pathway_OXO_mediated_transcription_R_HSA_9614085\` = row.\`pathway_OXO-mediated transcription (R-HSA-9614085)\`,
      g.\`pathway_MAPK_signaling_pathway\` = row.\`pathway_MAPK signaling pathway\`,
      g.\`pathway_p38_MAPK_signaling_pathway_R_HSA_450302\` = row.\`pathway_p38 MAPK signaling pathway (R-HSA-450302)\`,
      g.\`pathway_p130Cas_linkage_to_MAPK_signaling_for_integrins\` = row.\`pathway_p130Cas linkage to MAPK signaling for integrins\`,
      g.\`pathway_Chaperone_Mediated_Autophagy\` = row.\`pathway_Chaperone Mediated Autophagy\`,
      g.\`pathway_Synaptic_vesicle_cycle\` = row.\`pathway_Synaptic vesicle cycle\`,
      g.\`pathway_Vesicle_mediated_transport\` = row.\`pathway_Vesicle-mediated transport\`,
      g.\`pathway_Chaperone_Mediated_Autophagy_1\` = row.\`pathway_Chaperone Mediated Autophagy.1\`,
      g.\`pathway_Proteasome_Degradation_R_HSA_983168\` = row.\`pathway_Proteasome Degradation (R-HSA-983168)\`,
      g.\`pathway_Ubiquitin_mediated_proteolysis\` = row.\`pathway_Ubiquitin mediated proteolysis\`,
      g.\`pathway_Cellular_response_to_hypoxia\` = row.\`pathway_Cellular response to hypoxia\`,
      g.\`pathway_Longevity_regulating_pathway___Homo_sapiens_human\` = row.\`pathway_Longevity regulating pathway - Homo sapiens (human)\`,
      g.\`pathway_Lysosome___Homo_sapiens_human\` = row.\`pathway_Lysosome - Homo sapiens (human)\`,
      g.\`pathway_Lysosome_Vesicle_Biogenesis\` = row.\`pathway_Lysosome Vesicle Biogenesis\`,
      g.\`pathway_Mitophagy___animal___Homo_sapiens_human\` = row.\`pathway_Mitophagy - animal - Homo sapiens (human)\`,
      g.\`pathway_Ribosome___Homo_sapiens_human\` = row.\`pathway_Ribosome - Homo sapiens (human)\`,
      g.\`pathway_Oxidative_Stress_Induced_Senescence\` = row.\`pathway_Oxidative Stress Induced Senescence\`,
      g.\`pathway_Protein_processing_in_endoplasmic_reticulum___Homo_sapiens\` = row.\`pathway_Protein processing in endoplasmic reticulum - Homo sapiens\`,
      g.\`pathway_Unfolded_Protein_Response_UPR_R_HSA_381119\` = row.\`pathway_Unfolded Protein Response (UPR) R-HSA-381119\`,
      g.\`pathway_Ubiquitination_And_Proteasome_Degradation_R_HSA_983168\` = row.\`pathway_Ubiquitination And Proteasome Degradation R-HSA-983168\`,
      g.\`pathway_Autodegradation_Of_E3_Ubiquitin_Ligase_COP1_R_HSA_349425\` = row.\`pathway_Autodegradation Of E3 Ubiquitin Ligase COP1 R-HSA-349425\`,
      g.\`pathway_E3_Ubiquitin_Ligases_Ubiquitinate_Target_Proteins_R_HSA_8866654\` = row.\`pathway_E3 Ubiquitin Ligases Ubiquitinate Target Proteins R-HSA-8866654\`,
      g.\`pathway_Protein_Ubiquitination_R_HSA_8852135\` = row.\`pathway_Protein Ubiquitination R-HSA-8852135\`,
      g.\`pathway_Regulation_Of_FZD_By_Ubiquitination_R_HSA_4641263\` = row.\`pathway_Regulation Of FZD By Ubiquitination R-HSA-4641263\`,
      g.\`pathway_SUMOylation_Of_Ubiquitinylation_Proteins_R_HSA_3232142\` = row.\`pathway_SUMOylation Of Ubiquitinylation Proteins R-HSA-3232142\`,
      g.\`pathway_Synthesis_Of_Active_Ubiquitin_Roles_Of_E1_And_E2_Enzymes_R_HSA_8866652\` = row.\`pathway_Synthesis Of Active Ubiquitin: Roles Of E1 And E2 Enzymes R-HSA-8866652\`,
      g.\`pathway_Ubiquitin_Mediated_Degradation_Of_Phosphorylated_Cdc25A_R_HSA_69601\` = row.\`pathway_Ubiquitin Mediated Degradation Of Phosphorylated Cdc25A R-HSA-69601\`,
      g.\`pathway_Ubiquitin_dependent_Degradation_Of_Cyclin_D_R_HSA_75815\` = row.\`pathway_Ubiquitin-dependent Degradation Of Cyclin D R-HSA-75815\`,
      g.\`pathway_Chaperone_Mediated_Autophagy_R_HSA_96138299\` = row.\`pathway_Chaperone Mediated Autophagy R-HSA-9613829\`,
      g.\`pathway_Chaperonin_mediated_Protein_Folding_R_HSA_390466\` = row.\`pathway_Chaperonin-mediated Protein Folding R-HSA-390466\`,
      g.\`pathway_IRE1alpha_Activates_Chaperones_R_HSA_381070\` = row.\`pathway_IRE1alpha Activates Chaperones R-HSA-381070\`,
      g.\`pathway_XBP1S_Activates_Chaperone_Genes_R_HSA_381038\` = row.\`pathway_XBP1(S) Activates Chaperone Genes R-HSA-381038\`,
      g = row
    ;
  `;

  try {
    const result = await session.run(query);
    console.log("Data loaded using LOAD CSV:", result.summary.counters);
    const constraintQuery = `CREATE INDEX Gene_name FOR (g:Gene) ON (g.Gene_name)`;
    await session.run(constraintQuery);
    console.log("Index created:");
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
