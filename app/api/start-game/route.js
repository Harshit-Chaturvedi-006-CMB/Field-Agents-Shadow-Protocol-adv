import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing lobby code" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const collection = db.collection("GameData");

    const result = await collection.updateOne(
      { code },
      { $set: { started: true, startTime: new Date().toISOString() } }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: "Lobby not found or already started" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Game started" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
