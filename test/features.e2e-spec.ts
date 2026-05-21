import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { environments, features } from "../src/store";

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
    environments.length = 0;
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

  async function seedFeatureAndEnv(): Promise<void> {
    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Theme sombre",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
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

  it("PATCH /api/features/update/:key updates a feature", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .patch("/api/features/update/dark-mode")
      .send({ name: "Dark Mode v2", description: "Updated theme" })
      .expect(200)
      .expect({
        key: "dark-mode",
        name: "Dark Mode v2",
        description: "Updated theme",
      });
  });

  it("PATCH /api/features/update/:key can rename a feature key", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .patch("/api/features/update/dark-mode")
      .send({ key: "dark-mode-v2", name: "Dark Mode", description: "Theme" })
      .expect(200)
      .expect({
        key: "dark-mode-v2",
        name: "Dark Mode",
        description: "Theme",
      });
  });

  it("PATCH /api/features/update/:key returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/features/update/unknown")
      .send({ name: "Ghost" })
      .expect(404);
  });

  it("PATCH /api/features/update/:key returns 409 for duplicate key", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");
    await createFeature("beta-ui", "Beta UI", "New interface");

    await request(app.getHttpServer())
      .patch("/api/features/update/beta-ui")
      .send({ key: "dark-mode" })
      .expect(409);
  });

  it("PATCH /api/features/update/:key returns 400 for invalid payload", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .patch("/api/features/update/dark-mode")
      .send({ name: "" })
      .expect(400);
  });

  it("PATCH /api/features/:key/enable enables a feature", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .patch("/api/features/dark-mode/enable")
      .expect(200)
      .expect({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
        enabled: true,
      });
  });

  it("PATCH /api/features/:key/enable returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/features/unknown/enable")
      .expect(404);
  });

  it("PATCH /api/features/:key/disable disables a feature", async () => {
    await createFeature("dark-mode", "Dark Mode", "Enable dark theme");

    await request(app.getHttpServer())
      .patch("/api/features/dark-mode/enable")
      .expect(200);

    await request(app.getHttpServer())
      .patch("/api/features/dark-mode/disable")
      .expect(200)
      .expect({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Enable dark theme",
        enabled: false,
      });
  });

  it("PATCH /api/features/:key/disable returns 404 when not found", async () => {
    await request(app.getHttpServer())
      .patch("/api/features/unknown/disable")
      .expect(404);
  });

  it("PUT /api/features/:key/environments/:env/config sets config and returns 200", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({
        enabled: true,
        rollout: 50,
        allowedGroups: [1, 2],
        allowedUsers: [10],
      })
      .expect(200)
      .expect({
        enabled: true,
        rollout: 50,
        allowedGroups: [1, 2],
        allowedUsers: [10],
      });
  });

  it("PUT /api/features/:key/environments/:env/config overwrites existing config", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({
        enabled: true,
        rollout: 100,
        allowedGroups: [],
        allowedUsers: [],
      })
      .expect(200);

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({
        enabled: false,
        rollout: 0,
        allowedGroups: [3],
        allowedUsers: [],
      })
      .expect(200)
      .expect({
        enabled: false,
        rollout: 0,
        allowedGroups: [3],
        allowedUsers: [],
      });
  });

  it("PUT /api/features/:key/environments/:env/config returns 404 when feature not found", async () => {
    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
      .expect(201);

    await request(app.getHttpServer())
      .put("/api/features/unknown/environments/prod/config")
      .send({ enabled: true, rollout: 50, allowedGroups: [], allowedUsers: [] })
      .expect(404);
  });

  it("PUT /api/features/:key/environments/:env/config returns 404 when environment not found", async () => {
    await createFeature("dark-mode", "Dark Mode", "Theme sombre");

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/staging/config")
      .send({ enabled: true, rollout: 50, allowedGroups: [], allowedUsers: [] })
      .expect(404);
  });

  it("PUT /api/features/:key/environments/:env/config returns 400 for invalid payload", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({ enabled: true, rollout: 150, allowedGroups: [], allowedUsers: [] })
      .expect(400);
  });

  it("GET /api/features/:key/environments/:env/config returns config", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({
        enabled: true,
        rollout: 75,
        allowedGroups: [1],
        allowedUsers: [2],
      })
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/environments/prod/config")
      .expect(200)
      .expect({
        enabled: true,
        rollout: 75,
        allowedGroups: [1],
        allowedUsers: [2],
      });
  });

  it("GET /api/features/:key/environments/:env/config returns 404 when config not found", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/environments/prod/config")
      .expect(404);
  });

  it("GET /api/features/:key/environments/:env/config returns 404 when feature not found", async () => {
    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
      .expect(201);

    await request(app.getHttpServer())
      .get("/api/features/unknown/environments/prod/config")
      .expect(404);
  });

  it("DELETE /api/features/:key/environments/:env/config removes config", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({ enabled: true, rollout: 50, allowedGroups: [], allowedUsers: [] })
      .expect(200);

    await request(app.getHttpServer())
      .delete("/api/features/dark-mode/environments/prod/config")
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/environments/prod/config")
      .expect(404);
  });

  it("DELETE /api/features/:key/environments/:env/config returns 404 when config not found", async () => {
    await seedFeatureAndEnv();

    await request(app.getHttpServer())
      .delete("/api/features/dark-mode/environments/prod/config")
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
