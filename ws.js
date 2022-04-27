var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const port = process.env.PORT || 8080
server.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port '+port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}
var connections = [];
var users = []
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) { 

        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
            if(data) var user = data.user;
            if(user)
            {
                if(users.includes(user))
                {
                    var i = users.findIndex(element => element == user);
                    users.splice(i,1);
                    connections.splice(i,1);
                }
                users.push(user);
                connections.push(connection);
            }
            if(data.to)
            {
                for (let i = 0; i < users.length; i++) {
                    for (let k = 0; k < data.to.length; k++) {
                        if(users[i] == data.to[k])
                        {
                            var obj = {title:data.title,description:data.description,from:data.from};
                            connections[i].sendUTF(JSON.stringify(obj));
                        }
                    }
                }
            }
            console.log(users.length);
            console.log(connections.length);
            console.log('Received Message: ' + message.utf8Data);
        }

    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
