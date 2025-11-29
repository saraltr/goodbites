import { NextRequest, NextResponse } from "next/server";
import { db, authAdmin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserIdFromCookie } from "../menu/route";

function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  
  const body = await request.json();

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = await getUserIdFromCookie(request);
  if (!userId) return unauthorized();


  const { mealId } = body;

  if (!mealId) {
  return NextResponse.json(
      { error: "Missing recipe ID" },
      { status: 400 }
  );
  }

  const newFav = {
      mealId,
      createdAt: FieldValue.serverTimestamp(),
  }

  try{
    const favsId = db.collection("users").doc().id

    // check if recipe is already in the collection
    const existingFav = await db
        .collection("users")
        .doc(userId)
        .collection("favorites")
        .where("mealId", "==", mealId)
        .get();

    if (!existingFav.empty) {
      return NextResponse.json(
        { error: "Recipe is already in favorites" },
        { status: 409 }
      );
    }

    // add recipe to favs collections
    await db.collection("users")
        .doc(userId)
        .collection("favorites")
        .doc(favsId)
        .set(newFav);

    return NextResponse.json(
      { message: "Added recipe to favorites", user: userId, recipe: { mealId } },
      { status: 201 }
    );

  } catch (err) {
    // console.error("Failed to add favorite:", err);
    return NextResponse.json(
      { error: `Failed to add recipe to favorites. Please try again. Error: ${err}` },
      { status: 500 }
    )
    
  } 
}

export async function GET(request: NextRequest) {

  const sessionCookie = request.cookies.get("__session")?.value;
  let userId: string | null = null;

  if (sessionCookie) {
    try {
      const decoded = await authAdmin.verifySessionCookie(sessionCookie, true);
      userId = decoded.uid;
    } catch (err) {
      console.warn(`Invalid session cookie ${err}`);
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // get favorite recipe ids
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("favorites")
      .orderBy("createdAt", "desc")
      .get();

    const recipes = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const mealId = doc.data().mealId;

        const mealData = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
        ).then(res => res.json());

        return {
          firestoreId: doc.id,
          ...mealData.meals?.[0]
        };
      })
    );

    return NextResponse.json({ recipes });

  } catch (err) {
    // console.error("Failed to fetch favorite recipes:", err);
    return NextResponse.json(
      { error: `Failed to fetch favorite recipes. Please try again. Error: ${err}` },
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
    .collection("favorites")
    .doc(id)
    .delete();

    return NextResponse.json({ message: "Recipe deleted from your favorites!", id});
  } catch (err) {
    // console.error("DELETE failed:", err);
    return NextResponse.json(
      { error: `Failed to delete recipe. Error: ${err}`},
      {status: 500}
    );
  }

}