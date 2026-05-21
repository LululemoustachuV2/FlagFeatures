import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { users } from "../../src/store";

describe("UsersController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  beforeEach(() => {
    users.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createUser(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email, name, role })
      .expect(201);
  }

  it("POST /api/users/add-user creates a user and returns 201", async () => {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "lukas@example.com", name: "Lukas", role: "admin" })
      .expect(201)
      .expect({
        id: 1,
        email: "lukas@example.com",
        name: "Lukas",
        role: "admin",
      });
  });

  it("POST /api/users/add-user returns 400 for invalid payload", async () => {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "not-an-email", name: "", role: "admin" })
      .expect(400);
  });

  it("POST /api/users/add-user returns 409 for duplicate email", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "lukas@example.com", name: "Other", role: "user" })
      .expect(409);
  });

  it("GET /api/users/all returns an empty list", async () => {
    await request(app.getHttpServer())
      .get("/api/users/all")
      .expect(200)
      .expect([]);
  });

  it("GET /api/users/all returns all users", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");
    await createUser("alice@example.com", "Alice", "user");

    const response = await request(app.getHttpServer())
      .get("/api/users/all")
      .expect(200);

    expect(response.body).toEqual([
      { id: 1, email: "lukas@example.com", name: "Lukas", role: "admin" },
      { id: 2, email: "alice@example.com", name: "Alice", role: "user" },
    ]);
  });

  it("GET /api/users/get-by-id/:id returns a user", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .get("/api/users/get-by-id/1")
      .expect(200)
      .expect({
        id: 1,
        email: "lukas@example.com",
        name: "Lukas",
        role: "admin",
      });
  });

  it("GET /api/users/get-by-id/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .get("/api/users/get-by-id/999")
      .expect(404);
  });

  it("PATCH /api/users/update/:id updates a user", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .patch("/api/users/update/1")
      .send({ name: "Lukas Updated", role: "user" })
      .expect(200)
      .expect({
        id: 1,
        email: "lukas@example.com",
        name: "Lukas Updated",
        role: "user",
      });
  });

  it("PATCH /api/users/update/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/users/update/999")
      .send({ name: "Ghost" })
      .expect(404);
  });

  it("PATCH /api/users/update/:id returns 409 for duplicate email", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");
    await createUser("alice@example.com", "Alice", "user");

    await request(app.getHttpServer())
      .patch("/api/users/update/2")
      .send({ email: "lukas@example.com" })
      .expect(409);
  });

  it("PATCH /api/users/update/:id returns 400 for invalid payload", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .patch("/api/users/update/1")
      .send({ email: "not-an-email" })
      .expect(400);
  });

  it("DELETE /api/users/delete/:id removes a user", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .delete("/api/users/delete/1")
      .expect(204);

    await request(app.getHttpServer()).get("/api/users/all").expect(200).expect([]);
  });

  it("DELETE /api/users/delete/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .delete("/api/users/delete/999")
      .expect(404);
  });
});
