"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/*POST / { job }  => { job }
*
* job should be { title, salary, equity, companyHandle}
*
* Returns {title, salary, equity, companyHandle }
*
*Authorization required: None
*/

router.post("/", ensureAdmin, async function (req,res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid) {
            const errs = validator.errs.map((e)=>e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch(err) {
        return next(err);
    }
})

/* GET / =>  
* JSON response {job: [ { title, salary, equity, companyHandle}]}
*
* This can be filtered with the following:
* - title Case Insensitive partial string matching 
* - minSalary
* - hasEquity
*
* Authorization required: none
*/ 
router.get("/", async function (req, res, next) {
    try {
        let query = req.query;
        if(query.minSalary != undefined) query.minSalary = +req.query.minSalary;
        if(query.hasEquity != undefined) query.hasEquity = true; 
        
        const validator = jsonschema.validate(query, jobSearchSchema);
        if(!validator.valid){
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        console.log(query);
        
        const jobs = await Job.findAll(query);

        return res.json({ jobs });
    }
    catch(err) {
        return next(err);
    }
});

/* GET /[title] => { job } =>
* Job is {title, salary, equity, companyHandle}
* where jobs is [{title, salary, equity, companyHandle}]
*
*
*
*
*
*
*/


router.get("/:title", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.title);
        return res.json({ job });
    } catch(err){
        return next(err);
    }
});

/*PATCH /[title] {salary, equity, company_handle} = > { job } 
*
* Patches the job data.
*
* fields can be: {title, salary, equity, company_handle }
*
* Returns {title, salary, equity, company_handle}
*
*Authorization required: Admin
*
*/

router.patch("/:title", ensureAdmin, async function (req, res, next) {
    try { console.log(req.body);
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if(!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.title, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});


/* DELETE /[title] => { deleted: title} 
*
*
*Authorization required: Admin
*
*/

router.delete("/:title", ensureAdmin, async function (req, res, next) {
    try {
        await Job.delete(req.params.title);
        return res.json({ deleted: req.params.title });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;