const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("InvoiceManager", function () {
  let invoiceManager;
  let owner, creator, payer, feeCollector;
  
  const INVOICE_AMOUNT = ethers.parseEther("1.0");
  const DESCRIPTION = "Test Invoice";
  const IPFS_HASH = "QmTestHash123";

  beforeEach(async function () {
    [owner, creator, payer, feeCollector] = await ethers.getSigners();
    
    const InvoiceManager = await ethers.getContractFactory("InvoiceManager");
    invoiceManager = await InvoiceManager.deploy();
    await invoiceManager.waitForDeployment();
  });

  describe("Invoice Creation", function () {
    it("Should create an invoice successfully", async function () {
      const dueDate = (await time.latest()) + 86400 * 7; // 7 days from now
      
      await expect(
        invoiceManager.connect(creator).createInvoice(
          payer.address,
          INVOICE_AMOUNT,
          DESCRIPTION,
          IPFS_HASH,
          dueDate,
          false
        )
      ).to.emit(invoiceManager, "InvoiceCreated");
      
      const invoice = await invoiceManager.getInvoice(1);
      expect(invoice.creator).to.equal(creator.address);
      expect(invoice.payer).to.equal(payer.address);
      expect(invoice.amount).to.equal(INVOICE_AMOUNT);
      expect(invoice.description).to.equal(DESCRIPTION);
      expect(invoice.status).to.equal(0); // Created
    });

    it("Should fail with zero amount", async function () {
      const dueDate = (await time.latest()) + 86400;
      
      await expect(
        invoiceManager.connect(creator).createInvoice(
          payer.address,
          0,
          DESCRIPTION,
          IPFS_HASH,
          dueDate,
          false
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should fail with past due date", async function () {
      const pastDueDate = (await time.latest()) - 86400;
      
      await expect(
        invoiceManager.connect(creator).createInvoice(
          payer.address,
          INVOICE_AMOUNT,
          DESCRIPTION,
          IPFS_HASH,
          pastDueDate,
          false
        )
      ).to.be.revertedWith("Due date must be in the future");
    });
  });

  describe("Invoice Payment", function () {
    let invoiceId;
    let dueDate;

    beforeEach(async function () {
      dueDate = (await time.latest()) + 86400 * 7;
      await invoiceManager.connect(creator).createInvoice(
        payer.address,
        INVOICE_AMOUNT,
        DESCRIPTION,
        IPFS_HASH,
        dueDate,
        false
      );
      invoiceId = 1;
    });

    it("Should pay an invoice successfully", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      
      await expect(
        invoiceManager.connect(payer).payInvoice(invoiceId, { value: INVOICE_AMOUNT })
      ).to.emit(invoiceManager, "InvoicePaid");
      
      const invoice = await invoiceManager.getInvoice(invoiceId);
      expect(invoice.status).to.equal(2); // Paid
      
      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      // Creator should receive amount minus 0.5% fee
      const expectedPayment = INVOICE_AMOUNT - (INVOICE_AMOUNT * 50n / 10000n);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(expectedPayment);
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientAmount = ethers.parseEther("0.5");
      
      await expect(
        invoiceManager.connect(payer).payInvoice(invoiceId, { value: insufficientAmount })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Invoice Cancellation", function () {
    let invoiceId;

    beforeEach(async function () {
      const dueDate = (await time.latest()) + 86400 * 7;
      await invoiceManager.connect(creator).createInvoice(
        payer.address,
        INVOICE_AMOUNT,
        DESCRIPTION,
        IPFS_HASH,
        dueDate,
        false
      );
      invoiceId = 1;
    });

    it("Should cancel an invoice", async function () {
      await expect(
        invoiceManager.connect(creator).cancelInvoice(invoiceId)
      ).to.emit(invoiceManager, "InvoiceCancelled");
      
      const invoice = await invoiceManager.getInvoice(invoiceId);
      expect(invoice.status).to.equal(3); // Cancelled
    });

    it("Should fail when non-creator tries to cancel", async function () {
      await expect(
        invoiceManager.connect(payer).cancelInvoice(invoiceId)
      ).to.be.revertedWith("Only creator can cancel");
    });
  });

  describe("User Invoice Tracking", function () {
    it("Should track user created invoices", async function () {
      const dueDate = (await time.latest()) + 86400 * 7;
      
      await invoiceManager.connect(creator).createInvoice(payer.address, INVOICE_AMOUNT, "Invoice 1", IPFS_HASH, dueDate, false);
      await invoiceManager.connect(creator).createInvoice(payer.address, INVOICE_AMOUNT, "Invoice 2", IPFS_HASH, dueDate, false);
      
      const createdInvoices = await invoiceManager.getUserCreatedInvoices(creator.address);
      expect(createdInvoices.length).to.equal(2);
      expect(createdInvoices[0]).to.equal(1);
      expect(createdInvoices[1]).to.equal(2);
    });

    it("Should track user received invoices", async function () {
      const dueDate = (await time.latest()) + 86400 * 7;
      
      await invoiceManager.connect(creator).createInvoice(payer.address, INVOICE_AMOUNT, "Invoice 1", IPFS_HASH, dueDate, false);
      
      const receivedInvoices = await invoiceManager.getUserReceivedInvoices(payer.address);
      expect(receivedInvoices.length).to.equal(1);
    });
  });
});

