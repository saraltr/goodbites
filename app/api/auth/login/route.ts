import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";

//creates a firebase session cookie from a client ID token
export async function POST(req: Request) {
  try {
    let body;

    // parse JSON 
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Must be JSON." },
        { status: 400 }
      );
    }

    const idToken = body?.idToken;

    // check if ID token was sent
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid ID token." },
        { status: 400 }
      );
    }

    // session duration of 7 days
    const expiresIn = 7 * 24 * 60 * 60 * 1000;

    let sessionCookie;

    try {
      // firebase admin creates the session cookie
      sessionCookie = await authAdmin.createSessionCookie(idToken, {
        expiresIn,
      });
    } catch (error) {
      console.error("[SESSION COOKIE ERROR]", error);

      return NextResponse.json(
        { error: "Could not create session. Please try logging in again." },
        { status: 401 }
      );
    }

    // successful response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // HttpOnly session cookie
    response.cookies.set("__session", sessionCookie, {
        // cannot be accessed by JS
        httpOnly: true,     
        // only HTTPS in production                   
        secure: process.env.NODE_ENV === "production",
        // prevent CSRF to some extent
        sameSite: "lax",    
        // sent to entire site                    
        path: "/",             
        // in seconds                 
        maxAge: expiresIn / 1000,
    });

    return response;

  } catch (error) {
    // last-resort catch block 
    console.error("[UNEXPECTED LOGIN ERROR]", error);

    return NextResponse.json(
      { error: "Unexpected server error. Please try again later." },
      { status: 500 }
    );
  }
}
