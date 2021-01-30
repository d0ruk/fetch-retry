require("regenerator-runtime/runtime");
const _fetch = require("isomorphic-fetch");
const merge = require("lodash.merge");
const retry = require("..");

const fetch = retry(_fetch, {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  retries: 3,
  retryDelay: function (attempt, error, response) {
    return Math.pow(2, attempt) * 1000;
  },
  retryOn: async (attempt, error, response) => {
    if (error || !response.ok) {
      console.warn(`Retrying ${response.url}`, { attempt, error, response });
      return true;
    }

    if (Math.random() > 0.5) {
      const response = await fetch("https://api.chucknorris.io/jokes/random");
      const { value } = await response.json();

      console.log(value);
    }

    return false;
  },
});

status(403, { retryOn: [403], retries: 6, retryDelay: 0 })
// status(500, { retries: 5, retryDelay: 0 })
  // status(401)
  // status(200)
  .then(console.log)
  .catch(console.error);

function status(code, config = {}) {
  const opts = { method: "GET" };
  if (config.body) {
    opts.body = JSON.stringify(config.body);
    delete config.body;
  }

  return fetch(`https://httpbin.org/status/${code}`, merge({}, opts, config));
}
