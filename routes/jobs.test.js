"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  youToken
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "Procreationist",
        salary: 80000,
        equity: 0.011,
        company_handle: 'c1'
    };

    test("ok for admin users", async function () {
        const resp = await request(app)
        .post("/jobs")
        .send("authorization", `Bearer ${youToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        job: newJob,
    });
    });

    test("not ok for unauthorized users", async function (){
        const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: 0, equity: 1.23,
            company_handle: "perez-miller"}).set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(400);
        });
        test("bad request with missing data", async function (){
            const resp = await request(app)
            .post("/jobs")
            .send({salary: 20000, equity: 0.111, company_handle: 'c1' }).set("authorization", `Bearer ${youToken}`);
        expect(resp.statusCode).toEqual(400);
        });
        test("bad request with invalid data", async function () {
            const resp = await request(app)
                .post("/jobs")
                .send({...newJob, salary: 85000.1}).set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(400);
            });
        });
    /************************************** GET /jobs */

    describe("GET /jobs", function () {
        test("ok for anon", async function () {
            const resp = await request(app).get("/jobs");
            expect(resp.body).toEqual({
                jobs: [
                    {
                        title: 'j1',
                        salary: 100, 
                        equity: 0.001,
                        companyHandle: 'c1' 
                    },
                    {
                        title: 'j2',
                        salary: 500,
                        equity: 0.000,
                        companyHandle: 'c2'
                    }
                ]
            });
        
        });
        test("fails: test next() handler", async function () {
            const resp = await request(app).get("/jobs").set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(500);
        });
    });
/************************************** GET /jobs/:title */

describe("GET /jobs/:title", function () {


    test("works for admin", async function () {
        const resp = await request(app).get(`/jobs/j1`).set("authorization", `Bearer ${youToken}`);
        expect(resp.body).toEqual({
            job: {
                title: 'j1',
                salary: 100,
                equity: 0.001,
                companyHandle: 'c1'
            }
        });
    });
});
    // test("works for admin: job w/o applications", async function () {
    //     const resp = await request(app).get(`/jobs/j2`).set("authorization", `Bearer ${youToken}`);
    //     expect(resp.body).toEqual({
    //         job: {
    //             title: 'j2',
    //             salary: 500,
    //             equity: 0.000,
    //             companyHandle: 'c2'
    //         }
    //     });
    // });
    test("not found for an non-existing job", async function () {
        const resp = await request(app).get(`/jobs/nope`).set("authorization", `Bearer ${youToken}`);
        expect(resp.statusCode).toEqual(404);
    });
    /************************************** PATCH /jobs/:title */

    describe("PATCH /jobs/:title", function () {
        test("works for admins", async function () {
            const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                title: "Proctologist"
            });
            expect(resp.body).toEqual({
                job: {
                    title: 'Proctologist',
                    salary: 100,
                    equity: 0.001,
                    companyHandle: 'c1'
                }
            });
        });
        test("unauth for anon", async function () {
            const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                title: 'j1-new'
            });
            expect(resp.statusCode).toEqual(401);
        });

        test("not found - job doesn't exist", async function () {
            const resp = await request(app)
            .patch(`/jobs/nope`)
            .send({
                title: 'nope directors cut'
            }).set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(404);
        });

        test("bad request on company handle change attempt", async function (){
            const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                title: "j1-new"
            }).set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(400);
        }); 
        test("bad request on id change attempt", async function () {
            const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                id: 22
            }).set("authorization", `Bearer ${youToken}`);
            expect(resp.statusCode).toEqual(400);
        });
        test("bad request on invalid data", async function () {
            const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                equity: -22
            }).set("authorization", `Bearer ${youToken}`);
        });
/************************************** DELETE /jobs/:title */

describe("DELETE /jobs/:title", function () {
    test("works for admin", async function () {
        const resp = await request(app)
        .delete(`/jobs/j1`)
        .set("authorization", `Bearer ${youToken}`);
        expect(resp.body).toEqual({deleted: 'j1'});
    });

    test("unauthorized for anonymous", async function () {
        const resp = await request(app)
        .delete(`/jobs/j1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for non-existing job", async function () {

        const resp = await request(app)
        .delete(`/jobs/nope`)
        .set("authorization", `Bearer ${youToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});


});