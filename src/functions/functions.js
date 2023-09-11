window.subscribers = {}

window.histories = {}
window.historyLengths = {}
window.historyInvocations = {}

/* global clearInterval, console, setInterval */

/**
 * Increment the cells with a given amount every second. Creates a dynamic spilled array with multiple results
 * @customfunction
 * @param {string} address The address of the source cell as we are unable to use @ requiresAddress with @ streaming
 * @param {string} channel The channel to subscribe to.
 * @param {CustomFunctions.StreamingInvocation<number[][]>} invocation Parameter to send results to Excel or respond to the user canceling the function. A dynamic array.
 */
export function subscribe(channel, datakey, invocation) {
    if (channel.trim() == '') { return }

    // Better data structures: Dict<Channel, Dict<DataKey, List<InvocAddress>>> and Dict<InvocAddress, Invocation>
    // Or even better: Dict<Channel, List<Tuple<DataKey, InvocAddress>>> and Dict<InvocAddress, Invocation>
    // Or best: Dict<Channel, Dict<DataKey, Set<Invocation>>>

    if (!(channel in window.subscribers)) {
        window.subscribers[channel] = {}
    }
    if (!(datakey in window.subscribers[channel])) {
        window.subscribers[channel][datakey] = new Set()
    }
    window.subscribers[channel][datakey].add(invocation)

    invocation.onCanceled = () => {
        window.subscribers[channel][datakey].delete(invocation)
    }
}



/**
  * Fetch JSON from URL
  * @customfunction 
  * @param {string} url string name of Github user or organization.
  * @return {string} JSON response string
  */
export async function fetchJson(url) {
    try {
        const response = await fetch(url);
        console.log(response)
        if (!response.ok) {
            console.log(response.status)
            // throw new Error(response.statusText)
        }
        const jsonResponse = await response.json();
        const jsonString = JSON.stringify(jsonResponse);
        console.log(jsonString);
        return jsonString;
    }
    catch (error) {
        return error;
    }
}


/**
  * Parse JSON from JSON string
  * @customfunction 
  * @param {string} json JSON string to parse
  * @param {string} key
  * @return {string} JSON response string
  */
export function extract(json, key) {
    const keys = key.split('.');
    let value = JSON.parse(json);
    console.log(value)

    for (const key of keys) {
        if (value.hasOwnProperty(key)) {
            value = value[key];
            console.log(value)
        } else {
            return undefined;
        }
    }

    return JSON.stringify(value);
}



/**
  * Convert JSON string to Excel range
  * @customfunction 
  * @param {string} json JSON string to parse
  * @param {boolean} includeKeys Include object keys as headers
  * @return {string[][]} Dynamic range array with multiple results
  */
export function parseJsonRange(json, includeKeys=false) {
    const obj = JSON.parse(json)
    var list = obj;
    if (!Array.isArray(obj) || obj.length === 0) {
        // Handle cases where the input is not a list of objects
        list = [obj];
    }

    const result = [];

    const keys = Object.keys(list[0]);
    if (includeKeys) {
        result.push(keys);
    }

    for (const obj of list) {
        const values = keys.map(key => obj[key]);
        result.push(values);
    }
    return result;
}






/**
  * Gets the star count for a given Github repository.
  * @customfunction 
  * @param {string} userName string name of Github user or organization.
  * @param {string} repoName string name of the Github repository.
  * @return {number} number of stars given to a Github repository.
  */
export async function getStarCount(userName, repoName) {
    try {
        //You can change this URL to any web request you want to work with.
        const url = "https://api.github.com/repos/" + userName + "/" + repoName;
        const response = await fetch(url);
        //Expect that status code is in 200-299 range
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        const jsonResponse = await response.json();
        return jsonResponse.watchers_count;
    }
    catch (error) {
        return error;
    }
}


/**
 * Displays the current time once a second
 * @customfunction
 * @param {CustomFunctions.StreamingInvocation<string>} invocation Custom function invocation
 */
export function clock(invocation) {
    const timer = setInterval(() => {
        const time = currentTime();
        invocation.setResult(time);
    }, 1000);

    invocation.onCanceled = () => {
        clearInterval(timer);
    };
}

/**
 * Returns the current time
 * @returns {string} String with the current time formatted for the current locale.
 */
export function currentTime() {
    return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction
 * @param {number} incrementBy Amount to increment
 * @param {CustomFunctions.StreamingInvocation<number>} invocation
 */
export function increment(incrementBy, invocation) {
    let result = 0;
    const timer = setInterval(() => {
        result += incrementBy;
        invocation.setResult(result);
    }, 1000);

    invocation.onCanceled = () => {
        clearInterval(timer);
    };
}

/**
 * Increment the cells with a given amount every second. Creates a dynamic spilled array with multiple results
 * @customfunction
 * @param {number} amount The amount to add to the cell value on each increment.
 * @param {CustomFunctions.StreamingInvocation<number[][]>} invocation Parameter to send results to Excel or respond to the user canceling the function. A dynamic array.
 */
export function incrementArray(amount, invocation) {
    let firstResult = 0;
    let secondResult = 1;
    let thirdResult = 2;

    const timer = setInterval(() => {
        firstResult += amount;
        secondResult += amount;
        thirdResult += amount;
        invocation.setResult([[firstResult], [secondResult], [thirdResult]]);
    }, 1000);

    invocation.onCanceled = () => {
        clearInterval(timer);
    };
}



async function onBindingDataChanged(eventArgs) {
    const bindingId = eventArgs.binding.id
    const address = bindingId
    await Excel.run(async (context) => {
        const binding = context.workbook.bindings.getItem(bindingId)
        const range = binding.getRange()

        range.load(["address", "values"])
        await context.sync()
        // console.log(bindingId, range.address)

        const newValue = range.values[0][0]
        if (newValue) {
            window.histories[address].push(newValue)
        }
    })
    if (window.histories[address].length > window.historyLengths[address]) {
        window.histories[address].shift() // Keep only the last n values
    }
    for (let invocator of window.historyInvocations[address]) {
        invocator.setResult([window.histories[address]])
    }
}

/**
 * Increment the cells with a given amount every second. Creates a dynamic spilled array with multiple results
 * @customfunction
 * @param {string} address The address of the source cell as we are unable to use @ requiresAddress with @ streaming
 * @param {number} n The channel to subscribe to.
 * @param {CustomFunctions.StreamingInvocation<number[][]>} invocation Parameter to send results to Excel or respond to the user canceling the function. A dynamic array.
 */
export async function History(address, n, invocation) {
    var newAddress = false
    if (!(address in window.histories)) {
        window.histories[address] = []
        window.historyLengths[address] = n
        window.historyInvocations[address] = new Set()
        newAddress = true
    }

    await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet()
        const range = sheet.getRange(address)

        // If new source address for stream, add a binding to listen for changes 
        if (newAddress) {
            // Note: We have to use Excel.binding not Office.binding
            // https://learn.microsoft.com/en-us/javascript/api/excel/excel.binding?view=excel-js-preview
            // const bindingId = range.address // This looks like Sheet1!B3 instead of B3
            const bindingId = address
            const binding = context.workbook.bindings.add(range, Excel.BindingType.Range, bindingId)
            binding.onDataChanged.add(onBindingDataChanged)
        }

        window.historyInvocations[address].add(invocation)
        invocation.onCanceled = () => {
            window.historyInvocations[address].delete(invocation)
        }

        await context.sync()
    }).catch(error => {
        console.error(error)
    })
}
