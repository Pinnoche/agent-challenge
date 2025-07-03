import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { TopHolders } from "../../lib/TopHolders";

interface TokenData {
  pairs: any[];
}

interface Holders {
  balance: string;
  balanceFormatted: string;
  isContract: boolean;
  ownerAddress: string;
  usdValue: string;
  percentageRelativeToTotalSupply: number;
}
export const tokenData = createTool({
  id: "check-crypto-token",
  description:
    "Look up live data (price, liquidity, volume) of a crypto token using its contract address or symbol",
  inputSchema: z.object({
    ca: z.string().min(32).describe("Contract address to search"),
  }),
  outputSchema: z.object({
    address: z.string(),
    token: z.string(),
    priceUsd: z.string(),
    priceNative: z.string(),
    liquidityUsd: z.string(),
    volume24h: z.string(),
    priceChange24h: z.string(),
    buysVsSells24h: z.string(),
    website: z.string(),
    twitter: z.string(),
    fdvUsd: z.string(),
    marketCapUsd: z.string(),
    topHolders: z.array(
      z.object({
        ownerAddress: z.string(),
        balanceFormatted: z.string(),
        percentageRelativeToTotalSupply: z.number(),
      })
    ),
    justification: z.string(),
    security: z.object({
      rugScore: z.string(),
      lpStatus: z.string(),
    }),
  }),

  execute: async ({ context }) => {
    console.log("Executing Token Data.....");
    return await getTokenDetails(context.ca);
  },
});

const getTokenDetails = async (ca: string) => {
  console.log("setFlagsFromString..");
  const dexscreenerUrl = `https://api.dexscreener.com/latest/dex/search/?q=${ca}`;
  const res = await fetch(dexscreenerUrl);
  const data = (await res.json()) as TokenData;

  const tokenData = data?.pairs?.[0];

  if (!tokenData) {
    throw new Error(`Token with address or query "${ca}" not found.`);
  }

  const {
    baseToken,
    priceUsd,
    priceNative,
    liquidity,
    volume,
    priceChange,
    txns,
    fdv,
    marketCap,
    info,
  } = tokenData;

  const justification = getTradeJustification({
    priceChange24h: priceChange.h24,
    buys: txns.h24.buys,
    sells: txns.h24.sells,
    liquidityUsd: liquidity.usd,
  });

  const holders = await TopHolders(baseToken.address);
  const topHolders = holders.map((data: Holders) => ({
    ownerAddress: data.ownerAddress,
    balanceFormatted: data.balanceFormatted.toLocaleString(),
    percentageRelativeToTotalSupply: data.percentageRelativeToTotalSupply,
  }));
  const riskCheck = topHolders.some(
    (holder: Holders) => holder.percentageRelativeToTotalSupply > 20
  );
  const lpStatus = getLpStatus(liquidity.usd);
  const rugScore = computeRugScore({
    liquidityUsd: Number(liquidity.usd),
    priceChange24h: Number(priceChange.h24),
    buys: Number(txns.h24.buys),
    sells: Number(txns.h24.sells),
    riskCheck,
  });

  return {
    address: baseToken.address,
    token: `${baseToken.name} (${baseToken.symbol})`,
    priceUsd: `$${priceUsd}`,
    priceNative: `${priceNative} SOL`,
    liquidityUsd: `$${liquidity.usd.toLocaleString()}`,
    volume24h: `$${volume.h24.toLocaleString()}`,
    priceChange24h: `${priceChange.h24}%`,
    buysVsSells24h: `${txns.h24.buys} buys / ${txns.h24.sells} sells`,
    website: info?.websites?.[0]?.url ?? "N/A",
    twitter:
      info?.socials?.find((s: { type: string }) => s.type === "twitter")?.url ??
      "N/A",
    fdvUsd: `$${fdv.toLocaleString()}`,
    marketCapUsd: `$${marketCap.toLocaleString()}`,
    topHolders,
    justification,
    security: {
      rugScore: `${rugScore}/10`,
      lpStatus,
    },
  };
};

const getTradeJustification = ({
  priceChange24h,
  buys,
  sells,
  liquidityUsd,
}: {
  priceChange24h: number;
  buys: number;
  sells: number;
  liquidityUsd: number;
}) => {
  let vibe = "";

  if (priceChange24h > 20 && buys > sells && liquidityUsd > 100000) {
    vibe =
      "📈 Up only vibes. Smart apes loading bags. Might be a solid entry 🦍🚀";
  } else if (priceChange24h < -15 && sells > buys) {
    vibe =
      "🔻 Heavy sell pressure. Could be mid-rug energy. Stay sharp, degen.";
  } else if (liquidityUsd < 10000) {
    vibe =
      "💧 Liquidity looking sus. Might be exit scam season. Proceed with caution.";
  } else {
    vibe =
      "🤔 Mixed signals. Might wanna wait for confirmation or check LP lock.";
  }

  return vibe;
};

const getLpStatus = (liquidityUsd: number): string => {
  if (liquidityUsd > 100000)
    return "Possibly Locked or burned (Getting Safe) ✅";
  if (liquidityUsd < 50000) return "Possibly unlocked and Risky ";
  return "Unknown ❓";
};

const computeRugScore = ({
  liquidityUsd,
  priceChange24h,
  buys,
  sells,
  riskCheck,
}: {
  liquidityUsd: number;
  priceChange24h: number;
  buys: number;
  sells: number;
  riskCheck: boolean;
}) => {
  let score = 10;

  if (riskCheck) score -= 8;
  if (liquidityUsd < 10000) score -= 4;
  if (sells > buys * 1.5) score -= 3;
  if (priceChange24h < -25) score -= 2;

  return Math.max(score, 1);
};
