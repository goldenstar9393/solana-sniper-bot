import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { WSOL } from '@raydium-io/raydium-sdk';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import bs58 from 'bs58';
import { private_key, delay_time, rpc_uri, amount, public_key } from './src/config';
import { swap } from './src/raydiumSwap2';
import retry from 'async-await-retry';

function num_bn(number: Decimal) {
    const decimalValue = new Decimal(number);

    // Assume we're working with tokens that have 6 decimals of precision
    const decimals = 3;
    const factor = new Decimal(10).pow(decimals);

    // Scale the decimal value to avoid precision issues and convert to BN
    const scaledDecimal = decimalValue.mul(factor);  // Multiply by 10^6 to shift decimals
    const bigNum = new BN(scaledDecimal.toString());  // Convert to BN
    return bigNum;
}
async  function swapp(){
    await retry(
        async () => 
          await swap("GNpn9hQ8zU3ydJVdaAWAfbT3itGjtkVMgPiCZiz2ebT6", WSOL.mint, 5000000, "fT8sNukPdEL82c3xNRAU7sSJPBMPUwez6M2YxS7tojwiFzwQeL7nXhvqFCnrxKSaCiH73tpBkcDsviX7kG6sDyN"),
        undefined,
        {
          retriesMax: 3,
          interval: 100,
        }
      );    
}
swapp();