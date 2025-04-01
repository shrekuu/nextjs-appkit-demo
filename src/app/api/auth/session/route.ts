import { NextRequest, NextResponse } from "next/server";
import { defaultSession } from "@/store/sessionStore";
import { getSessionData } from "../lib";

/**
* -------------------------------------

get session
GET /api/auth/session

destroy session, aka: log out
GET /api/auth/session?action=logout 

*/

export async function GET(request: NextRequest) {
  const session = await getSessionData();

  const action = new URL(request.url).searchParams.get("action");

  // use is logging out; destroy session
  // session?action=logout
  if (action === "logout") {
    session.destroy();

    return NextResponse.json(
      {
        statusCode: 200,
        message: "",
        data: {
          authenticated: false,
        },
      },
      { status: 200 }
    );
  }

  // not authenticated
  if (session.authenticated !== true) {
    return NextResponse.json(
      {
        statusCode: 200,
        message: "",
        data: {
          authenticated: false,
        },
      },
      { status: 200 }
    );
  }

  // return authenticated session
  return NextResponse.json(
    {
      statusCode: 200,
      message: "",
      data: {
        chainId: session.chainId,
        accountAddress: session.accountAddress,
        authenticated: true,
      },
    },
    { status: 200 }
  );
}
