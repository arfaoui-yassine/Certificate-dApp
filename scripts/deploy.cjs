const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Cert contract to Ganache...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const Cert = await hre.ethers.getContractFactory("Cert");
  const cert = await Cert.deploy();
  await cert.waitForDeployment();

  const contractAddress = await cert.getAddress();
  console.log("Cert contract deployed to:", contractAddress);

  // Update the deployed_addresses.json file
  const addressesPath = path.join(__dirname, "../src/scdata/deployed_addresses.json");
  const addresses = {
    CertModuleCert: contractAddress
  };
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("Updated deployed_addresses.json");

  // Copy the ABI to src/scdata/Cert.json
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Cert.sol/Cert.json");
  const destPath = path.join(__dirname, "../src/scdata/Cert.json");
  
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, destPath);
    console.log("Copied ABI to src/scdata/Cert.json");
  }

  console.log("\n✅ Deployment complete!");
  console.log("Contract Address:", contractAddress);
  console.log("Admin (deployer):", deployer.address);
  console.log("\nMake sure to connect MetaMask to Ganache (http://127.0.0.1:7545)");
  console.log("and import the deployer account to issue certificates.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
