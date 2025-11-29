import { NextRequest, NextResponse } from "next/server";
import { db, authAdmin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function getUserIdFromCookie(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get("__session")?.value;

  if (!sessionCookie) return null;

  try {
    const decoded = await authAdmin.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch (err) {
    console.warn("Invalid session cookie:", err);
    return null;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export async function POST(request: NextRequest) {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return unauthorized();

    const body = await request.json().catch(() => null);
    if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { budget, mode, meals } = body;

    // validate payload
    if (!budget || !mode || !Array.isArray(meals)) {
        return NextResponse.json(
        { error: "Missing required fields: budget, mode, meals[]" },
        { status: 400 }
        );
    }

    const weekId = db.collection("users").doc().id;

    const newMenu = {
        mode,
        budget,
        meals,
        createdAt: FieldValue.serverTimestamp(),
    };

    try {
        await db
        .collection("users")
        .doc(userId)
        .collection("meals")
        .doc(weekId)
        .set(newMenu);
    } catch (err) {
        // console.error("Failed to create menu:", err);
        return NextResponse.json(
        { error: `Failed to create menu. Error: ${err}` },
        { status: 500 }
        );
    }

    return NextResponse.json(
        { message: "Menu Created", id: weekId, menu: newMenu },
        { status: 201 }
    );
}

export async function GET(request: NextRequest) {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return unauthorized();

    try {
        const snapshot = await db
        .collection("users")
        .doc(userId)
        .collection("meals")
        .orderBy("createdAt", "desc")
        .get();

        const menus = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? null,
        };
        });

        return NextResponse.json({ menus });
    } catch (err) {
        // console.error("GET meals failed:", err);
        return NextResponse.json(
        { error: `Failed to fetch meals. Error: ${err}` },
        { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return unauthorized();

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
    return NextResponse.json(
        { error: "Menu ID is required" },
        { status: 400 }
    );
    }

    try {
        await db
        .collection("users")
        .doc(userId)
        .collection("meals")
        .doc(id)
        .delete();

        return NextResponse.json({ message: "Menu deleted successfully!", id });
    } catch (err) {
        console.error("DELETE failed:", err);
        return NextResponse.json(
        { error: `Failed to delete menu. Error: ${err}` },
        { status: 500 }
        );
    }
}