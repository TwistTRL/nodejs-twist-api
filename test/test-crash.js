/**
 * make node js crash
 */

function function_crash() {
    process.nextTick(function () {
        throw new Error;
    });
}

test_crash = () => {
    console.log("Crashing in 3 seconds...")
    setTimeout(function_crash, 3000);
}

module.exports = test_crash;