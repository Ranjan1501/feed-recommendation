const { createClient } = require("redis");
let client;

let CreateRedisConnection = async () => {
  if (!client) {
    client = await createClient();
    client.on("error", (err) => {
      console.log("Redis Circle Error", err);
    });

    await client.connect();
  }
  return client;
};

// await client.connect();

module.exports = { CreateRedisConnection };
