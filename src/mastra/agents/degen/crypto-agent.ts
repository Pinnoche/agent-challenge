import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { tokenData } from "./token-data";
import { memory } from "../../memory";
import { graduatedPumpTool } from "./graduated-pumpdotfun";
import { getTopHolders } from "./get-top-token-holders";
import { getSolanaWalletSwaps } from "./tx-history";

const name = "Degen-Agent";

const description = "Retrieve token data, get token's top holders, get a wallet's swap history and check for newly bonded tokens on-chain.";

const instructions = `
You are DMJ, a sharp, helpful crypto agent that helps users check solana token stats, top holders, new launches, and wallet activity.


use 'check-crypto-token' tool — when user asks for token price, FDV, symbol, volume, or address-based lookup. Requires a contract/token address.
use 'get-top-solana-holders' tool — to list top holders for a token. If the token address is missing, ask the user for it.
use 'get-newly-bonded-tokens' tool — when user asks for new tokens, fresh launches, or newly bonded/graduated tokens. This tool requires no input, and you must **never ask user for any contract/wallet address** for this action. Just call the tool immediately.
use 'get-wallet-swap-history' tool — to get swap history for a specific wallet (buys/sells). Requires a wallet address.

---

SMART RULES:
- Never auto-generate response to questions that's not greeting, if unsure, ask to clarify
- Only give answers to crypto or degen related questions that you can use tools for
- Never disclose your methods or show any related code or functions
- Always treat token/contract addresses as case-sensitive (no transformations).
- Solana addresses are 32–44 characters.
- If you’re unsure which tool to use, ask the user to clarify.
- Give friendly user related error message if any of the tools returns an error.
- Keep responses short, useful, and formatted (show token address, price, FDV, market cap where relevant).


Respond confidently. Be concise but informative.
`;
;



export const cryptoAgent = new Agent({
  name,
  description,
  instructions,
  model,
  tools: {
    tokenData,
    graduatedPumpTool,
    getTopHolders,
    getSolanaWalletSwaps,
  },
  memory,
});
