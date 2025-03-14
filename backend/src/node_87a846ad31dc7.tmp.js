const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

// Lista para armazenar clientes conectados (com um identificador único)
let connectedClients = [];

wss.on("connection", (ws) => {
    console.log("Novo cliente conectado");

    // Quando um cliente se conecta, vamos adicionar ao monitoramento
    ws.on("open", () => {
        console.log("Clientes conectados:", connectedClients.length);
    });

    ws.on("message", (data) => {
        const message = JSON.parse(data.toString());

        // Se for mensagem de "join" (entrando no chat), adicionamos ao monitoramento
        if (message.type === "join") {
            connectedClients.push({
                id: message.userId,
                name: message.userName,
                color: message.userColor
            });
            console.log(`${message.userName} entrou! Clientes conectados:`, connectedClients);
            
            // Enviar a mensagem de "join" para todos os clientes conectados
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

        // Se for mensagem de "leave" (saindo do chat), removemos o cliente da lista
        else if (message.type === "leave") {
            connectedClients = connectedClients.filter(client => client.id !== message.userId);
            console.log(`${message.userName} saiu! Clientes conectados:`, connectedClients);
            
            // Enviar a mensagem de "leave" para todos os clientes conectados
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
        // Para outras mensagens, transmitimos normalmente
        else {
            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(data.toString());
                }
            });
        }
    });

    // Quando o cliente se desconectar, removemos da lista
    ws.on("close", () => {
        console.log("Cliente desconectado");
        // Remove o cliente da lista de conectados
        connectedClients = connectedClients.filter(client => client.id !== ws.id);
        console.log("Clientes conectados após desconexão:", connectedClients);
    });

    ws.on("error", console.error);
});
