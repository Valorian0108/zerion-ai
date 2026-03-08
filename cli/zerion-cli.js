#!/usr/bin/env node

const API_BASE = process.env.ZERION_API_BASE || "https://api.zerion.io/v1";
const API_KEY = process.env.ZERION_API_KEY || "";

const CHAIN_IDS = new Set([
  "ethereum",
  "base",
  "arbitrum",
  "optimism",
  "polygon",
  "bsc",
  "avalanche",
  "gnosis",
  "scroll",
  "linea",
  "zksync",
  "solana",
  "zora",
  "blast"
]);

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printError(code, message, details = {}) {
  process.stderr.write(`${JSON.stringify({ error: { code, message, ...details } }, null, 2)}\n`);
}

function usage() {
  print({
    name: "zerion-cli",
    usage: [
      "zerion-cli wallet analyze <address>",
      "zerion-cli wallet portfolio <address>",
      "zerion-cli wallet positions <address> [--chain ethereum]",
      "zerion-cli wallet transactions <address> [--limit 25] [--chain ethereum]",
      "zerion-cli wallet pnl <address>",
      "zerion-cli chains list"
    ],
    env: ["ZERION_API_KEY", "ZERION_API_BASE (optional)"]
  });
}

function parseFlags(argv) {
  const flags = {};
  const rest = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      rest.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.trim();
    const nextValue = inlineValue ?? argv[i + 1];

    if (inlineValue === undefined && nextValue && !nextValue.startsWith("--")) {
      flags[key] = nextValue;
      i += 1;
    } else {
      flags[key] = inlineValue ?? true;
    }
  }

  return { rest, flags };
}

function basicAuthHeader(rawKey) {
  return `Basic ${Buffer.from(`${rawKey}:`).toString("base64")}`;
}

function ensureKey() {
  if (!API_KEY) {
    printError("missing_api_key", "ZERION_API_KEY is required.");
    process.exit(1);
  }
}

function validateChain(chain) {
  if (!chain) return;
  if (!CHAIN_IDS.has(chain)) {
    printError("unsupported_chain", `Unsupported chain '${chain}'.`, {
      supportedChains: Array.from(CHAIN_IDS).sort()
    });
    process.exit(1);
  }
}

async function request(pathname, params = {}) {
  ensureKey();

  const url = new URL(`${API_BASE}${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuthHeader(API_KEY)
    }
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    printError("api_error", `Zerion API request failed with status ${response.status}.`, {
      status: response.status,
      response: payload
    });
    process.exit(1);
  }

  return payload;
}

async function getPortfolio(address) {
  return request(`/wallets/${encodeURIComponent(address)}/portfolio`);
}

async function getPositions(address, chain) {
  const params = chain ? { "filter[chain_ids]": chain } : {};
  return request(`/wallets/${encodeURIComponent(address)}/positions/`, params);
}

async function getTransactions(address, chain, limit) {
  const params = {
    page: limit || 25
  };
  if (chain) params["filter[chain_ids]"] = chain;
  return request(`/wallets/${encodeURIComponent(address)}/transactions/`, params);
}

async function getPnl(address) {
  return request(`/wallets/${encodeURIComponent(address)}/pnl`);
}

async function listChains() {
  return request("/chains/");
}

function summarizeAnalyze(address, portfolio, positions, transactions, pnl) {
  return {
    wallet: {
      query: address,
      resolvedAddress: address
    },
    portfolio: {
      total: portfolio?.data?.attributes?.total?.positions ?? null,
      currency: "usd"
    },
    positions: {
      count: Array.isArray(positions?.data) ? positions.data.length : 0
    },
    transactions: {
      sampled: Array.isArray(transactions?.data) ? transactions.data.length : 0
    },
    pnl: {
      available: Boolean(pnl?.data),
      summary: pnl?.data?.attributes ?? null
    },
    raw: {
      portfolio,
      positions,
      transactions,
      pnl
    }
  };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    usage();
    return;
  }

  const { rest, flags } = parseFlags(argv);
  const [scope, action, target] = rest;

  if (scope === "chains" && action === "list") {
    print(await listChains());
    return;
  }

  if (scope !== "wallet" || !action) {
    usage();
    process.exit(1);
  }

  if (!target) {
    printError("missing_wallet", "A wallet address or ENS name is required.");
    process.exit(1);
  }

  validateChain(flags.chain);

  switch (action) {
    case "portfolio":
      print(await getPortfolio(target));
      return;
    case "positions":
      print(await getPositions(target, flags.chain));
      return;
    case "transactions":
      print(await getTransactions(target, flags.chain, flags.limit));
      return;
    case "pnl":
      print(await getPnl(target));
      return;
    case "analyze": {
      const [portfolio, positions, transactions, pnl] = await Promise.all([
        getPortfolio(target),
        getPositions(target, flags.chain),
        getTransactions(target, flags.chain, flags.limit || 10),
        getPnl(target)
      ]);
      print(summarizeAnalyze(target, portfolio, positions, transactions, pnl));
      return;
    }
    default:
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  printError("unexpected_error", error.message);
  process.exit(1);
});
