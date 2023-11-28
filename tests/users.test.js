const crypto = require("node:crypto");
const request = require("supertest");
const app = require("../src/app");
const database = require("../database");

afterAll(() => database.end());

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.firstname).toEqual(newUser.firstname);
    expect(response.body.lastname).toEqual(newUser.lastname);
    expect(response.body.email).toEqual(newUser.email);
    expect(response.body.city).toEqual(newUser.city);
    expect(response.body.language).toEqual(newUser.language);
  });
});

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "John",
      lastname: "Doe",
      email: `${crypto.randomUUID()}@example.com`,
      city: "New York",
      language: "English",
    };

    const [insertResult] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = insertResult.insertId;

    const updatedUser = {
      firstname: "Alice",
      lastname: "Smith",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "London",
      language: "English",
    };

    const updateResponse = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(updateResponse.status).toEqual(204);

    const [resultUpdate] = await database.query(
      "SELECT * FROM users WHERE id=?",
      id
    );

    const [userInDatabase] = resultUpdate;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Bob" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "John",
      lastname: "Doe",
      email: `${crypto.randomUUID()}@example.com`,
      city: "New York",
      language: "English",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});
