// /app/api/lobbies/route.js
import clientPromise from "@/lib/mongodb";
import { nanoid } from "nanoid";

const roleTasksMap = {
  scientist: [
    "Collect soil sample at target location",
    "Measure radiation at landmark",
    "Upload bio readings near the coordinates",
    "Scan plants at specified way-point",
    "Photograph water body within target radius"
  ],
  explorer: [
    "Reach the old tower ruins",
    "Visit the bridge overpass checkpoint",
    "Check in at the forest edge marker",
    "Find the hidden statue geo-point",
    "Scout the abandoned vehicle site"
  ],
  deviation: [
    "Deliver secret cache to rendezvous point",
    "Surveil the eastern outpost boundary",
    "Intercept a marked container at hotspot",
    "Drop a beacon at the mysterious signal",
    "Meet ally at the south trail junction"
  ],
  engineer: [
    "Repair field station at specified location",
    "Inspect the malfunctioning sensor node",
    "Install relay device at signal tower",
    "Replace battery at checkpoint",
    "Calibrate antenna at hilltop position"
  ]
};


const roles = ['scientist', 'explorer', 'deviation', 'engineer'];

function getRandomTasks(role) {
  const tasks = roleTasksMap[role] || [];
  return tasks.sort(() => 0.5 - Math.random()).slice(0, 2);
}
function assignRolesAndTasks(playerNames, playerIds) {
  const kiraIndex = Math.floor(Math.random() * playerNames.length);
  return playerNames.map((name, i) => {
    const role = i === kiraIndex ? 'Kira' : roles[Math.floor(Math.random() * roles.length)];
    return {
      playerName: name,
      playerId: playerIds[i],
      roleName: role,
      tasks: getRandomTasks(role),
      coordinates: { lat: 0, long: 0 }
    };
  });
}

export async function POST(request) {
  const { playerNames, playerIds } = await request.json();
  if (!playerNames || !playerIds || playerNames.length !== playerIds.length)
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });

  const lobbyCode = nanoid(6).toUpperCase();
  const playersData = assignRolesAndTasks(playerNames, playerIds);
  const doc = {
    createdAt: new Date(),
    lobbyCode,
    playerNames,
    playerCount: playerNames.length,
    gameData: playersData,
  };

  const client = await clientPromise;
  const db = client.db("userdata");
  await db.collection("games").insertOne(doc);

  return new Response(JSON.stringify({ lobbyCode, gameData: playersData }), {
    headers: { "Content-Type": "application/json" },
    status: 201,
  });
}
