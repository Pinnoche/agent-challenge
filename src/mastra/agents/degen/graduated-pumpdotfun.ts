import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface Token {
  tokenAddress: string;
  name: string;
  symbol: string;
  priceUsd: string;
  graduatedAt: string;
}

export const graduatedPumpTool = createTool({
  id: "get-newly-bonded-tokens",
  description:
    "Fetch recently graduated or bonded Pump.fun tokens on Solana. Does not require input.",
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      tokenAddress: z.string(),
      name: z.string(),
      symbol: z.string(),
      logo: z.string().url().optional(),
      priceUsd: z.string(),
      liquidity: z.string(),
      fullyDilutedValuation: z.string(),
      graduatedAt: z.string(),
    })
  ),
  execute: async () => {
    console.log("Executing Grad Tokens.....");
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey)
      throw new Error("Missing MORALIS_API_KEY in environment variables");
    const limit = 20;
    const res = await fetch(
      `https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/graduated?limit=${limit}`,
      {
        headers: { accept: "application/json", "X-API-Key": apiKey },
      }
    );
    const data = await res.json();
    const tokens = data.result.map((token: Token) => ({
      address: token.tokenAddress,
      name: token.name,
      symbol: token.symbol,
      price: `$${token.priceUsd}`,
      Date: new Date(token.graduatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    return tokens;
  },
});
