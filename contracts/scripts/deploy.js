const hre = require("hardhat");

async function main() {
  console.log("Deploying ZK Invoice Platform contracts to", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy KYCVerifier first
  console.log("\n1. Deploying KYCVerifier...");
  const KYCVerifier = await hre.ethers.getContractFactory("KYCVerifier");
  const kycVerifier = await KYCVerifier.deploy();
  await kycVerifier.waitForDeployment();
  const kycVerifierAddress = await kycVerifier.getAddress();
  console.log("KYCVerifier deployed to:", kycVerifierAddress);

  // Deploy ZKKYCRegistry
  console.log("\n2. Deploying ZKKYCRegistry...");
  const ZKKYCRegistry = await hre.ethers.getContractFactory("ZKKYCRegistry");
  const zkKYCRegistry = await ZKKYCRegistry.deploy();
  await zkKYCRegistry.waitForDeployment();
  const zkKYCRegistryAddress = await zkKYCRegistry.getAddress();
  console.log("ZKKYCRegistry deployed to:", zkKYCRegistryAddress);

  // Deploy InvoiceManager
  console.log("\n3. Deploying InvoiceManager...");
  const InvoiceManager = await hre.ethers.getContractFactory("InvoiceManager");
  const invoiceManager = await InvoiceManager.deploy();
  await invoiceManager.waitForDeployment();
  const invoiceManagerAddress = await invoiceManager.getAddress();
  console.log("InvoiceManager deployed to:", invoiceManagerAddress);

  // Output deployment summary
  console.log("\n========================================");
  console.log("Deployment Summary:");
  console.log("========================================");
  console.log("Network:", hre.network.name);
  console.log("KYCVerifier:", kycVerifierAddress);
  console.log("ZKKYCRegistry:", zkKYCRegistryAddress);
  console.log("InvoiceManager:", invoiceManagerAddress);
  console.log("========================================");

  // Save deployment addresses
  const fs = require("fs");
  const deployments = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      KYCVerifier: kycVerifierAddress,
      ZKKYCRegistry: zkKYCRegistryAddress,
      InvoiceManager: invoiceManagerAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deployments, null, 2)
  );
  console.log(`\nDeployment info saved to ${deploymentsDir}/${hre.network.name}.json`);

  // Verify contracts if on a live network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("\nVerifying contracts on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: kycVerifierAddress,
        constructorArguments: [],
      });
      console.log("KYCVerifier verified!");
    } catch (error) {
      console.log("KYCVerifier verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: zkKYCRegistryAddress,
        constructorArguments: [],
      });
      console.log("ZKKYCRegistry verified!");
    } catch (error) {
      console.log("ZKKYCRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: invoiceManagerAddress,
        constructorArguments: [],
      });
      console.log("InvoiceManager verified!");
    } catch (error) {
      console.log("InvoiceManager verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

