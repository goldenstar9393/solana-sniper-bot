import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2';
import { ComputeBudgetProgram, Connection, Keypair, clusterApiUrl, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { ApiV3PoolInfoStandardItem, AmmV4Keys, AmmRpcData, USDCMint } from '@raydium-io/raydium-sdk-v2';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { AMM_V4, AMM_STABLE, DEVNET_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2';
import * as nacl from "tweetnacl";

const VALID_PROGRAM_ID = new Set([
  AMM_V4.toBase58(),
  AMM_STABLE.toBase58(),
  DEVNET_PROGRAM_ID.AmmV4.toBase58(),
  DEVNET_PROGRAM_ID.AmmStable.toBase58(),
]);

export const isValidAmm = (id: string) => VALID_PROGRAM_ID.has(id);

export const txVersion = TxVersion.LEGACY; // or TxVersion.LEGACY
const cluster = 'mainnet';

let raydium: Raydium | undefined;

// Initialize Raydium SDK
export const initSdk = async (key: string, connection: Connection, params?: { loadToken?: boolean }) => {
  // const owner = Keypair.fromSecretKey(bs58.decode(key));
  // if (raydium) return raydium;
  console.log(`Connect to RPC ${connection.rpcEndpoint} in ${cluster}`);
  raydium = await Raydium.load({
    owner: Keypair.fromSecretKey(bs58.decode(key)),
    connection: connection,
    cluster: 'mainnet',
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: 'finalized',
  });
  return raydium;
};

// Swap function
export const swap = async (poolId: any, inputMint: string, amountIn: number, ownerPrivateKey: string): Promise<any> => {
  let connection = new Connection("https://api.mainnet-beta.solana.com");
  let raydium = await initSdk(ownerPrivateKey, connection);

  const data = await raydium.api.fetchPoolById({ ids: poolId });
  const poolInfo = data[0] as ApiV3PoolInfoStandardItem;

  if (!isValidAmm(poolInfo.programId)) throw new Error('Target pool is not AMM pool');

  const poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId);
  const rpcData = await raydium.liquidity.getRpcPoolInfo(poolId);
  const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()];

  const baseIn = inputMint === poolInfo.mintA.address;
  const [mintIn, mintOut] = baseIn ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA];

  const out = raydium.liquidity.computeAmountOut({
    poolInfo: { ...poolInfo, baseReserve, quoteReserve, status, version: 4 },
    amountIn: new BN(amountIn),
    mintIn: mintIn.address,
    mintOut: mintOut.address,
    slippage: 1,
  });
  console.log(out);
  console.log(
    `Computed swap: ${new Decimal(amountIn)
      .div(10 ** mintIn.decimals)
      .toDecimalPlaces(mintIn.decimals)
      .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
      .div(10 ** mintOut.decimals)
      .toDecimalPlaces(mintOut.decimals)
      .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out: ${new Decimal(out.minAmountOut.toString())
      .div(10 ** mintOut.decimals)
      .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`
  );

  const PRIORITY_RATE = 25000; // MICRO_LAMPORTS
  const PRIORITY_FEE_INSTRUCTIONS = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_RATE });

  const transaction = new Transaction();
  transaction.add(PRIORITY_FEE_INSTRUCTIONS);

  const { transaction: swapTransaction } = await raydium.liquidity.swap({
    poolInfo,
    poolKeys,
    amountIn: new BN(amountIn),
    amountOut: out.minAmountOut, // Minimum output with slippage
    fixedSide: 'in',
    inputMint: mintIn.address,
    txVersion,
    computeBudgetConfig: {
      units: 600000,
      microLamports: 10000000,
    },
  });

  transaction.add(swapTransaction);

  try {
    console.time("Swap");
    
    const txId = await raydium.connection.sendTransaction(transaction, [Keypair.fromSecretKey(bs58.decode(ownerPrivateKey))],  { skipPreflight: true, maxRetries: 100 });
    console.timeEnd("Swap");

    console.time("Confirm");
    await raydium.connection.confirmTransaction(txId);
    console.timeEnd("Confirm");

    console.log(`Swap successful with txId: ${txId}`);
    return txId;
  } catch (error) {
    console.error("Error during swap:", error);
    throw error;
  }
};
