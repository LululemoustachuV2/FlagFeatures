import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import {
  auditLogs,
  environments,
  features,
  groups,
  users,
} from "../../src/store";

describe("Audit logs (integration)", () => {
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
    auditLogs.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/audit-logs returns all audit entries with required fields", async () => {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "a@test.com", name: "Alice", role: "admin" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({ key: "flag-a", name: "Flag A", description: "Test" })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get("/api/audit-logs")
      .expect(200);

    expect(response.body).toHaveLength(2);
    for (const log of response.body) {
      expect(log).toMatchObject({
        id: expect.any(Number),
        action: expect.any(String),
        resource: expect.any(String),
        timestamp: expect.any(String),
        details: expect.any(Object),
      });
      expect(new Date(log.timestamp).toString()).not.toBe("Invalid Date");
    }

    const actions = response.body.map((log: { action: string }) => log.action);
    expect(actions).toContain("user.created");
    expect(actions).toContain("feature.created");
  });

  it("GET /api/features/:key/audit-logs returns only logs for that feature", async () => {
    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({ key: "alpha", name: "Alpha", description: "A" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/features/add-feature")
      .send({ key: "beta", name: "Beta", description: "B" })
      .expect(201);

    await request(app.getHttpServer())
      .patch("/api/features/alpha/enable")
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/environments/add-environment")
      .send({ name: "prod", description: "Production" })
      .expect(201);

    await request(app.getHttpServer())
      .put("/api/features/alpha/environments/prod/config")
      .send({
        enabled: true,
        rollout: 100,
        allowedGroups: [],
        allowedUsers: [],
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get("/api/features/alpha/audit-logs")
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(
      response.body.every(
        (log: { featureKey?: string }) => log.featureKey === "alpha",
      ),
    ).toBe(true);

    const actions = response.body.map((log: { action: string }) => log.action);
    expect(actions).toContain("feature.created");
    expect(actions).toContain("feature.enabled");
    expect(actions).toContain("feature.config.updated");

    const betaLogs = await request(app.getHttpServer())
      .get("/api/features/beta/audit-logs")
      .expect(200);

    expect(betaLogs.body).toHaveLength(1);
    expect(betaLogs.body[0].action).toBe("feature.created");
  });

  it("GET /api/features/:key/audit-logs returns 404 when feature does not exist", async () => {
    await request(app.getHttpServer())
      .get("/api/features/missing/audit-logs")
      .expect(404);
  });

  it("records user and group membership audit events", async () => {
    await request(app.getHttpServer())
      .post("/api/users/add-user")
      .send({ email: "bob@test.com", name: "Bob", role: "user" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/groups/add-group")
      .send({ name: "Team", description: "Team group" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/groups/1/add-user/1")
      .expect(201);

    await request(app.getHttpServer())
      .delete("/api/groups/1/remove-user/1")
      .expect(204);

    const response = await request(app.getHttpServer())
      .get("/api/audit-logs")
      .expect(200);

    const actions = response.body.map((log: { action: string }) => log.action);
    expect(actions).toContain("user.created");
    expect(actions).toContain("group.user.added");
    expect(actions).toContain("group.user.removed");
  });
});
