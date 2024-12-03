import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const HTTP_URL: string = process.env.RPC_URI || "https://api.mainnet-beta.solana.com";
const WSS_URL: string = process.env.WSS_URI || "wss://api.mainnet-beta.solana.com";
const public_key : string = process.env.PUBLIC_KEY || "";

const RAYDIUM_PUBLIC_KEY:string = process.env.RAYDIUM_PUBLIC_KEY || "";
const RAYDIUM = new PublicKey(RAYDIUM_PUBLIC_KEY);
const INSTRUCTION_NAME = "initialize2";

const connection = new Connection(HTTP_URL, {
    wsEndpoint: WSS_URL
});

async function startConnection(connection: Connection, programAddress: PublicKey, searchInstruction: string): Promise<void> {
    console.log("Monitoring logs for program:", programAddress.toString());
    connection.onLogs(
        programAddress,
        ({ logs, err, signature }) => {
            if (err) return;

            if (logs && logs.some(log => log.includes(searchInstruction))) {
                console.log("Signature for 'initialize2':", `https://explorer.solana.com/tx/${signature}`);
                fetchRaydiumMints(signature, connection);
            }
        },
        "finalized"
    );
}

async function fetchRaydiumMints(txId: string, connection: Connection) {
    try {
        const tx = await connection.getParsedTransaction(
            txId,
            {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            });

        //@ts-ignore
        const accounts = (tx?.transaction.message.instructions).find(ix => ix.programId.toBase58() === RAYDIUM_PUBLIC_KEY).accounts as PublicKey[];
    
        if (!accounts) {
            console.log("No accounts found in the transaction.");
            return;
        }

        const poolIndex = 4;
        const tokenAIndex = 8;
        const tokenBIndex = 9;

        const poolAccount = accounts[poolIndex];
        const tokenAAccount = accounts[tokenAIndex];
        const tokenBAccount = accounts[tokenBIndex];
    
        const displayData = [
            {"Token": "Pool", "Account Public Key": poolAccount.toBase58()},
            { "Token": "A", "Account Public Key": tokenAAccount.toBase58() },
            { "Token": "B", "Account Public Key": tokenBAccount.toBase58() }
        ];

        console.log("New LP Found");
        console.table(displayData);
    
    } catch {
        console.log("Error fetching transaction:", txId);
        return;
    }
}

startConnection(connection, RAYDIUM, INSTRUCTION_NAME).catch(console.error);