import express from "express";
import { matchRouter } from "./routes/matches.js"; // Added .js extension
import http from "http";
import { attachWebsocketServer } from "./ws/server.js";

const port = Number(process.env.PORT || 5050);
const host = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.use("/matches", matchRouter);

const broadcastMatchCreated = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
server.listen(port, host, () => {
    const baseUrl =
        host === "0.0.0.0"
            ? `http://localhost:${port}`
            : `http://${host}:${port}`;
    console.log(`Server is running at ${baseUrl}`);
    console.log(
        `Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`,
    );
});
