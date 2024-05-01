const redis = require("redis");
require("dotenv").config();

const redisClient = require("./redisClient");
// const client = redis.createClient({
//   host: "redis",
//   port: 6379,
//   password: process.env.REDIS_PASSWORD,
// });
const express = require("express");

// write cache function to cache response
// client.on("error", (err) => {
//   console.log("Redis error: ", err);
// });
const cacheResponseMiddleware = async (req, res, next) => {
  // get the url of the request
  const client = redisClient.getClient();
  const cacheKey = req.originalUrl;
  console.log("cacheKey: ", cacheKey);
  await client.get(cacheKey, (err, data) => {
    if (err) {
      console.error("Error in fecting cachedata ", err);
      return next();
    } else {
      if (data !== null) {
        console.log("data from cache: ", data);
        return res.json(JSON.parse(data));
      } else {
        // call next middleware
        next();
      }
    }
  });
};

//  purge specific cached key  whenever there is changes in data
const purgeCachedKey = (cacheKey) => {
  client.del(cacheKey, (err, data) => {
    if (err) throw new Error("Error in purging cache ", err);
    console.log("Cache purged for key: ", cacheKey);
  });
};

module.exports = { cacheResponseMiddleware, purgeCachedKey };
