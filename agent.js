const walletName = "hackathon-agent";
const walletAddress = "0xB9494f6d563d94bB67553d378a44ED32A8e2aF52";
const chain = "base";

console.log("Safe Zerion Wallet Watcher Agent");
console.log("Wallet:", walletName);
console.log("Address:", walletAddress);
console.log("Chain lock:", chain);

console.log("\nCurrent mode: read-only until wallet is funded.");
console.log("Next real onchain step: fund this test wallet with tiny Base ETH, then perform one tiny Zerion-routed swap.");

console.log("\nSafety rules:");
console.log("- Test wallet only");
console.log("- Base chain only");
console.log("- Scoped agent policy enabled");
console.log("- No main wallet");
console.log("- No private key shared");
