const webSocketsServerPort = 8000;
import { createServer } from 'http';
import { server as webSocketServer } from 'websocket';



const server = createServer();
server.listen(webSocketServerPort);
const wsServer = new webSocketServer({
    httpServer: server
})

const clients = {};

const getUniqueID = () => {
    const s4 = () => Math.floor((1+ Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
}

wsServer.on('request', function(request) {
    var userID = getUniqueID();
    console.log((new Date()) + ' Received a new connection from origin '+ request.origin + '.');
    const connection = request.accept(null,request.origin);
    clients[userID] = connection;
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

});