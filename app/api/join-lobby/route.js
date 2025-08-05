import clientPromise from "@/lib/mongodb";

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request) {
  try {
    const { code, playerName, playerLat, playerLng } = await request.json();
    if (!code || !playerName || playerLat == null || playerLng == null) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const collection = db.collection("GameData");

    const lobby = await collection.findOne({ code });
    if (!lobby) {
      return new Response(JSON.stringify({ error: "Lobby not found" }), { status: 404 });
    }

    // Distance check
    const distance = getDistanceInMeters(playerLat, playerLng, lobby.centerLat, lobby.centerLng);
    if (distance > lobby.playgroundRadius) {
      return new Response(JSON.stringify({ error: "Cannot join lobby: Out of boundary" }), { status: 403 });
    }

    // Add player if not already in lobby
    const existingPlayer = lobby.players.find(p => p.name === playerName);
    if (!existingPlayer) {
      await collection.updateOne(
        { code },
        { $push: { players: { name: playerName, joinedAt: new Date().toISOString() } } }
      );
    }

    // Return updated player count
    const updatedLobby = await collection.findOne({ code });
    const playerCount = updatedLobby.players.length;

    return new Response(JSON.stringify({ message: "Joined lobby", playerCount }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
