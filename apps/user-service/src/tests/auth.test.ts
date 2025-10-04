import request from "supertest";
import app from "../server.js"
import prisma from "../lib/prisma.js";


// beforeAll(async () => {
//     // clean DB before tests
//     await prisma.user.deleteMany()
//     await prisma.session.deleteMany()
// });

describe("Auth Flow", () => {
    const testUser = {
        email: "testemail@gmail.com",
        password: "StrongPassword123!",
        name: "testUser"
    }

    let accessToken: string
    let RefreshToken: string

    it("should register a new user", async () => {
        const res = await request(app).post("/v1/auth/register").send(testUser)
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testUser.email)
    });

    it("should login the user with correct credentials", async () => {
        const res = await request(app).post("/v1/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeDefined()

        accessToken = res.body.accessToken;
        
        const setCookieHeader = res.headers["set-cookie"];
        if (!setCookieHeader) {
            throw new Error("set-cookie header missing in response")
        }

        const cookie = setCookieHeader[0];
        if (!cookie) {
            throw new Error("Cookie not found in setCookieHeader");
        }

        RefreshToken = cookie.split(",")[0]?.split("=")[1]!;
        expect(RefreshToken).toBeDefined();
    });

    it("should refresh token using refresh cookie", async () => {
        const res = await request(app).post("/v1/auth/refresh").set("Cookie", [`refreshToken=${RefreshToken}`]);
        expect(res.status).toBe(200)
        expect(res.body.accessToken).toBeDefined()

    });

    it("should logout and clear Refresh cookie", async () => {
        const res = await request(app).post("/v1/auth/logout").set("Cookie", [`refreshToken=${RefreshToken}`]);
        expect(res.status).toBe(200)
        expect(res.body.message).toBe("Logged out successfully")
    });
});

