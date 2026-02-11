const MAX_USERS_PER_ROOM = 2;
const queue = new Map();

function socket(io) {
    io.on("connection", (socket) => {
        console.log(`User connected with ID: ${socket.id}`);

        // Player joins queue
        socket.on("joinQueue", () => {
            queue.set(socket.id, socket);

            if (queue.size >= MAX_USERS_PER_ROOM) {
                const roomName = 'room_' + Math.random().toString(36).substring(7);
                const players = Array.from(queue.values()).splice(0, 2);

                // Assign tags and join room
                io.to(players[0].id).emit('tag', 'x');
                players[0].join(roomName);
                queue.delete(players[0].id);
                console.log(`User: ${players[0].id} joined room: ${roomName}`);

                io.to(players[1].id).emit('tag', 'o');
                players[1].join(roomName);
                queue.delete(players[1].id);
                console.log(`User: ${players[1].id} joined room: ${roomName}`);

                // Start game for both
                io.to(roomName).emit('startGame', roomName);
            }
        });

        // Handshake event
        socket.on("handShake", (arg) => {
            console.log("HandShake", arg);
            socket.broadcast.to(arg.room).emit('handShake', arg.opp);
        });

        // Join room manually (optional)
        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        // Game move
        socket.on("num", (arg) => {
            socket.to(arg.room).emit('num', arg);
            console.log("Move:", arg);
        });

        // Chat message
        socket.on("message", (message) => {
            console.log("Message:", message);
            socket.to(message.room).emit('message', message);
        });

        // Disconnect handling
        socket.on("disconnect", () => {
            console.log(`User disconnected with ID: ${socket.id}`);

            // Remove from queue if present
            if (queue.has(socket.id)) {
                queue.delete(socket.id);
            }

            // Notify rooms where this socket was present
            socket.rooms.forEach((room) => {
                if (room !== socket.id) { // exclude personal room
                    io.to(room).emit('userLeft', socket.id);
                }
            });
        });
    });
}

module.exports = socket;
