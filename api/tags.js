const express = require('express');
const chalk = require('chalk');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
    console.log(chalk.magentaBright("A request is being made to /tags"));


    next();
});


const { getAllTags } = require('../db');
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});



module.exports = tagsRouter;