require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      // Ganache typically provides 10 accounts with this mnemonic by default
      // The first account will be used for deployment (admin)
      // You can also specify accounts explicitly if needed:
      // accounts: ["YOUR_PRIVATE_KEY_HERE"]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
