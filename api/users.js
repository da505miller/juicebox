const express = require('express');
const chalk = require('chalk');
const usersRouter = express.Router();
const log = console.log;


usersRouter.use((req, res, next) => {
    log(chalk.cyan("A request is being made to /users"));


    next();
});



const { getAllUsers } = require('../db');
usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

module.exports = usersRouter;