import { NextRequest, NextResponse } from "next/server";
import { getSessionData } from "../lib";
import bs58 from "bs58";
import { TPostAuthVerifyPayload } from "@/wagmi/AppSIWX";
import { PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";

/**
* -------------------------------------

POST /api/auth/verify

Request body:
{
  "nonce": string,
  "signature": string,
  "message": string,
  "address": string
}

example req body:
{
  "address": "BtBpkfa32rcfd6pEWGAgmaMLFGWSK9Q67evZV8UrcjBu",
  "nonce": "j72DBYLLdI",
  "message": "localhost:8000 wants you to sign in with your Solana account:\nBtBpkfa32rcfd6pEWGAgmaMLFGWSK9Q67evZV8UrcjBu\n\nPlease sign in. \n\nnonce: j72DBYLLdI",
  "signature": "Zem1VwBxESpDLxO2022OyH8akDg1k3utOegKc2PTvdtCnYduagPeIsG3N8nu8KTdsjoQxIk4xFSh+oGb4qK5Bg=="
}

Response body:
{
  "success": boolean,
  "data": {
    "address": string,
    "authenticated": boolean
  }
}

*/

export async function POST(req: NextRequest) {
  try {
    const reqBody = (await req.json()) as TPostAuthVerifyPayload;

    if (!reqBody.chainId || !reqBody.accountAddress || !reqBody.nonce || !reqBody.message || !reqBody.signature) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Missing parameters",
        },
        { status: 400 }
      );
    }

    const { message, signature, accountAddress } = reqBody;

    const session = await getSessionData();

    // get the nonce from the session
    const storedNonce = session.tempNonce;
    const storedAddress = session.tempAddress;

    // verify the nonce
    // solana verifiers does not carry nonce when users refresh the page
    // if (reqBody.nonce !== storedNonce && reqBody.accountAddress !== storedAddress) {
    //   return NextResponse.json(
    //     {
    //       statusCode: 400,
    //       message: "Invalid nonce",
    //     },
    //     { status: 400 }
    //   );
    // }

    // Verify using native Solana verification
    const isValid = nacl.sign.detached.verify(new TextEncoder().encode(message), bs58.decode(signature), new PublicKey(accountAddress).toBytes());

    if (!isValid) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Invalid signature",
        },
        { status: 400 }
      );
    }

    // store the user's address in the session
    session.address = storedAddress;
    session.authenticated = true;
    session.tempNonce = "";
    session.tempAddress = "";

    session.chainId = reqBody.chainId;
    session.accountAddress = reqBody.accountAddress;

    await session.save();

    return NextResponse.json(
      {
        statusCode: 200,
        message: "",
        data: {
          verified: true,
          address: storedAddress,
          authenticated: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: 500,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
