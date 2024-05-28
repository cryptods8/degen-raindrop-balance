import { baseUrl } from "@/app/constants";
import { frames } from "@/app/frames/frames";
import { ActionMetadata, getAddressesForFid } from "frames.js";
import { fetchQuery, init } from "@airstack/node";
import { pgDb } from "@/app/db/pg-db";

export const GET = async () => {
  const actionMetadata: ActionMetadata = {
    action: {
      type: "post",
    },
    icon: "graph",
    name: `$DEGEN RainDrop Balance Check`,
    aboutUrl: baseUrl,
    description: `Checks the $DEGEN RainDrop balance of the caster`,
  };

  return Response.json(actionMetadata);
};

const DEGEN_CONTRACT_ADDRESS = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const DEGEN_RAIN_WALLET = "0x14d2f413691Bc20cD9E7d87e2a88884E45e4Ab9d";

interface AirstackTokenTransfer {
  amount: string;
  formattedAmount: number;
  blockTimestamp: string;
}

if (!process.env.AIRSTACK_API_KEY) {
  throw new Error("AIRSTACK_API_KEY is required");
}
init(process.env.AIRSTACK_API_KEY);

async function fetchTokenTransfers(addresses: string[]) {
  const query = `query MyQuery {
    TokenTransfers(
      input: {filter: {
        from: {_in: ${JSON.stringify(addresses)}},
        to: { _eq: "${DEGEN_RAIN_WALLET}" },
        tokenAddress: {_eq:"${DEGEN_CONTRACT_ADDRESS}"}
      }, blockchain: base}
    ) {
      TokenTransfer {
        amount
        formattedAmount
        blockTimestamp
      }
    }
  }`;
  const { data } = await fetchQuery(query);
  const transfers: AirstackTokenTransfer[] =
    data.TokenTransfers?.TokenTransfer || [];
  return transfers;
}

async function getAllRaindropsUsedFromDb(fid: number): Promise<number> {
  try {
    const res = await pgDb
      .selectFrom((db) =>
        db
          .selectFrom("degen_raindrop")
          .where("fromFid", "=", fid.toString())
          .select((db) => db.fn.max("value").as("value"))
          .groupBy("castHash")
          .as("udr")
      )
      .select((db) => db.fn.sum("udr.value").as("total"))
      .executeTakeFirst();
    return Number(res?.total) || 0;
  } catch (e) {
    console.error(e);
  }
  return 0;
}

async function checkBalance(addresses: string[]): Promise<number> {
  console.log("Checking balance for", addresses);
  try {
    const transfers = await fetchTokenTransfers(addresses);
    const totalBalance = transfers.reduce((acc, t) => {
      if (!t.formattedAmount) return acc;
      return acc + t.formattedAmount;
    }, 0);
    return totalBalance;
  } catch (e) {
    console.error((e as any).message);
    return 0;
  }
}

function fmtNum(num: number) {
  return Math.round(num).toLocaleString("en");
}

export const POST = frames(async (ctx) => {
  const fid = ctx.message?.castId?.fid;
  if (!fid) {
    return Response.json(
      {
        message: "Couldn't find valid info :(",
      },
      {
        status: 400,
      }
    );
  }
  try {
    const addresses = await getAddressesForFid({ fid });
    const verifiedAddresses = addresses
      .filter((a) => a.type === "verified")
      .map((a) => a.address);

    const promises = [
      checkBalance(verifiedAddresses),
      getAllRaindropsUsedFromDb(fid),
    ];
    const [totalBalance, usedBalance] = await Promise.all(promises);
    const totalBalanceAfterFees = totalBalance * 0.98;
    const remaining = totalBalanceAfterFees - usedBalance;

    if (totalBalance === 0 && usedBalance === 0) {
      return Response.json({
        message: "No RainDrop balance",
      });
    }

    return Response.json({
      message: `${remaining >= 0 ? "✅" : "❌"} ${fmtNum(remaining)} / ${fmtNum(
        totalBalanceAfterFees
      )} $DEGEN`,
    });
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        message: "Failed to find valid info :(",
      },
      { status: 400 }
    );
  }
});
