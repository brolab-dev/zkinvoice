// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKKYCRegistry
 * @dev Manages KYC verification using ZK-proofs for privacy preservation
 */
contract ZKKYCRegistry is Ownable {
    // Groth16 verification key components (to be set during deployment)
    struct VerificationKey {
        uint256[2] alpha;
        uint256[2][2] beta;
        uint256[2][2] gamma;
        uint256[2][2] delta;
        uint256[2][] ic;
    }

    struct KYCStatus {
        bool isVerified;
        uint256 verificationTime;
        bytes32 identityCommitment; // Pedersen commitment to identity
        string encryptedDataIPFS; // Encrypted KYC data stored on IPFS
        uint256 expirationTime;
        KYCLevel level;
    }

    enum KYCLevel { None, Basic, Advanced, Full }

    VerificationKey internal verificationKey;
    mapping(address => KYCStatus) internal kycStatus;
    mapping(bytes32 => bool) public usedProofs; // Prevent proof replay
    mapping(address => bool) public verifiers; // Authorized verifiers

    event KYCSubmitted(address indexed user, bytes32 identityCommitment, string ipfsHash);
    event KYCVerified(address indexed user, KYCLevel level, uint256 expirationTime);
    event KYCRevoked(address indexed user);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event VerificationKeyUpdated();

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    constructor() Ownable(msg.sender) {
        verifiers[msg.sender] = true;
    }

    /**
     * @dev Submit KYC data with identity commitment (Phase 1: Data Submission)
     */
    function submitKYC(
        bytes32 _identityCommitment,
        string calldata _encryptedDataIPFS
    ) external {
        require(_identityCommitment != bytes32(0), "Invalid commitment");
        
        kycStatus[msg.sender] = KYCStatus({
            isVerified: false,
            verificationTime: 0,
            identityCommitment: _identityCommitment,
            encryptedDataIPFS: _encryptedDataIPFS,
            expirationTime: 0,
            level: KYCLevel.None
        });

        emit KYCSubmitted(msg.sender, _identityCommitment, _encryptedDataIPFS);
    }

    /**
     * @dev Verify KYC using ZK-proof (Phase 2: Verification)
     * @param _user Address of the user being verified
     * @param _proof The ZK-proof components [a, b, c] flattened
     * @param _publicInputs Public inputs to the circuit
     * @param _level KYC level to grant
     * @param _validityPeriod How long the KYC is valid (in seconds)
     */
    function verifyKYC(
        address _user,
        uint256[8] calldata _proof,
        uint256[] calldata _publicInputs,
        KYCLevel _level,
        uint256 _validityPeriod
    ) external onlyVerifier {
        require(kycStatus[_user].identityCommitment != bytes32(0), "No KYC submission found");
        require(_level != KYCLevel.None, "Invalid KYC level");

        // Create proof hash to prevent replay
        bytes32 proofHash = keccak256(abi.encodePacked(_proof, _publicInputs, _user));
        require(!usedProofs[proofHash], "Proof already used");

        // Verify the ZK-proof
        require(verifyProof(_proof, _publicInputs), "Invalid ZK proof");

        usedProofs[proofHash] = true;
        
        kycStatus[_user].isVerified = true;
        kycStatus[_user].verificationTime = block.timestamp;
        kycStatus[_user].expirationTime = block.timestamp + _validityPeriod;
        kycStatus[_user].level = _level;

        emit KYCVerified(_user, _level, kycStatus[_user].expirationTime);
    }

    /**
     * @dev Verify Groth16 proof (simplified - actual implementation needs pairing checks)
     */
    function verifyProof(
        uint256[8] calldata _proof,
        uint256[] calldata _publicInputs
    ) public view returns (bool) {
        // In production, this would implement full Groth16 verification
        // using precompiled contracts for pairing checks (0x06, 0x07, 0x08)
        // For demo purposes, we do basic validation
        require(_proof[0] != 0 && _proof[1] != 0, "Invalid proof point A");
        require(_publicInputs.length > 0, "No public inputs");
        
        // Verify that the commitment matches
        // In production: full pairing check e(A, B) = e(alpha, beta) * e(vk_x, gamma) * e(C, delta)
        return true; // Simplified for demo
    }

    function isKYCValid(address _user) external view returns (bool) {
        KYCStatus memory status = kycStatus[_user];
        return status.isVerified && block.timestamp < status.expirationTime;
    }

    function getKYCLevel(address _user) external view returns (KYCLevel) {
        if (!kycStatus[_user].isVerified || block.timestamp >= kycStatus[_user].expirationTime) {
            return KYCLevel.None;
        }
        return kycStatus[_user].level;
    }

    function revokeKYC(address _user) external onlyVerifier {
        kycStatus[_user].isVerified = false;
        kycStatus[_user].expirationTime = 0;
        kycStatus[_user].level = KYCLevel.None;
        emit KYCRevoked(_user);
    }

    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    function getKYCStatus(address _user) external view returns (KYCStatus memory) {
        return kycStatus[_user];
    }
}

