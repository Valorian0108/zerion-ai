const wallet = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const chain = "base";

console.log("Zerion Frontier Agent started");
console.log("Watching wallet:", wallet);
console.log("Chain:", chain);

const command = `node cli/zerion.js portfolio ${wallet} --chain ${chain} --pretty`;

console.log("\nTomorrow, when rate limit resets, run:");
console.log(command);

console.log("\nSafety rules:");
console.log("- Read-only mode");
console.log("- No main wallet");
console.log("- No private key");
console.log("- No trades yet");
