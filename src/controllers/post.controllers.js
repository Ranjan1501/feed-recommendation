const express = require("express");
const pool = require("../config/db");
const redis = require("redis");
const cacheMiddleware = require("../middleware/cacheMiddleware");

const router = express.Router();

router.get("/posts", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM posts");
    res.json(data.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get("/posts/:userId", cacheMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = req.originalUrl;
    console.log("userId: ", userId);
    const data = await pool.query(
      "SELECT * FROM posts WHERE published_by = $1",
      [userId]
    );
    await client.set(cacheKey, JSON.stringify(data.rows), "Ex", 120);
    res.json(data.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus({ status: 500, message: err.message });
  }
});

router.get("/recommendation/posts/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("userId: ", userId);
  try {
    const follweredByUser = await pool.query(
      "SELECT * FROM friendList WHERE follower_id = $1",
      [userId]
    );

    console.log("follweredByUser: ", follweredByUser);

    const allFollowedUserId =
      follweredByUser &&
      follweredByUser.rows[0] &&
      follweredByUser.rows[0].friend_id
        ? follweredByUser.rows[0].friend_id
        : null;
    console.log("allFollowedUserId: ", allFollowedUserId);

    let followerArray = follweredByUser.rows.map((item) => {
      console.log("item: ", item);
      return item.friend_id;
    });

    if (followerArray.length === 0 || allFollowedUserId === null) {
      const generalPost = await pool.query("SELECT * FROM posts");
      return res.json(generalPost.rows);
    }
    console.log("followerArray: ", followerArray);
    const postData = await pool.query(
      "SELECT * FROM posts WHERE published_by = $1",
      [allFollowedUserId]
    );
    let postId = postData.rows[0].id;

    const totalLikesOnPost = await pool.query(
      "SELECT COUNT(*) FROM likes WHERE post_id = $1",
      [postId]
    );
    const postLikes = totalLikesOnPost.rows[0].count;
    const totalCommentsOnPost = await pool.query(
      "SELECT COUNT(*) FROM comments WHERE post_id = $1",
      [postId]
    );
    const postComments = totalCommentsOnPost.rows[0].count;
    console.log("totalCommentsOnPost: ", postComments);

    const popularityScore = parseInt(postLikes) + parseInt(postComments);

    const sortedFeedByScore = await pool.query(
      `SELECT
            p.*,
            COALESCE(l.total_likes, 0) AS total_likes,
            COALESCE(c.total_comments, 0) AS total_comments,
            COALESCE(l.total_likes, 0) + COALESCE(c.total_comments, 0) AS popularityScore
        FROM
            posts p
        LEFT JOIN (
            SELECT
                post_id,
                COUNT(*) AS total_likes
            FROM
                likes
            GROUP BY
                post_id
        ) l ON p.id = l.post_id
        LEFT JOIN (
            SELECT
                post_id,
                COUNT(*) AS total_comments
            FROM
                comments
            GROUP BY
                post_id
        ) c ON p.id = c.post_id
        WHERE
            p.published_by = ANY($1::int[])
        ORDER BY
            popularityScore DESC;
        `,
      [followerArray]
    );

    console.log("sortedFeedByScore : ", sortedFeedByScore.rows);
    res.json(sortedFeedByScore.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus({ status: 500, message: err.message });
  }
});

router.post("/posts", async (req, res) => {
  let { name, age, email } = req.body;
  console.log("des: ", email);
  try {
    const result = await pool.query(
      "INSERT INTO uses (name, age, email) VALUES ($1, $2, $3) RETURNING *",
      [name, age, email]
    );
    console.log("res: ", result);
    res.status(200).json({
      data: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get("/setup", async (req, res) => {
  try {
    await pool.query(`
    CREATE TABLE comments(
        id SERIAL PRIMARY KEY,
        posts_id INT REFERENCES posts(id),
        user_id INT REFERENCES users(id)
    );
`);

    res.status(200).send({ message: "Successfully created table" });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
