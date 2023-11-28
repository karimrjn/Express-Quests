const database = require("../../database");

const getUsers = (req, res) => {
  const { language, city } = req.query;

  let query = "SELECT * FROM users";

  if (language) {
    query += " WHERE language = ?";
  }

  if (city) {
    query += language ? " AND city = ?" : " WHERE city = ?";
  }

  const queryParams = language && city ? [language, city] : [language || city];

  database
    .query(query, queryParams)
    .then(([users]) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};


const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([users]) => {
      if (users[0] !== undefined) {
        res.json(users[0]);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language } = req.body;

  database
    .query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
      res.status(201).send({ id: result.insertId });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language } = req.body;

  if (!id || !firstname || !lastname || !email || !city || !language) {
    return res.status(400).json({ error: 'Bad Request. Missing required fields.' });
  }

  database
    .query(
      "UPDATE users SET firstname=?, lastname=?, email=?, city=?, language=? WHERE id=?",
      [firstname, lastname, email, city, language, id]
    )
    .then(([result]) => {
      if (result.affectedRows > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error.' });
    });
};


const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("delete from users where id = ?", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
};