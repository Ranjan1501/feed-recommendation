const express = require("express");
const pool = require("../config/db");

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

router.get("/posts/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("userId: ", userId);
  try {
    const data = await pool.query(
      "SELECT * FROM posts WHERE published_by = $1",
      [userId]
    );
    res.json(data.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus({ status: 500, message: err.message });
  }
});

// recommendation api
router.get("/recommendation/posts/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("userId: ", userId);
  try {
    // calculate popularity score based on like and comments
    const totalLikesByUser = await pool.query(
      "SELECT COUNT(*) FROM likes WHERE user_id = $1",
      [userId]
    );
    const likes = totalLikesByUser.rows[0].count;
    console.log("totalLikesByUser: ", likes);

    //  // calculate popularity score based on like and comments
    const totalCommentByUser = await pool.query(
      "SELECT COUNT(*) FROM comments WHERE user_id = $1",
      [userId]
    );
    const comments = totalCommentByUser.rows[0].count;
    console.log("totalCommentByUser: ", comments);

    // get all followed user_id by this user
    const follweredByUser = await pool.query(
      "SELECT * FROM friendList WHERE follower_id = $1",
      [userId]
    );

    const allFollowedUserId = follweredByUser.rows[0].friend_id;
    console.log("follweredByUser: ", allFollowedUserId);

    // get all post with user id
    const data = await pool.query(
      "SELECT * FROM posts WHERE published_by = $1",
      [allFollowedUserId]
    );

    res.json(data.rows);
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
