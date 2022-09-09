"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Street Sweeper",
    salary: 123000,
    equity: 0.987,
    companyHandle: "c1",
  };

  test("create function operates properly", async function () {
    let job = await Job.create(newJob);
    console.log(job);
    expect(job).toEqual({
      title: "Street Sweeper",
      salary: 123000,
      equity: "0.987",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE title = 'Street Sweeper'`
    );
    expect(result.rows).toEqual([
     { title: "Street Sweeper",
      salary: 123000,
      equity: "0.987",
      companyHandle: "c1"}
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll no filter*/

describe("findAll", function () {
  test("operates: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 100,
        equity: "0.001",
        companyHandle: "c1",
      },
      {
        title: "j2",
        salary: 500,
        equity: "0.000",
        companyHandle: "c2",
      },
    ]);
  });
  /***********************************findAll with query filter*/
  describe("findAll with query filters", function () {
    test("operates with filter", async function () {
      let query = { maxSalary: 200, hasEquity: true, title: "j" };
      let jobs = await Job.findAll(query);
      expect(jobs).toEqual([
        {
          title: "j1",
          salary: 100,
          equity: "0.001",
          companyHandle: "c1",
        },
      ]);
    });
  });
  /************************************** get a single job*/
  describe("get single job", function () {
    test("works", async function () {
      let job = await Job.get("j1");
      expect(job).toEqual({
        title: "j1",
        salary: 100,
        equity: "0.001",
        companyHandle: "c1",
      });
    });
  });
  test("not found if company doesn't exist", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************** update job details */

describe("update", function () {
  const updateData = {
    salary: 100000,
    equity: 0.954,
    company_handle: "c2",
  };

  test("operates properly", async function () {
    let job = await Job.update("j1", updateData);
    expect(job).toEqual({
      title: 'j1',
      salary: 100000,
      equity: "0.954", companyHandle: "c2"
    });
    const result = await db.query(
      `SELECT title, salary, equity, company_handle as "companyHandle" FROM jobs WHERE title = 'j1'`
    );
    expect(result.rows).toEqual([
      {
        title: "j1",
        salary: 100000,
        equity: "0.954",
        companyHandle: "c2",
      },
    ]);
  });

  test("operates properly: null fields ", async function () {
    const updateDataSetNulls = {
      title: 'j1',
            salary: null,
      equity: null,
      companyHandle: 'c1'
    };

    let job = await Job.update("j1", updateDataSetNulls);
    expect(job).toEqual({
      
      ...updateDataSetNulls
      
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle" WHERE title = 'j1'`
    );
    expect(result.rows).toEqual([
      {
        title: "j1",
        salary: null,
        equity: null,
      },
    ]);
  });

  test("not found if company doesn't exist", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request without data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
/************************************** delete a job */

describe("delete a job", function () {
  test("function operates properly", async function () {
    await Job.delete("j1");
    const res = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle" from jobs WHERE title = 'j1'`
    );
    expect(res.rows.length).toEqual(0);
  });
  test("job not found if it doesn't exist", async function () {
    try {
      await Job.delete("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
