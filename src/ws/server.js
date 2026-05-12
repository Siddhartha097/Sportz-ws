import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    try {
        socket.send(JSON.stringify(payload));
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;

        try {
            client.send(JSON.stringify(payload));
        } catch (error) {
            console.error("Failed to broadcast message:", error);
        }
    }
}

export function attachWebsocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    });

    wss.on("connection", (socket) => {
        sendJson(socket, { type: "Welcome" });

        socket.on("error", console.error);
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "match_created", data: match });
    }

    return broadcastMatchCreated;
}
