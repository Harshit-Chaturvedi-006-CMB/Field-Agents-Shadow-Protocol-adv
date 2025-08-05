const { Server } = require('socket.io');
const io = new Server(4000, { cors: { origin: "*" } }); // This binds to 0.0.0.0 by default


const lobbies = {}; // Map lobbyCode → { players: [...] }

io.on('connection', (socket) => {
  socket.on('createLobby', ({ lobbyCode, player }) => {
    // Initialize lobby if doesn't exist
    if (!lobbies[lobbyCode]) { 
      lobbies[lobbyCode] = { players: [] };
    }
    // Add host player if not already in list
    if (!lobbies[lobbyCode].players.some(p => p.name === player.name)) {
      lobbies[lobbyCode].players.push(player);
    }
    
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });


  socket.on('playerMove', ({ lobbyCode, player, coordinates }) => {
  const lobby = lobbies[lobbyCode];
  if (lobby) {
    const idx = lobby.players.findIndex(p => p.id === player.id);
    if (idx !== -1) {
      lobby.players[idx].coordinates = coordinates;
      
    }
    io.to(lobbyCode).emit('lobbyUpdate', lobby); // send updated player list to all clients
    console.log(lobby.players.coordinates);
  }
});


  socket.on('joinLobby', ({ lobbyCode, player }) => {
    if (!lobbies[lobbyCode]) lobbies[lobbyCode] = { players: [] };

    if (!lobbies[lobbyCode].players.some(p => p.name === player.name)) {
      lobbies[lobbyCode].players.push(player);
    }
    
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  socket.on('leaveLobby', ({ lobbyCode, playerId }) => {
  if (lobbies[lobbyCode]) {
    lobbies[lobbyCode].players = lobbies[lobbyCode].players.filter(
      p => p.name !== playerId
    );
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  }
  socket.leave(lobbyCode);
});

});
