const express = require("express");
const pool = require("./config/db");
require("dotenv").config();
const port = process.env.CLIENT_PORT;
const postController = require("./controllers/post.controllers");

const app = express();
app.use(express.json());

//routes
// app.get("/", async (req, res) => {
//   try {
//     const data = await pool.query("SELECT * FROM posts");
//     res.json(data.rows);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

// app.post("/", async (req, res) => {
//   let { name, age, email } = req.body;
//   console.log("des: ", email);
//   try {
//     const result = await pool.query(
//       "INSERT INTO uses (name, age, email) VALUES ($1, $2, $3) RETURNING *",
//       [name, age, email]
//     );
//     console.log("res: ", result);
//     res.status(200).json({
//       data: result.rows[0],
//     });
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

// app.get("/setup", async (req, res) => {
//   try {
//     // await pool.query(
//     //   "CREATE TABLE posts(id SERIAL PRIMARY KEY, post_title VARCHAR(255), post_content text, published_by FOREIGN KEY refer user(id), post_created_at timestamp   sport_id FOREIGN KEY as refer sport(id), event_id FOREIGN KEY as refer event(id)"
//     // );
//     await pool.query(`
//     CREATE TABLE comments(
//         id SERIAL PRIMARY KEY,
//         posts_id INT REFERENCES posts(id),
//         user_id INT REFERENCES users(id)
//     );
// `);

//     res.status(200).send({ message: "Successfully created table" });
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });
app.use("/api", postController);

app.listen(port, () => console.log(`Server has started on port: ${port}`));
