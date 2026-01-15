const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function generateProof(input) {
  const wasmPath = path.join(__dirname, "../build/kyc_js/kyc.wasm");
  const zkeyPath = path.join(__dirname, "../build/kyc_final.zkey");

  console.log("Generating proof...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );

  console.log("Proof generated!");
  console.log("Public signals:", publicSignals);

  // Format proof for Solidity
  const solidityProof = [
    proof.pi_a[0],
    proof.pi_a[1],
    proof.pi_b[0][1],
    proof.pi_b[0][0],
    proof.pi_b[1][1],
    proof.pi_b[1][0],
    proof.pi_c[0],
    proof.pi_c[1],
  ];

  return { proof, publicSignals, solidityProof };
}

async function main() {
  // Example input for testing
  const input = {
    // Private inputs
    firstName: BigInt("123456789"), // Hashed first name
    lastName: BigInt("987654321"), // Hashed last name
    dateOfBirth: BigInt(Math.floor(Date.now() / 1000) - 25 * 365.25 * 24 * 60 * 60), // 25 years ago
    countryCode: BigInt(1), // US
    documentNumber: BigInt("111222333444"),
    salt: BigInt("0x" + require("crypto").randomBytes(16).toString("hex")),
    
    // Public inputs
    identityCommitment: BigInt(0), // Will be computed
    currentTimestamp: BigInt(Math.floor(Date.now() / 1000)),
    minimumAge: BigInt(18),
  };

  try {
    const result = await generateProof(input);
    
    // Save proof to file
    fs.writeFileSync(
      path.join(__dirname, "../build/proof.json"),
      JSON.stringify(result.proof, null, 2)
    );
    
    fs.writeFileSync(
      path.join(__dirname, "../build/public.json"),
      JSON.stringify(result.publicSignals, null, 2)
    );
    
    console.log("Proof saved to build/proof.json");
    console.log("Public signals saved to build/public.json");
    console.log("\nSolidity calldata:");
    console.log(result.solidityProof);
  } catch (error) {
    console.error("Error generating proof:", error);
  }
}

module.exports = { generateProof };

if (require.main === module) {
  main();
}

