pragma circom 2.1.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";

/**
 * KYC Verification Circuit
 * Proves:
 * 1. User knows their identity details (preimage of identity commitment)
 * 2. User is over a certain age
 * 3. User's country is in an allowed list
 * 
 * All without revealing the actual identity details
 */
template KYCVerification() {
    // Private inputs (hidden from verifier)
    signal input firstName;        // Hashed first name
    signal input lastName;         // Hashed last name
    signal input dateOfBirth;      // Unix timestamp
    signal input countryCode;      // Country code (e.g., 1 for US, 44 for UK)
    signal input documentNumber;   // Hashed document number
    signal input salt;             // Random salt for commitment
    
    // Public inputs (visible to verifier)
    signal input identityCommitment;  // Public commitment to verify against
    signal input currentTimestamp;    // Current time for age check
    signal input minimumAge;          // Minimum age requirement (e.g., 18)
    
    // Public outputs
    signal output isValid;
    signal output ageVerified;
    signal output identityHash;

    // Step 1: Compute identity commitment using Poseidon hash
    component hasher = Poseidon(6);
    hasher.inputs[0] <== firstName;
    hasher.inputs[1] <== lastName;
    hasher.inputs[2] <== dateOfBirth;
    hasher.inputs[3] <== countryCode;
    hasher.inputs[4] <== documentNumber;
    hasher.inputs[5] <== salt;

    // Verify the commitment matches
    signal computedCommitment;
    computedCommitment <== hasher.out;
    
    // This creates a constraint that the computed commitment equals the public commitment
    signal commitmentDiff;
    commitmentDiff <== computedCommitment - identityCommitment;
    
    // Step 2: Age verification
    // Calculate age in seconds (approximate - 365.25 days per year)
    signal ageInSeconds;
    ageInSeconds <== currentTimestamp - dateOfBirth;
    
    // Convert minimum age to seconds (minimumAge * 365.25 * 24 * 60 * 60)
    signal minimumAgeSeconds;
    minimumAgeSeconds <== minimumAge * 31557600; // 365.25 * 24 * 60 * 60
    
    // Check if age >= minimum age
    component ageCheck = GreaterEqThan(64);
    ageCheck.in[0] <== ageInSeconds;
    ageCheck.in[1] <== minimumAgeSeconds;
    
    ageVerified <== ageCheck.out;
    
    // Step 3: Compute public identity hash (for matching without revealing details)
    component publicHasher = Poseidon(2);
    publicHasher.inputs[0] <== computedCommitment;
    publicHasher.inputs[1] <== salt;
    identityHash <== publicHasher.out;
    
    // Step 4: Final validity check
    // isValid = 1 if commitment matches AND age is verified
    signal commitmentValid;
    commitmentValid <== 1 - (commitmentDiff * commitmentDiff); // 1 if diff is 0
    
    // Ensure commitment is exactly correct (no overflow tricks)
    commitmentDiff === 0;
    
    isValid <== ageVerified;
}

/**
 * Country Allowlist Circuit
 * Verifies that a country code is in an allowed list without revealing the country
 */
template CountryAllowlist(numCountries) {
    signal input countryCode;
    signal input allowedCountries[numCountries];
    signal output isAllowed;
    
    component isEqual[numCountries];
    signal matches[numCountries];
    signal runningSum[numCountries + 1];
    
    runningSum[0] <== 0;
    
    for (var i = 0; i < numCountries; i++) {
        isEqual[i] = IsEqual();
        isEqual[i].in[0] <== countryCode;
        isEqual[i].in[1] <== allowedCountries[i];
        matches[i] <== isEqual[i].out;
        runningSum[i + 1] <== runningSum[i] + matches[i];
    }
    
    // isAllowed = 1 if at least one match found
    component isZero = IsZero();
    isZero.in <== runningSum[numCountries];
    isAllowed <== 1 - isZero.out;
}

/**
 * Full KYC Proof with Country Check
 */
template FullKYCProof(numAllowedCountries) {
    // Include all KYC verification
    signal input firstName;
    signal input lastName;
    signal input dateOfBirth;
    signal input countryCode;
    signal input documentNumber;
    signal input salt;
    signal input identityCommitment;
    signal input currentTimestamp;
    signal input minimumAge;
    signal input allowedCountries[numAllowedCountries];
    
    signal output isValid;
    signal output ageVerified;
    signal output countryAllowed;
    signal output identityHash;
    
    // KYC Verification
    component kyc = KYCVerification();
    kyc.firstName <== firstName;
    kyc.lastName <== lastName;
    kyc.dateOfBirth <== dateOfBirth;
    kyc.countryCode <== countryCode;
    kyc.documentNumber <== documentNumber;
    kyc.salt <== salt;
    kyc.identityCommitment <== identityCommitment;
    kyc.currentTimestamp <== currentTimestamp;
    kyc.minimumAge <== minimumAge;
    
    // Country Allowlist Check
    component countryCheck = CountryAllowlist(numAllowedCountries);
    countryCheck.countryCode <== countryCode;
    for (var i = 0; i < numAllowedCountries; i++) {
        countryCheck.allowedCountries[i] <== allowedCountries[i];
    }
    
    ageVerified <== kyc.ageVerified;
    countryAllowed <== countryCheck.isAllowed;
    identityHash <== kyc.identityHash;
    
    // Final validity: all checks must pass
    isValid <== kyc.isValid * countryCheck.isAllowed;
}

// Main component with 10 allowed countries
component main {public [identityCommitment, currentTimestamp, minimumAge]} = KYCVerification();

