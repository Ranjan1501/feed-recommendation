// const redis = require("redis");

// const client = redis.createClient(6379, "172.20.0.4");

// (async () => {
//   try {
//     await client.connect();
//     console.log("Connected to Redis successfully");
//   } catch (error) {
//     console.error("Redis connection error from middleware:", error);
//     process.exit(1); // Exit on connection failure
//   }
// })();
const Redis = require("ioredis");
const client = new Redis({
  port: process.env.redis_port,
  host: process.env.redis_host,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 10, 1000);
  },
  reconnectOnError: (err) => {
    var targetError = "READONLY";
    // Only reconnect when the error starts with "READONLY".
    return err.message.slice(0, targetError.length) === targetError;
  },
});

const setData = async (key, data, expireTime) => {
  try {
    let res = await client.set(key, JSON.stringify(data), "EX", expireTime);
    console.log("Data cached for key: ", key);
    return res;
  } catch (error) {
    console.error("Error caching data for key: ", key, error);
  }
};

const getData = async (key) => {
  try {
    let res = await client.get(key);
    console.log("Data cached for key: ", key);
    return res;
  } catch (error) {
    console.error("Error caching data for key: ", key, error);
  }
};

async function cacheMiddleware(req, res, next) {
  const cacheKey = `${req.originalUrl}`; 
  try {
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log("Serving data from cache for", cacheKey);
      res.json(JSON.parse(cachedData));
    } else {
      next(); 
    }
  } catch (error) {
    console.error("Error fetching data from cache:", error);
    next(); 
  }
}

let testSet = setData("test", "test-123", 10)
  .then((result) => {
    console.log("result: ", result);
  })
  .catch((error) => {
    console.error("Error setting data in cache: ", error);
  });


let testGet = getData("test")
  .then((result) => {
    console.log("result: ", result);
  })
  .catch((error) => {
    console.error("Error getting data from cache: ", error);
  });
// console.log(testGet);

module.exports = cacheMiddleware;
