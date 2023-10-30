import express from "express";
import bodyParser from "body-parser";
import connectDB from "./Db/db.js";
import UserRoutes from "./routes/userroutes.js";
import Roomroutes from "./routes/roomroutes.js";
import statusroutes from "./routes/statusroutes.js";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import initializeSocket from "./sockets/socketsio.js";

connectDB();

const app = express();
const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(bodyParser.json());
app.use("/user", UserRoutes);
app.use("/room", Roomroutes);
app.use("/status", statusroutes);
app.use('/room', express.static('room'));
app.use("/userimages", express.static(join(__dirname, "userimages")));
app.use("/status/images", express.static(join(__dirname, "status")));

const server = http.createServer(app);
initializeSocket(server); // Initialize Socket.io with the HTTP server

server.listen(PORT, () =>
  console.log(`The server is running on http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Hello from home");
});
