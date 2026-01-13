import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main deployment script for VotingSystem smart contract
 * 
 * This script:
 * 1. Compiles the Solidity contract
 * 2. Deploys it to the specified network
 * 3. Saves the contract address and ABI to files
 * 4. Verifies the contract on Etherscan (if on public network)
 */
async function main() {
  console.log("========================================");
  console.log("  Deploying VotingSystem Contract");
  console.log("========================================\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get the contract factory
  console.log("Compiling contract...");
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const votingSystem = await VotingSystem.deploy();
  
  // Wait for deployment to complete
  await votingSystem.waitForDeployment();
  
  const contractAddress = await votingSystem.getAddress();
  
  console.log("\n✅ VotingSystem deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("⛓️  Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(outputDir, `${hre.network.name}.json`);
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📄 Deployment info saved to:", deploymentPath);

  // Save ABI
  const artifactPath = path.join(__dirname, "../artifacts/VotingSystem.sol/VotingSystem.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const abiPath = path.join(outputDir, "VotingSystem.abi.json");
  fs.writeFileSync(
    abiPath,
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("📄 ABI saved to:", abiPath);

  // Save bytecode
  const bytecodePath = path.join(outputDir, "VotingSystem.bytecode.txt");
  fs.writeFileSync(bytecodePath, artifact.bytecode);
  console.log("📄 Bytecode saved to:", bytecodePath);

  // Verify contract on Etherscan (only on public networks)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await votingSystem.deploymentTransaction().wait(6); // Wait for 6 confirmations
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Display useful information
  console.log("\n========================================");
  console.log("  Deployment Summary");
  console.log("========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nNext steps:");
  console.log("1. Update your Python backend with the contract address");
  console.log("2. Copy the ABI file to your backend directory");
  console.log("3. Configure Web3.py to interact with the contract");
  console.log("========================================\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
