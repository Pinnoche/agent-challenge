export async function fetchSolanaWallet(wallet: string, limit = 10) {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey)
      throw new Error("Missing MORALIS_API_KEY in environment variables");

    const res = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${wallet}/swaps?limit=${limit}&order=DESC`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": apiKey,
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        `Failed to fetch swaps: ${res.status} - ${JSON.stringify(error)}`
      );
    }

    const data = await res.json();

    const formatted = data.result.map((tx: any) => {
      const date = new Date(tx.blockTimestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const action =
        tx.transactionType === "buy"
          ? `🟢 Bought ${parseFloat(tx.bought.amount).toFixed(2)} ${
              tx.bought.symbol
            }`
          : `🔴 Sold ${parseFloat(tx.sold.amount).toFixed(2)} ${
              tx.sold.symbol
            }`;

      const value = `$${parseFloat(tx.totalValueUsd).toFixed(2)}`;
      const exchange = `on ${tx.exchangeName}`;
      const pair = `(${tx.pairLabel})`;
      const txHashShort =
        tx.transactionHash.slice(0, 6) + "..." + tx.transactionHash.slice(-4);

      const summary = `${action} for ${value} ${pair} ${exchange} — Tx: ${txHashShort} (${date})`;

      return {
        summary,
        transactionHash: tx.transactionHash,
        transactionType: tx.transactionType,
        blockTimestamp: tx.blockTimestamp,
        pairLabel: tx.pairLabel,
        exchangeName: tx.exchangeName,
        bought: {
          symbol: tx.bought.symbol,
          amount: tx.bought.amount,
          usdAmount: tx.bought.usdAmount,
        },
        sold: {
          symbol: tx.sold.symbol,
          amount: tx.sold.amount,
          usdAmount: tx.sold.usdAmount,
        },
        totalValueUsd: tx.totalValueUsd,
      };
    });

    return formatted;
  }