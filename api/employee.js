const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

module.exports = employeeRouter;