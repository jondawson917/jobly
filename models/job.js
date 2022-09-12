const { company } = require("faker/lib/locales/az");
const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { Company } = require("./company");
/*Functions for jobs */

class Job {
  /*User sends a job title in the query and 
        returns the title, salary, equity, companyHandle
        
        Throws NotFound error if not found
        */

  static async get(title) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title = $1`,
      [title]
    );
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /*Create a job from data, update database, return new job data
    
    data incldues title, salary, equity, and companyhandle
    
    companyhandle references Company table*/

  /*Find all jobs, find job by title, update jobs, and delete a job */

  static async create({ title, salary, equity, companyHandle }) {
    
    const dupeCheck_job = await db.query(
      `SELECT title FROM jobs WHERE title = $1`,
      [title]
    );
    const dupeCheck_company = await db.query(
      `SELECT handle FROM companies WHERE handle = $1`,
      [companyHandle]
    );
/*Error handling duplicate job*/
    if (dupeCheck_job.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);
/*Error handling company that doesn't exist on the reference table*/

    if (!dupeCheck_company.rows[0])
      throw new BadRequestError(
        `Company doesn't exist on table: ${companyHandle}`
      );

    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    
    return job;
  }

  static async findAll(searchTerms = {}) {
    let sqlQuery = `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs`;

    const { title, minSalary, hasEquity } = searchTerms;
    let values = [];
    let expression = [];
    
    if (minSalary) {
      /*Add the minimum salary to job filter*/
      values.push(minSalary);
      expression.push(`salary >= $${values.length}`);
    }
    if (hasEquity) {
      expression.push(`equity > 0`);
    }
    if (title) {
      values.push(`%${title}%`);
      expression.push(`title ILIKE $${values.length}`);
    }
    if (values.length > 0) {
      sqlQuery += " WHERE " + expression.join(" AND ") + " ORDER BY title";
      
      const jobRes = await db.query(sqlQuery, values);
      
      return jobRes.rows;
    }
    const jobRes = await db.query(sqlQuery);
    return jobRes.rows;
  }




  /*Update the job `table`. 
        *
        This is a partial update returning the title, salary, equity, and companyHandle
        
        Throws a NotFounderror if not found*/
  /*REVIEW REVIEW REVIEW REVIEW REVIEW REVIEW */
  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    
    
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                                  SET ${setCols}
                                  WHERE title = ${handleVarIdx}
                                  RETURNING title, salary, equity, company_handle AS "companyHandle"`;
    
   
    const result = await db.query(querySql, [...values, title]);
    
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
    return job;
  }
  /*Remove the job matching the title from the database table*/

  static async delete(title) {
    const result = await db.query(
      `DELETE
       FROM jobs
       WHERE title = $1
       RETURNING jobs`,
      [title]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}
module.exports = Job;
