import clientPromise from "@/lib/mongodb";

export async function GET(request, { params }) {
  const { lobbyCode } = params;
  try {
    const client = await clientPromise;
    const db = client.db("userdata");
    const game = await db.collection('games').findOne({ lobbyCode });

    if (!game) return new Response(JSON.stringify({error:'Lobby not found'}), {status:404});

    // Return only necessary fields
    const {createdAt, lobbyCode: code, playerCount, gameData} = game;

    return new Response(JSON.stringify({createdAt, lobbyCode: code, playerCount, gameData}), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({error:"Server error"}), {status:500});
  }
}
