window.invocators = {}
window.subscribers = {}
/* global clearInterval, console, setInterval */

/**
 * Increment the cells with a given amount every second. Creates a dynamic spilled array with multiple results
 * @customfunction
 * @param {string} address The address of the source cell as we are unable to use @ requiresAddress with @ streaming
 * @param {string} channel The channel to subscribe to.
 * @param {CustomFunctions.StreamingInvocation<number[][]>} invocation Parameter to send results to Excel or respond to the user canceling the function. A dynamic array.
 */
export function subscribe(address, channel, datakey, invocation) {
    if (channel.trim() == '') { return }

    // Better data structures: Dict<Channel, Dict<DataKey, List<InvocAddress>>> and Dict<InvocAddress, Invocation>
    // Or even better: Dict<Channel, List<Tuple<DataKey, InvocAddress>>> and Dict<InvocAddress, Invocation>
    // Or best: Dict<Channel, Dict<DataKey, Set<Invocation>>>

    // Check if invocation.address matches // @requiresAddress does not work with @streaming
    if (!(address in window.invocators)) {
        window.invocators[address] = invocation
    }

    if (!(channel in window.subscribers)) {
        window.subscribers[channel] = []
    }
    window.subscribers[channel].push([datakey, address])

    invocation.onCanceled = () => {
        delete window.invocators[address];
        window.subscribers[channel] = window.subscribers[channel].filter((value) => value[1] != address);
    };
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
