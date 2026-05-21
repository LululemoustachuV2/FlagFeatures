import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { environments, features, groups, users } from "../../src/store";

describe("FeaturesController evaluate (integration)", () => {
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
    features.length = 0;
    environments.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedEvaluateScenario(): Promise<void> {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "lukas@test.com", name: "Lukas", role: "admin" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name: "Beta", description: "Beta testers" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({
        key: "dark-mode",
        name: "Dark Mode",
        description: "Theme sombre",
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch("/api/features/dark-mode/enable")
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
      .expect(201);

    await request(app.getHttpServer())
      .put("/api/features/dark-mode/environments/prod/config")
      .send({
        enabled: true,
        rollout: 0,
        allowedGroups: [],
        allowedUsers: [1],
      })
      .expect(200);
  }

  it("GET /api/features/:key/evaluate returns enabled for allowed user", async () => {
    await seedEvaluateScenario();

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/evaluate")
      .query({ userId: 1, env: "prod" })
      .expect(200)
      .expect({
        feature: "dark-mode",
        enabled: true,
        reason: "User is explicitly allowed",
      });
  });

  it("GET /api/features/:key/evaluate returns disabled when feature is globally disabled", async () => {
    await seedEvaluateScenario();

    await request(app.getHttpServer())
      .patch("/api/features/dark-mode/disable")
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/evaluate")
      .query({ userId: 1, env: "prod" })
      .expect(200)
      .expect({
        feature: "dark-mode",
        enabled: false,
        reason: "Feature is disabled globally",
      });
  });

  it("GET /api/features/:key/evaluate returns 404 when feature not found", async () => {
    await request(app.getHttpServer())
      .get("/api/features/unknown/evaluate")
      .query({ userId: 1, env: "prod" })
      .expect(404);
  });

  it("GET /api/features/:key/evaluate returns 404 when user not found", async () => {
    await seedEvaluateScenario();

    await request(app.getHttpServer())
      .get("/api/features/dark-mode/evaluate")
      .query({ userId: 999, env: "prod" })
      .expect(404);
  });
});
