import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { TopHolders } from "../../lib/TopHolders";


interface Holders {
  balance: string;
  balanceFormatted: string;
  isContract: boolean;
  ownerAddress: string;
  usdValue: string;
  percentageRelativeToTotalSupply: number;
}

export const getTopHolders = createTool({
  id: "get-top-solana-holders",
  description: "Get top holders of a Solana token given its contract address.",
  inputSchema: z.object({
    address: z.string().describe("Contract address"),
    limit: z.number().optional(),
  }),
  outputSchema: z.array(
    z.object({
      balance: z.string(),
      balanceFormatted: z.string(),
      isContract: z.boolean(),
      ownerAddress: z.string(),
      usdValue: z.string(),
      percentageRelativeToTotalSupply: z.number(),
    })
  ),

  execute: async ({ context }) => {
    const { address, limit = 10 } = context;
    console.log("Executing Top holders.....");
    console.log(context.address);
    const holders = await TopHolders(address, limit);
  return holders.map((data: Holders) => ({
    ownerAddress: data.ownerAddress,
    balanceFormatted: data.balanceFormatted.toLocaleString(),
    percentageRelativeToTotalSupply: data.percentageRelativeToTotalSupply,
  }))
  },
});
