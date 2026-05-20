import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { users } from "../src/store";

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
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "lukas@example.com", name: "Lukas", role: "admin" })
      .expect(201);

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
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "lukas@example.com", name: "Lukas", role: "admin" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "alice@example.com", name: "Alice", role: "user" })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get("/api/users/all")
      .expect(200);

    expect(response.body).toEqual([
      { id: 1, email: "lukas@example.com", name: "Lukas", role: "admin" },
      { id: 2, email: "alice@example.com", name: "Alice", role: "user" },
    ]);
  });
});
