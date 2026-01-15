// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InvoiceManager
 * @dev Manages invoice creation, payment, and tracking
 */
contract InvoiceManager is Ownable, ReentrancyGuard {
    enum InvoiceStatus { Created, Sent, Paid, Cancelled, Overdue }

    struct Invoice {
        uint256 id;
        address creator;
        address payer;
        uint256 amount;
        string description;
        string ipfsHash; // Encrypted invoice details stored on IPFS
        uint256 dueDate;
        uint256 createdAt;
        uint256 paidAt;
        InvoiceStatus status;
        bool kycRequired;
    }

    uint256 public invoiceCounter;
    uint256 public platformFee = 50; // 0.5% fee (basis points)
    address public feeCollector;
    
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public userCreatedInvoices;
    mapping(address => uint256[]) public userReceivedInvoices;

    event InvoiceCreated(uint256 indexed id, address indexed creator, address indexed payer, uint256 amount);
    event InvoiceSent(uint256 indexed id, address indexed payer);
    event InvoicePaid(uint256 indexed id, address indexed payer, uint256 amount, uint256 fee);
    event InvoiceCancelled(uint256 indexed id);
    event InvoiceUpdated(uint256 indexed id);
    event PlatformFeeUpdated(uint256 newFee);

    constructor() Ownable(msg.sender) {
        feeCollector = msg.sender;
    }

    function createInvoice(
        address _payer,
        uint256 _amount,
        string calldata _description,
        string calldata _ipfsHash,
        uint256 _dueDate,
        bool _kycRequired
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_payer != address(0), "Invalid payer address");
        require(_dueDate > block.timestamp, "Due date must be in the future");

        invoiceCounter++;
        
        invoices[invoiceCounter] = Invoice({
            id: invoiceCounter,
            creator: msg.sender,
            payer: _payer,
            amount: _amount,
            description: _description,
            ipfsHash: _ipfsHash,
            dueDate: _dueDate,
            createdAt: block.timestamp,
            paidAt: 0,
            status: InvoiceStatus.Created,
            kycRequired: _kycRequired
        });

        userCreatedInvoices[msg.sender].push(invoiceCounter);
        userReceivedInvoices[_payer].push(invoiceCounter);

        emit InvoiceCreated(invoiceCounter, msg.sender, _payer, _amount);
        return invoiceCounter;
    }

    function sendInvoice(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.creator == msg.sender, "Only creator can send");
        require(invoice.status == InvoiceStatus.Created, "Invalid status");

        invoice.status = InvoiceStatus.Sent;
        emit InvoiceSent(_invoiceId, invoice.payer);
    }

    function payInvoice(uint256 _invoiceId) external payable nonReentrant {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == InvoiceStatus.Sent || invoice.status == InvoiceStatus.Created, "Invoice not payable");
        require(msg.value >= invoice.amount, "Insufficient payment");
        require(invoice.payer == msg.sender || invoice.payer == address(0), "Not authorized");

        uint256 fee = (invoice.amount * platformFee) / 10000;
        uint256 creatorAmount = invoice.amount - fee;

        invoice.status = InvoiceStatus.Paid;
        invoice.paidAt = block.timestamp;

        (bool sentToCreator, ) = payable(invoice.creator).call{value: creatorAmount}("");
        require(sentToCreator, "Failed to send to creator");

        if (fee > 0) {
            (bool sentFee, ) = payable(feeCollector).call{value: fee}("");
            require(sentFee, "Failed to send fee");
        }

        // Refund excess payment
        if (msg.value > invoice.amount) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - invoice.amount}("");
            require(refunded, "Failed to refund");
        }

        emit InvoicePaid(_invoiceId, msg.sender, invoice.amount, fee);
    }

    function cancelInvoice(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.creator == msg.sender, "Only creator can cancel");
        require(invoice.status != InvoiceStatus.Paid, "Cannot cancel paid invoice");

        invoice.status = InvoiceStatus.Cancelled;
        emit InvoiceCancelled(_invoiceId);
    }

    function updateInvoice(uint256 _invoiceId, string calldata _description, string calldata _ipfsHash) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.creator == msg.sender, "Only creator can update");
        require(invoice.status == InvoiceStatus.Created, "Can only update draft invoices");

        invoice.description = _description;
        invoice.ipfsHash = _ipfsHash;
        emit InvoiceUpdated(_invoiceId);
    }

    function getInvoice(uint256 _invoiceId) external view returns (Invoice memory) {
        return invoices[_invoiceId];
    }

    function getUserCreatedInvoices(address _user) external view returns (uint256[] memory) {
        return userCreatedInvoices[_user];
    }

    function getUserReceivedInvoices(address _user) external view returns (uint256[] memory) {
        return userReceivedInvoices[_user];
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
        emit PlatformFeeUpdated(_fee);
    }

    function setFeeCollector(address _collector) external onlyOwner {
        require(_collector != address(0), "Invalid address");
        feeCollector = _collector;
    }
}

