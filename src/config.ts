import * as dotenv from 'dotenv';

dotenv.config();

export const private_key : string = process.env.PRIVATE_KEY || "";
