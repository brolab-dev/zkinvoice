const hre = require("hardhat");

async function main() {
  const ZK_KYC_REGISTRY = "0x66945d47d4f2b582E6dEc601d4f7E3ebd50d7230";
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  const zkKYC = await hre.ethers.getContractAt("ZKKYCRegistry", ZK_KYC_REGISTRY);
  
  // Check current KYC status
  console.log("\n--- Checking KYC Status ---");
  const status = await zkKYC.getKYCStatus(signer.address);
  console.log("Current KYC Status:", status);
  
  // Check if we're a verifier
  const isVerifier = await zkKYC.verifiers(signer.address);
  console.log("Is verifier:", isVerifier);
  
  // Check owner
  const owner = await zkKYC.owner();
  console.log("Contract owner:", owner);
  console.log("Are we owner:", owner.toLowerCase() === signer.address.toLowerCase());
  
  // Submit KYC
  console.log("\n--- Submitting KYC ---");
  const commitment = "0x0000000000000000000000000000000000000000000000000000000000001234";
  const ipfsHash = "QmTestKYCHash";
  
  try {
    const tx = await zkKYC.submitKYC(commitment, ipfsHash);
    console.log("Submit TX hash:", tx.hash);
    await tx.wait();
    console.log("Submit TX confirmed!");
    
    // Check status again
    const statusAfter = await zkKYC.getKYCStatus(signer.address);
    console.log("KYC Status after submit:", statusAfter);
    
    // Verify KYC
    console.log("\n--- Verifying KYC ---");
    const demoProof = [
      "12345678901234567890",
      "12345678901234567890", 
      "12345678901234567890",
      "12345678901234567890",
      "12345678901234567890",
      "12345678901234567890",
      "12345678901234567890",
      "12345678901234567890",
    ];
    const publicInputs = ["1"];
    const level = 1; // Basic
    const validityPeriod = 365 * 24 * 60 * 60; // 1 year
    
    const verifyTx = await zkKYC.verifyKYC(signer.address, demoProof, publicInputs, level, validityPeriod);
    console.log("Verify TX hash:", verifyTx.hash);
    await verifyTx.wait();
    console.log("Verify TX confirmed!");
    
    // Final status
    const finalStatus = await zkKYC.getKYCStatus(signer.address);
    console.log("Final KYC Status:", finalStatus);
    
    const isValid = await zkKYC.isKYCValid(signer.address);
    console.log("Is KYC Valid:", isValid);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

