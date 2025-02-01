async function addDelay() {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function callFunctionWithRetry(fn, params) {
  let result = false;
  let time = 2000;
  let increment = 2;
  let retry = 5;
  try {
    while (!result && retry > 0) {
      result = await fn(...params);
      if (!result) {
        console.log(`Retrying to create User after ${time}`);
        await addDelay(time);
        time = time * increment;
        retry--;
      }
    }
    return true;
  } catch (error) {
    console.log("Failed After Retrying");
    return false;
  }
}

module.exports = { addDelay, callFunctionWithRetry };
