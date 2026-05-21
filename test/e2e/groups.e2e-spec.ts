import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { groups, users } from "../../src/store";

describe("GroupsController (integration)", () => {
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
    groups.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createUser(
    email: string,
    name: string,
    role: string,
  ): Promise<number> {
    const response = await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email, name, role })
      .expect(201);
    return response.body.id;
  }

  async function createGroup(
    name: string,
    description: string,
  ): Promise<number> {
    const response = await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name, description })
      .expect(201);
    return response.body.id;
  }

  it("POST /api/groups/add-group creates a group and returns 201", async () => {
    await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name: "Admins", description: "Admin group" })
      .expect(201)
      .expect({
        id: 1,
        name: "Admins",
        description: "Admin group",
        userIds: [],
      });
  });

  it("POST /api/groups/add-group returns 400 for invalid payload", async () => {
    await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name: "", description: "" })
      .expect(400);
  });

  it("POST /api/groups/add-group returns 409 for duplicate name", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name: "Admins", description: "Another group" })
      .expect(409);
  });

  it("GET /api/groups/all returns an empty list", async () => {
    await request(app.getHttpServer())
      .get("/api/groups/all")
      .expect(200)
      .expect([]);
  });

  it("GET /api/groups/all returns all groups", async () => {
    await createGroup("Admins", "Admin group");
    await createGroup("Beta", "Beta testers");

    const response = await request(app.getHttpServer())
      .get("/api/groups/all")
      .expect(200);

    expect(response.body).toEqual([
      { id: 1, name: "Admins", description: "Admin group", userIds: [] },
      { id: 2, name: "Beta", description: "Beta testers", userIds: [] },
    ]);
  });

  it("GET /api/groups/get-by-id/:id returns a group", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .get("/api/groups/get-by-id/1")
      .expect(200)
      .expect({
        id: 1,
        name: "Admins",
        description: "Admin group",
        userIds: [],
      });
  });

  it("GET /api/groups/get-by-id/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .get("/api/groups/get-by-id/999")
      .expect(404);
  });

  it("PATCH /api/groups/update/:id updates a group", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .patch("/api/groups/update/1")
      .send({ name: "Super Admins", description: "Updated" })
      .expect(200)
      .expect({
        id: 1,
        name: "Super Admins",
        description: "Updated",
        userIds: [],
      });
  });

  it("PATCH /api/groups/update/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/groups/update/999")
      .send({ name: "Ghost" })
      .expect(404);
  });

  it("PATCH /api/groups/update/:id returns 400 for invalid payload", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .patch("/api/groups/update/1")
      .send({ name: "" })
      .expect(400);
  });

  it("PATCH /api/groups/update/:id returns 409 for duplicate name", async () => {
    await createGroup("Admins", "Admin group");
    await createGroup("Beta", "Beta testers");

    await request(app.getHttpServer())
      .patch("/api/groups/update/2")
      .send({ name: "Admins" })
      .expect(409);
  });

  it("DELETE /api/groups/delete/:id removes a group", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .delete("/api/groups/delete/1")
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/groups/all")
      .expect(200)
      .expect([]);
  });

  it("DELETE /api/groups/delete/:id returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .delete("/api/groups/delete/999")
      .expect(404);
  });

  it("POST /api/groups/:id/add-user/:userId adds a user to a group", async () => {
    const userId = await createUser("lukas@example.com", "Lukas", "admin");
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId}`)
      .expect(201)
      .expect({
        id: 1,
        name: "Admins",
        description: "Admin group",
        userIds: [userId],
      });
  });

  it("POST /api/groups/:id/add-user/:userId returns 404 when group not found", async () => {
    const userId = await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .post(`/api/groups/999/add-user/${userId}`)
      .expect(404);
  });

  it("POST /api/groups/:id/add-user/:userId returns 404 when user not found", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post("/api/groups/1/add-user/999")
      .expect(404);
  });

  it("POST /api/groups/:id/add-user/:userId returns 409 when user already in group", async () => {
    const userId = await createUser("lukas@example.com", "Lukas", "admin");
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId}`)
      .expect(409);
  });

  it("DELETE /api/groups/:id/remove-user/:userId removes a user from a group", async () => {
    const userId = await createUser("lukas@example.com", "Lukas", "admin");
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId}`)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/groups/1/remove-user/${userId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/groups/get-by-id/1")
      .expect(200)
      .expect({
        id: 1,
        name: "Admins",
        description: "Admin group",
        userIds: [],
      });
  });

  it("DELETE /api/groups/:id/remove-user/:userId returns 404 when user not in group", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .delete("/api/groups/1/remove-user/999")
      .expect(404);
  });

  it("DELETE /api/groups/:id/remove-user/:userId returns 404 when group not found", async () => {
    await createUser("lukas@example.com", "Lukas", "admin");

    await request(app.getHttpServer())
      .delete("/api/groups/999/remove-user/1")
      .expect(404);
  });

  it("GET /api/groups/:id/users returns users in a group", async () => {
    const userId1 = await createUser("lukas@example.com", "Lukas", "admin");
    const userId2 = await createUser("alice@example.com", "Alice", "user");
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId1}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/groups/1/add-user/${userId2}`)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get("/api/groups/1/users")
      .expect(200);

    expect(response.body).toEqual([
      { id: userId1, email: "lukas@example.com", name: "Lukas", role: "admin" },
      { id: userId2, email: "alice@example.com", name: "Alice", role: "user" },
    ]);
  });

  it("GET /api/groups/:id/users returns an empty list when no users", async () => {
    await createGroup("Admins", "Admin group");

    await request(app.getHttpServer())
      .get("/api/groups/1/users")
      .expect(200)
      .expect([]);
  });

  it("GET /api/groups/:id/users returns 404 when group not found", async () => {
    await request(app.getHttpServer())
      .get("/api/groups/999/users")
      .expect(404);
  });
});
