const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    console.log("Novo cliente conectado");

    ws.on("message", (data) => {
        const message = JSON.parse(data.toString());

        
        if (message.type === "join") {
            const joinMessage = {
                userId: "server",
                userName: "Servidor",
                userColor: "#ff0000",
                content: message.content 
            };

            
            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify(joinMessage));
                }
            });
        }

        
        else if (message.type === "leave") {
            const leaveMessage = {
                userId: "server",
                userName: "Servidor",
                userColor: "#ff0000",
                content: message.content 
            };

            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify(leaveMessage));
                }
            });
        }
        else {

            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(data.toString());
                }
            });
        }
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
    });

    ws.on("error", console.error);
});