export const ABI = [
    {
      "inputs": [
        {"internalType": "address", "name": "userAddress", "type": "address"},
        {"internalType": "uint256", "name": "nullifierSeed", "type": "uint256"},
        {"internalType": "uint256", "name": "nullifier", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "uint256", "name": "signal", "type": "uint256"},
        {"internalType": "uint256[4]", "name": "revealArray", "type": "uint256[4]"},
        {"internalType": "uint256[8]", "name": "groth16Proof", "type": "uint256[8]"},
        {"internalType": "uint256", "name": "nonce", "type": "uint256"},
        {"internalType": "bytes", "name": "signature", "type": "bytes"}
      ],
      "name": "addUserGasless",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "userAddress", "type": "address"}
      ],
      "name": "getUserByAddress",
      "outputs": [
        {"internalType": "uint", "name": "nullifier", "type": "uint"},
        {"internalType": "uint", "name": "nullifierSeed", "type": "uint"},
        {"internalType": "uint[4]", "name": "revealedData", "type": "uint[4]"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];