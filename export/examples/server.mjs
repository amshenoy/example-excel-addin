import http from 'http'
import WebSocket from 'ws'

const SetSerializer = (_key, value) => (value instanceof Set ? [...value] : value)

const channels = {}

const clients = []
const server = http.createServer(function (request, response) {
    // Process HTTP request (if needed)
    if (request.url === '/') {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(channels, SetSerializer))
    }
})

const ws = new WebSocket.Server({
    server: server,
});

function track(msgData) {
    if (!(msgData.channel in channels)) {
        channels[msgData.channel] = new Set()
    }
    channels[msgData.channel].add(msgData.action)
    // console.log(msgData)
}

function broadcast(msgData) {
    track(msgData)
    const msg = JSON.stringify(msgData)
    clients.forEach(function (client) {
        client.send(msg)
    })
}

function sendCellData() {
    const date = new Date()
    let cellData = {
        channel: 'test',
        action: 'time',
        data: date.getTime()
    }
    let datetimeData = {
        channel: 'test',
        action: 'datetime',
        data: date
    }
    broadcast(cellData)
    broadcast(datetimeData)
}
setInterval(sendCellData, 100);


// function sendCellData2() {
//     let cellData = {
//         reference: 'A2',
//         value: new Date().getTime() / 1000
//     };
//     broadcast(cellData);
// }
// setInterval(sendCellData2, 1000);




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

function sendCellMatrix() {
    performRandomWalk(matrix)
    let rangeData = {
        channel: 'random',
        action: 'matrix',
        data: matrix
    }
    broadcast(rangeData)
}
setInterval(sendCellMatrix, 500)


// ws.on('request', function (request) {
// const connection = request.accept(null, request.origin)
// console.log('WebSocket connection established.')
// clients.push(connection)
// connection.on('close', function (reasonCode, description) {
// console.log(`WebSocket connection closed: ${reasonCode} - ${description}`)
// const index = clients.indexOf(connection)
// if (index !== -1) {
// clients.splice(index, 1)
// }
// });
// });

ws.on('connection', (connection) => {
    console.log('WebSocket connection established.');
    clients.push(connection);

    connection.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
        const index = clients.indexOf(connection);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });
});

const PORT = 3001;
server.listen(PORT, function () {
    console.log(`WebSocket server is listening on port ${PORT}`)
})
