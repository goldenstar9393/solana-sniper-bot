import axios from 'axios';

interface PoolData {
  id: string;
  tvl: number;
}

export default async function getTvlFromId(poolId: string): Promise<number> {
 
  const url = `https://api-v3.raydium.io/pools/info/ids?ids=${poolId}`;
  try {
    const response = await axios.get(url);

    // Check if the response contains the pool ID and TVL
    if (response.data && response.data.data) {
      const poolInfo: PoolData = response.data.data[0]; // Assume a single pool is returned
      if (poolInfo.id === poolId) {
        return poolInfo.tvl;
      }
    }
    console.log(`Pool ID ${poolId} not found or has no TVL.`);
    return 0;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    return 0;
  }
}

