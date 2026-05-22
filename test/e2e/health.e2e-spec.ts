import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";

describe("HealthController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/health returns 200", async () => {
    await request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ status: "ok" });
  });

  it("GET /api/version returns 200", async () => {
    await request(app.getHttpServer())
      .get("/api/version")
      .expect(200)
      .expect({ version: "2.0.0" });
  });

  it("GET /api/unknown returns 404", async () => {
    await request(app.getHttpServer()).get("/api/unknown").expect(404);
  });

  it("POST /api/health returns 404", async () => {
    await request(app.getHttpServer()).post("/api/health").send({}).expect(404);
  });

  it("POST /api/version returns 404", async () => {
    await request(app.getHttpServer()).post("/api/version").send({}).expect(404);
  });

  it("DELETE /api/health returns 404", async () => {
    await request(app.getHttpServer()).delete("/api/health").expect(404);
  });

  it("PATCH /api/version returns 404", async () => {
    await request(app.getHttpServer())
      .patch("/api/version")
      .send({ version: "2.0.0" })
      .expect(404);
  });
});
