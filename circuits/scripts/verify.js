const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function verifyProof() {
  const vkeyPath = path.join(__dirname, "../build/verification_key.json");
  const proofPath = path.join(__dirname, "../build/proof.json");
  const publicPath = path.join(__dirname, "../build/public.json");

  const vkey = JSON.parse(fs.readFileSync(vkeyPath));
  const proof = JSON.parse(fs.readFileSync(proofPath));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath));

  console.log("Verifying proof...");
  const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  if (isValid) {
    console.log("✅ Proof is valid!");
  } else {
    console.log("❌ Proof is invalid!");
  }

  return isValid;
}

if (require.main === module) {
  verifyProof();
}

module.exports = { verifyProof };

