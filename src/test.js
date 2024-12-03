import { getAssociatedTokenAddress } from "@solana/spl-token";

const tokenOutAccount = await getAssociatedTokenAddress(
  tokenOut,
  keyPair.publicKey
);
const accountInfo = await connection.getAccountInfo(tokenOutAccount);

if (accountInfo) {
  console.log("Associated Token Account Exists:", tokenOutAccount.toBase58());
} else {
  console.log("Associated Token Account Does Not Exist");
}