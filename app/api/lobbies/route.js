// /app/api/lobbies/route.js
import clientPromise from "@/lib/mongodb";
import { nanoid } from "nanoid";

const roleTasksMap = {
  scientist: ['task1', 'task2'],
  explorer: ['task3', 'task4'],
  deviation: ['task5', 'task6'],
  engineer: ['task7', 'task8']
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
