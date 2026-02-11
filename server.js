const express = require('express');
const dotenv=require('dotenv').config();
const mongoose = require('mongoose');
const { createServer } = require("http");
const { Server } = require("socket.io");
// require('dotenv').config();
const cors=require('cors');
const UserRoutes = require('./routes/UserRoutes');
const socket = require('./socket');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{ cors: { origin: process.env.FRONTEND_URL,  methods: ["GET", "POST"] } });

socket(io);
app.use(cors({ origin: process.env.FRONTEND_URL,  methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use('/api/user', UserRoutes);

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('Connected to db.');
  const port = process.env.PORT || 4000;
  httpServer.listen(port, () => console.log(`Listening on http://localhost:${port}.`));
}).catch((error) => {
  console.log('Connection Error!', error);
});
