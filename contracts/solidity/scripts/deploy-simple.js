import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("  Deploying VotingSystem Contract");
  console.log("========================================\n");

  try {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying contracts with account:", deployer.address);
    
    // Get account balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Get the contract factory
    console.log("Deploying contract...");
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    
    // Deploy the contract
    const votingSystem = await VotingSystem.deploy();
    
    // Wait for deployment
    await votingSystem.waitForDeployment();
    
    const address = await votingSystem.getAddress();
    
    console.log("\n========================================");
    console.log("✅ VotingSystem deployed successfully!");
    console.log("========================================");
    console.log("📍 Contract address:", address);
    console.log("🌐 Network:", hre.network.name);
    console.log("⛓️  Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
    console.log("========================================\n");

    // Create deployments directory
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: address,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    };

    const deploymentPath = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to:", deploymentPath);

    // Save ABI
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "VotingSystem.sol", "VotingSystem.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(deploymentsDir, "VotingSystem.abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log("📄 ABI saved to:", abiPath);

    // Save bytecode
    const bytecodePath = path.join(deploymentsDir, "VotingSystem.bytecode.txt");
    fs.writeFileSync(bytecodePath, artifact.bytecode);
    console.log("📄 Bytecode saved to:", bytecodePath);

    console.log("\n========================================");
    console.log("🎉 Deployment Complete!");
    console.log("========================================\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
