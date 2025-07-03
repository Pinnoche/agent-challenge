import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const graduatedPumpTool = createTool({
  id: "get-newly-bonded-tokens",
  description: "Fetch recently graduated Pump.fun tokens on Solana",
  inputSchema: z.object({ limit: z.number().optional() }),
  outputSchema: z.array(z.object({
    tokenAddress: z.string(),
    name: z.string(),
    symbol: z.string(),
    logo: z.string().url().optional(),
    priceUsd: z.string(),
    liquidity: z.string(),
    fullyDilutedValuation: z.string(),
    graduatedAt: z.string(),
  })),
  execute: async ({ context }) => {
     console.log('Executing Grad Tokens.....')
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) throw new Error("Missing MORALIS_API_KEY in environment variables");
    const limit = context.limit ?? 20;
    const res = await fetch(
      `https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/graduated?limit=${limit}`,
      {
        headers: { "accept": "application/json", "X-API-Key": apiKey }
      }
    );
    const data = await res.json();
    return data.result;
  },
});
