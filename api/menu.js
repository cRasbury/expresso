const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menu-item');
menuRouter.use('/:menuId/menu-items', menuItemRouter);

module.exports = menuRouter;