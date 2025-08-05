import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing lobby code" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const collection = db.collection("GameData");

    const lobby = await collection.findOne({ code });
    if (!lobby) {
      return new Response(JSON.stringify({ error: "Lobby not found" }), { status: 404 });
    }

    const playerCount = lobby.players.length;
    const started = lobby.started || false;

    return new Response(JSON.stringify({ playerCount, started }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
