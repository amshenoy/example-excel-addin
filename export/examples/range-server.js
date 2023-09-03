const http = require('http');
const WebSocket = require('websocket').server;

// Create an HTTP server
const server = http.createServer(function (request, response) {
    // Process HTTP request (if needed)
});

// Create WebSocket server
const wsServer = new WebSocket({
    httpServer: server
});

// Store connected clients
const clients = [];

function broadcast(msgData) {
    const msg = JSON.stringify(msgData);
    clients.forEach(function (client) {
        client.send(msg);
    });
}


function sendCellData() {
    let cellData = {
        reference: 'A1',
        value: new Date().getTime()
    };
    broadcast(cellData);
}
setInterval(sendCellData, 100);


function sendCellData2() {
    let cellData = {
        reference: 'A2',
        value: new Date().getTime() / 1000
    };
    broadcast(cellData);
}
setInterval(sendCellData2, 1000);




function getRandomDirection() {
    const directions = [-1, 1];
    return directions[Math.floor(Math.random() * directions.length)];
}

function performRandomWalk(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] += getRandomDirection();
        }
    }
}

function initializeMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(Math.floor(Math.random() * 10));
        }
        matrix.push(row);
    }
    return matrix;
}

const matrix = initializeMatrix(2, 3)

function sendCellData3() {
    performRandomWalk(matrix)
    let rangeReference = 'C1:D3'
    let rangeValue = matrix
    let rangeData = {
        reference: rangeReference,
        value: rangeValue
    };
    broadcast(rangeData);
}
setInterval(sendCellData3, 500);


wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    console.log('WebSocket connection established.');
    clients.push(connection);
    connection.on('close', function (reasonCode, description) {
        console.log(`WebSocket connection closed: ${reasonCode} - ${description}`);
        const index = clients.indexOf(connection);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });
});

const PORT = 3001;
server.listen(PORT, function () {
    console.log(`WebSocket server is listening on port ${PORT}`);
});
