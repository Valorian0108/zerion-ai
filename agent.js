const walletName = "hackathon-agent";
const walletAddress = "0x6B5c4949FE14e9c46138eF18AF802dABd324E0d2";
const chain = "base";
const policy = "policy-standard-670fc47a";

console.log("Safe Zerion Wallet Watcher Agent");
console.log("Wallet:", walletName);
console.log("Address:", walletAddress);
console.log("Chain lock:", chain);
console.log("Policy:", policy);

console.log("\nCurrent mode: read-only until wallet is funded.");
console.log("Next real onchain step: fund this test wallet with tiny Base ETH, then perform one tiny Zerion-routed swap.");

console.log("\nSafety rules:");
console.log("- Test wallet only");
console.log("- Base chain only");
console.log("- Scoped agent policy enabled");
console.log("- No main wallet");
console.log("- No private key shared");
