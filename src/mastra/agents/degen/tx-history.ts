import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchSolanaWallet } from "../../lib/SolanaWallet";

export const getSolanaWalletSwaps = createTool({
  id: "get-solana-wallet-swaps",
  description:
    "Get recent swap (buy/sell) transactions for a given Solana wallet address.",
  inputSchema: z.object({
    wallet: z.string(),
    limit: z.number().optional(),
  }),
  outputSchema: z.array(
    z.object({
      summary: z.string(),
      transactionHash: z.string(),
      transactionType: z.enum(["buy", "sell"]),
      blockTimestamp: z.string(),
      pairLabel: z.string(),
      exchangeName: z.string(),
      bought: z.object({
        symbol: z.string(),
        amount: z.string(),
        usdAmount: z.number(),
      }),
      sold: z.object({
        symbol: z.string(),
        amount: z.string(),
        usdAmount: z.number(),
      }),
      totalValueUsd: z.number(),
    })
  ),

  execute: async ({ context }) => {
    const { wallet, limit = 10 } = context;
    const res = await fetchSolanaWallet(wallet, limit);
    return res;
  },

 
});
