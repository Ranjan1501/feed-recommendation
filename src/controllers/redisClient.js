const { CreateRedisConnection } = require("../config/redisConfig");
// import { Client } from "pg";

const setter = async (key, ts, value) => {
  const client = await CreateRedisConnection();
  try {
    const setKey = await client.setEx(key, ts, value, (err, reply) => {
      if (err) {
        console.error("Error setting value in Redis", err);
      } else {
        console.log("Set operation result:", reply);
      }
    });
    return setKey;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getter = async (key) => {
  const client = await CreateRedisConnection();
  try {
    const getKey = await client.get(key, (err, res) => {
      if (err) {
        console.log("Error getting value in Redis", err);
      }
      console.log("Get operation result:", res);
      console.log("time to live :", client.ttl(key));
    });
    const ttl = await client.ttl(key, function (err, ttl) {
      if (err) throw err;
      console.log("Time to live:", ttl);
    });
    return [getKey, ttl];
  } catch (err) {
    console.log("error in fetehing key: ", err);
    throw err;
  }
};

setter("ping", 20, "Pong").then((key) => {
  console.log("Setter key:", key);
});
setTimeout(() => {
  getter("ping").then((key) => {
    console.log("Getter key:", key);
    // console.log("time to live: ", CreateRedisConnection().ttl("zim"));
  });
}, 1000);
