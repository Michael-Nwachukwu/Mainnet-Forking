// import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env" });
import * as dotenv from "dotenv";
dotenv.config();

const ALCHEMY_MAINNET_API_KEY_URL = process.env.ALCHEMY_MAINNET_API_KEY_URL;

module.exports = {
  solidity: "0.8.24",
  networks: {
    "lisk-sepolia": {
      url: process.env.LISK_RPC_URL!,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
      gasPrice: 1000000000,
    },
    hardhat: {
      forking: {
        url: ALCHEMY_MAINNET_API_KEY_URL,
      }
    }
  },
  etherscan: {
    // Use "123" as a placeholder, because Blockscout doesn't need a real API key, and Hardhat will complain if this property isn't set.
    apiKey: {
      "lisk-sepolia": "123",
    },
    customChains: [
      {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  lockGasLimit: 200000000000,
  gasPrice: 10000000000,
};