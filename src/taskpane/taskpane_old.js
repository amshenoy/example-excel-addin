/* global console, document, Excel, Office */

Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
        document.getElementById("sideload-msg").style.display = "none"
        document.getElementById("app-body").style.display = "flex"
        document.getElementById("run").onclick = run
    }
})

const transpose = m => m[0].map((x, i) => m.map(x => x[i]));


class RangeParser {
    constructor(rangeReference) {
        this.rangeReference = rangeReference;
        this.shape = this.shape();
        this.rowCount = this.shape.rowCount;
        this.columnCount = this.shape.columnCount;
    }

    getShape() {
        const [start, end] = this.rangeReference.split(":");
        const startCell = this.parseCellReference(start);
        const endCell = this.parseCellReference(end);
        const rowCount = endCell.row - startCell.row + 1;
        const columnCount = endCell.column - startCell.column + 1;
        return { rowCount, columnCount };
    }

    parseCellReference(cellReference) {
        const matches = cellReference.match(/([A-Z]+)(\d+)/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid cell reference: " + cellReference);
        }
        const column = matches[1];
        const row = parseInt(matches[2], 10);
        const columnNumber = this.columnToNumber(column);
        return { column: columnNumber, row: row };
    }

    columnToNumber(column) {
        let result = 0;
        for (let i = 0; i < column.length; i++) {
            result *= 26;
            result += column.charCodeAt(i) - "A".charCodeAt(0) + 1;
        }
        return result;
    }
}

// // Example usage
// const rangeReference = "A1:B3";
// const parser = new RangeParser(rangeReference);
// const dimensions = parser.shape();

// console.log("Row count:", dimensions.rowCount);
// console.log("Column count:", dimensions.columnCount);



// export async function run() {
//     try {
//         await Excel.run(async (context) => {
//             const range = context.workbook.getSelectedRange()
//             range.load("address")
//             range.format.fill.color = "yellow"
//             await context.sync()
//             console.log(`The range address was ${range.address}.`)
//         })
//     } catch (error) {
//         console.error(error)
//     }
// }


function getShape(matrix, dimensions = []) {
    if (Array.isArray(matrix)) {
        dimensions.push(matrix.length);
        return getShape(matrix[0], dimensions);
    } else return dimensions;
}

function convertToRange(data) {
    const shape = getShape(data)
    if (shape.length == 0) {
        return [[data]]
    } else if (shape.length == 1) {
        return [data]
    } else if (shape.length == 2) {
        return data
    } else throw Error("Invalid data range format");
}

// function matchRange(data, reference=null) {
//     let rangeData = convertToRange(data)
//     reference.split(':')
// }

async function getSchema() {
    try {
        await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getItem("Schema")
            const usedRange = sheet.getUsedRange()
            usedRange.load("address, values")

            await context.sync()
        })
    } catch (error) {
        console.error(error)
    }
}

const SERVER_URL = 'ws://localhost:3001'

export function run() {
    const ws = new WebSocket(SERVER_URL)

    ws.onmessage = async function (event) {
        const msg = JSON.parse(event.data)
        const reference = msg.reference
        const rangeData = msg.value

        await Excel.run(async function (context) {
            const sheet = context.workbook.worksheets.getActiveWorksheet()
            const range = sheet.getRange(reference)

            let rangeValues = convertToRange(rangeData, reference)
            const valuesShape = getShape(rangeValues)
            
            // Alternative: We could use range.load for verifying rowCount and columnCount 
            // but it requires an extra context refresh
            // range.load("rowCount, columnCount")
            // await context.sync()

            const rangeRef = new RangeParser(reference)
            if (!(valuesShape[0] == rangeRef.rowCount && valuesShape[1] == rangeRef.columnCount)) {
                rangeValues = transpose(rangeValues)
            }

            range.values = rangeValues
            await context.sync()
        }).catch(function (error) {
            console.log(error)
        })
    }

    ws.onerror = function (event) {
        const cellReference = 'A3'
        const newValue = event.data

        Excel.run(function (context) {
            const sheet = context.workbook.worksheets.getActiveWorksheet()
            const cell = sheet.getRange(cellReference)
            cell.values = [[newValue]]
            return context.sync()
        }).catch(function (error) {
            console.log(error)
        })
    }
}
