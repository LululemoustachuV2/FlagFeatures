import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { environments } from "../../src/store";

describe("EnvironmentsController (integration)", () => {
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
    environments.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createEnvironment(
    name: string,
    description: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name, description })
      .expect(201);
  }

  it("POST /api/environments/add-environment creates an environment and returns 201", async () => {
    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
      .expect(201)
      .expect({ name: "prod", description: "Production" });
  });

  it("POST /api/environments/add-environment returns 400 for invalid payload", async () => {
    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "", description: "" })
      .expect(400);
  });

  it("POST /api/environments/add-environment returns 409 for duplicate name", async () => {
    await createEnvironment("prod", "Production");

    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Another prod" })
      .expect(409);
  });

  it("GET /api/environments/all returns an empty list", async () => {
    await request(app.getHttpServer())
      .get("/api/environments/all")
      .expect(200)
      .expect([]);
  });

  it("GET /api/environments/all returns all environments", async () => {
    await createEnvironment("prod", "Production");
    await createEnvironment("staging", "Staging");

    const response = await request(app.getHttpServer())
      .get("/api/environments/all")
      .expect(200);

    expect(response.body).toEqual([
      { name: "prod", description: "Production" },
      { name: "staging", description: "Staging" },
    ]);
  });

  it("GET /api/environments/get-by-name/:name returns an environment", async () => {
    await createEnvironment("prod", "Production");

    await request(app.getHttpServer())
      .get("/api/environments/get-by-name/prod")
      .expect(200)
      .expect({ name: "prod", description: "Production" });
  });

  it("GET /api/environments/get-by-name/:name returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .get("/api/environments/get-by-name/unknown")
      .expect(404);
  });

  it("PATCH /api/environments/update/:name updates an environment", async () => {
    await createEnvironment("prod", "Production");

    await request(app.getHttpServer())
      .patch("/api/environments/update/prod")
      .send({ description: "Production updated" })
      .expect(200)
      .expect({ name: "prod", description: "Production updated" });
  });

  it("PATCH /api/environments/update/:name can rename an environment", async () => {
    await createEnvironment("prod", "Production");

    await request(app.getHttpServer())
      .patch("/api/environments/update/prod")
      .send({ name: "production", description: "Production" })
      .expect(200)
      .expect({ name: "production", description: "Production" });
  });

  it("PATCH /api/environments/update/:name returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/environments/update/unknown")
      .send({ description: "Ghost" })
      .expect(404);
  });

  it("PATCH /api/environments/update/:name returns 409 for duplicate name", async () => {
    await createEnvironment("prod", "Production");
    await createEnvironment("staging", "Staging");

    await request(app.getHttpServer())
      .patch("/api/environments/update/staging")
      .send({ name: "prod" })
      .expect(409);
  });

  it("DELETE /api/environments/delete/:name removes an environment", async () => {
    await createEnvironment("prod", "Production");

    await request(app.getHttpServer())
      .delete("/api/environments/delete/prod")
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/environments/all")
      .expect(200)
      .expect([]);
  });

  it("DELETE /api/environments/delete/:name returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .delete("/api/environments/delete/unknown")
      .expect(404);
  });
});
