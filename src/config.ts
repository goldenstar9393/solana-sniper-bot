import * as dotenv from 'dotenv';

dotenv.config();

export const private_key : string = process.env.PRIVATE_KEY || "";
export const limit_social : number = 1;  //set the number of the social link
export const limit_tvl : number = 1; // set the limit of the tvl
export const delay_time : number = 10000; // set the limit of the tvl
export const HTTP_URL: string = process.env.RPC_URI || "https://api.mainnet-beta.solana.com";
export const WSS_URL: string = process.env.WSS_URI || "wss://api.mainnet-beta.solana.com";
export const RAYDIUM_PUBLIC_KEY : string = process.env.RAYDIUM_PUBLIC_KEY || "";
export const rpc_uri: string = process.env.RPC_URI || "https://api.mainnet-beta.solana.com";
export const amount: number = Number(process.env.AMOUNT) || 0.003;
export const public_key : string = process.env.PUBLIC_KEY || "";
export const raydium_auth_v4: string = process.env.RAYDIUM_AUTH_V4 || "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";
