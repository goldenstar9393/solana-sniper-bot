import * as dotenv from 'dotenv';

dotenv.config();

export const private_key : string = process.env.PRIVATE_KEY || "";
export const limit_social : number = 2;  //set the number of the social link
export const limit_tvl : number = 1; // set the limit of the tvl
