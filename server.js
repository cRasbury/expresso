const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const logger = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());

if (!process.env.IS_TEST_ENV) {
    app.use(logger('dev'));
}

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = app;