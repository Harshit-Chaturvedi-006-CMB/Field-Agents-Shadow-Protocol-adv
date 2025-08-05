import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { code, playerCount, host, playgroundRadius, centerLat, centerLng, createdAt } = await request.json();

    if (!code || !host || !playgroundRadius || !centerLat || !centerLng || !createdAt) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const collection = db.collection("GameData");

    // Insert new lobby or update existing
    await collection.updateOne(
      { code },
      {
        $set: {
          code,
          host,
          playgroundRadius,
          centerLat,
          centerLng,
          createdAt,
          started: false,
        },
        $setOnInsert: {
          players: [{ name: host, joinedAt: new Date().toISOString() }],
        },
      },
      { upsert: true }
    );

    return new Response(JSON.stringify({ message: "Lobby created" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
