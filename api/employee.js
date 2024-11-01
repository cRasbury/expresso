const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.param('employeeId', (req, res, next, id) => {
    db.get('SELECT * FROM Employee WHERE id = $id', { $id: id }, (err, employee) => {
        if (!employee) {
            return res.sendStatus(404);
        } else if (err) {
            next(err);
        } else {
            req.employee = employee;
            next();
        }
    });
});

const isValidEmployee = (req, res, next) => {
    toValidate = req.body.employee;
    if (!toValidate.name || !toValidate.position || !toValidate.wage) {
        return res.sendStatus(400);
    } else {
        next();
    }
}

employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ employees: employees });
        }
    });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({ employee: req.employee });
});

employeeRouter.post('/', isValidEmployee, (req, res, next) => {
    const newEmployee = req.body.employee;
    const sql = 'INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)'
    const values = { $name: newEmployee.name, $position: newEmployee.position, $wage: newEmployee.wage };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).send({ employee: employee });
                }
            });
        }
    });
});

employeeRouter.put('/:employeeId', isValidEmployee, (req, res, next) => {
    const reqEmployee = req.body.employee;
    const isCurrentEmployee = reqEmployee.isCurrentEmployee === 0 ? 0 : 1;
    const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isEmployed WHERE id = $id';
    const values = { $name: reqEmployee.name, $position: reqEmployee.position, $wage: reqEmployee.wage, $isEmployed: isCurrentEmployee, $id: req.params.employeeId };
    db.run(sql, values, err => {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Employee WHERE id = $id', { $id: req.params.employeeId }, (err, employee) => {
                res.status(200).send({ employee: employee });
            });
        }
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $id', { $id: req.params.employeeId }, err => {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Employee WHERE id = $id', { $id: req.params.employeeId }, (err, employee) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send({ employee: employee });
                }
            });
        }
    });
});

module.exports = employeeRouter;