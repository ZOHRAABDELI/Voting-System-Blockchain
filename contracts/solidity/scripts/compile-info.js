const hre = require("hardhat");

/**
 * Script to compile the Solidity contract and display compilation results
 * 
 * This demonstrates:
 * - How Solidity contracts are compiled
 * - Where bytecode and ABI are generated
 * - Contract size and optimization info
 */
async function main() {
  console.log("========================================");
  console.log("  Compiling Solidity Contracts");
  console.log("========================================\n");

  // Force recompilation
  await hre.run("clean");
  console.log("✅ Cleaned previous artifacts\n");

  // Compile contracts
  console.log("📦 Compiling contracts...");
  await hre.run("compile");
  console.log("✅ Compilation successful!\n");

  // Get contract artifact
  const artifact = await hre.artifacts.readArtifact("VotingSystem");
  
  console.log("========================================");
  console.log("  Compilation Results");
  console.log("========================================\n");

  console.log("📄 Contract Name:", artifact.contractName);
  console.log("📝 Source File:", artifact.sourceName);
  console.log("🔧 Compiler Version:", artifact.compiler?.version || "N/A");
  
  // Bytecode information
  const bytecodeLength = artifact.bytecode.length / 2 - 1; // Remove '0x' and divide by 2
  const deployedBytecodeLength = artifact.deployedBytecode.length / 2 - 1;
  
  console.log("\n📊 Bytecode Information:");
  console.log("   - Deployment bytecode size:", bytecodeLength, "bytes");
  console.log("   - Runtime bytecode size:", deployedBytecodeLength, "bytes");
  console.log("   - Total size:", ((bytecodeLength + deployedBytecodeLength) / 1024).toFixed(2), "KB");
  
  // Contract size limit on Ethereum is 24KB
  const maxSize = 24576;
  const sizePercentage = ((deployedBytecodeLength / maxSize) * 100).toFixed(2);
  console.log("   - Size vs. limit:", sizePercentage + "%", `(${maxSize} bytes max)`);
  
  if (deployedBytecodeLength > maxSize) {
    console.log("   ⚠️  WARNING: Contract exceeds 24KB size limit!");
  } else {
    console.log("   ✅ Contract within size limit");
  }

  // ABI information
  console.log("\n📋 ABI Information:");
  console.log("   - Total functions:", artifact.abi.filter(item => item.type === 'function').length);
  console.log("   - Events:", artifact.abi.filter(item => item.type === 'event').length);
  console.log("   - Constructor:", artifact.abi.filter(item => item.type === 'constructor').length);

  // List all functions
  console.log("\n🔧 Public Functions:");
  const functions = artifact.abi.filter(item => item.type === 'function');
  functions.forEach(func => {
    const params = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
    const stateMutability = func.stateMutability === 'view' ? '(view)' : 
                          func.stateMutability === 'pure' ? '(pure)' : '';
    console.log(`   - ${func.name}(${params}) ${stateMutability}`);
  });

  // List all events
  console.log("\n📢 Events:");
  const events = artifact.abi.filter(item => item.type === 'event');
  events.forEach(event => {
    const params = event.inputs.map(input => `${input.type} ${input.name}`).join(', ');
    console.log(`   - ${event.name}(${params})`);
  });

  console.log("\n========================================");
  console.log("  Files Generated");
  console.log("========================================\n");
  console.log("📁 Artifacts directory: ./artifacts/");
  console.log("   - Full artifact: artifacts/VotingSystem.sol/VotingSystem.json");
  console.log("   - Contains: ABI, Bytecode, Metadata");
  console.log("\n📁 Cache directory: ./cache/");
  console.log("   - Compilation cache for faster rebuilds");
  
  console.log("\n========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
