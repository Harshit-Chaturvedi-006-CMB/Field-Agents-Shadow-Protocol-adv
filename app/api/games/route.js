import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

const roleTasksMap = {
  scientist: ['Analyze samples', 'Run experiments', 'Collect data'],
  explorer: ['Scout area', 'Map location', 'Survey surroundings'],
  deviation: ['Hacking systems', 'Bypass security', 'Data extraction'],
  engineer: ['Repair equipment', 'Maintain systems', 'Build infrastructure'],
  Kira: ['Lead mission', 'Coordinate team', 'Strategize plan'],
};
const roles = ['scientist', 'explorer', 'deviation', 'engineer'];

function getRandomTasks(role) {
  const tasks = roleTasksMap[role] || [];
  const shuffled = tasks.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}
function assignRolesAndData(playerNames, playerIds) {
  const kiraIndex = Math.floor(Math.random() * playerNames.length);
  return playerNames.map((name, i) => {
    const role = i === kiraIndex ? 'Kira' : roles[Math.floor(Math.random() * roles.length)];
    return {
      playerName: name,
      playerId: playerIds[i] || uuidv4(),
      roleName: role,
      tasks: getRandomTasks(role),
      coordinates: { lat: 0, long: 0 },
    };
  });
}

// Simple lobby code generator
function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for(let i=0;i<6;i++) {
    code += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("userdata");

    const body = await request.json();
    const { playerNames, playerIds } = body; 
    // playerIds should correspond to playerNames with ids created during signup

    if (!playerNames || !playerIds || playerNames.length !== playerIds.length) {
      return new Response(JSON.stringify({error: "Invalid input"}), {status:400});
    }

    const lobbyCode = generateLobbyCode();
    const gameData = assignRolesAndData(playerNames, playerIds);

    const gameDoc = {
      createdAt: new Date(),
      lobbyCode,
      playerNames,
      playerCount: playerNames.length,
      gameData,
    };

    await db.collection('games').insertOne(gameDoc);

    return new Response(JSON.stringify({message: "Game created", lobbyCode, gameData}), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({error:"Server error"}), {status:500});
  }
}
