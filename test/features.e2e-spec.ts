import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { features } from "../src/store";

describe("FeaturesController (integration)", () => {
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
    features.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createFeature(
    key: string,
    name: string,
    description: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({ key, name, description })
      .expect(201);
  }

  it("POST /api/features/add-feature creates a feature and returns 201", async () => {
    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
      })
      .expect(201)
      .expect({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
      });
  });

  it("POST /api/features/add-feature returns 400 for invalid payload", async () => {
    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({ key: "", name: "", description: "" })
      .expect(400);
  });

  it("POST /api/features/add-feature returns 409 for duplicate key", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({
        key: "dark-mode",
        name: "Other",
        description: "Duplicate key",
      })
      .expect(409);
  });

  it("GET /api/features/all returns an empty list", async () => {
    await request(app.getHttpServer())
      .get("/api/features/all")
      .expect(200)
      .expect([]);
  });

  it("GET /api/features/all returns all features", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");
    await createFeature("beta-ui", "Beta UI", "New interface");

    const response = await request(app.getHttpServer())
      .get("/api/features/all")
      .expect(200);

    expect(response.body).toEqual([
      {
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
      },
      {
        key: "beta-ui",
        name: "Beta UI",
        description: "New interface",
      },
    ]);
  });

  it("GET /api/features/get-by-key/:key returns a feature", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .get("/api/features/get-by-key/dark-mode")
      .expect(200)
      .expect({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
      });
  });

  it("GET /api/features/get-by-key/:key returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .get("/api/features/get-by-key/unknown")
      .expect(404);
  });

  it("DELETE /api/features/delete/:key removes a feature", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .delete("/api/features/delete/dark-mode")
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/features/all")
      .expect(200)
      .expect([]);
  });

  it("DELETE /api/features/delete/:key returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .delete("/api/features/delete/unknown")
      .expect(404);
  });
});
