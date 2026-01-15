const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ZKInvoice", (m) => {
  // Deploy KYCVerifier
  const kycVerifier = m.contract("KYCVerifier");

  // Deploy ZKKYCRegistry
  const zkKYCRegistry = m.contract("ZKKYCRegistry");

  // Deploy InvoiceManager
  const invoiceManager = m.contract("InvoiceManager");

  return { kycVerifier, zkKYCRegistry, invoiceManager };
});

