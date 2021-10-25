const express = require('express');
const chalk = require('chalk');
const postsRouter = express.Router();

postsRouter.use((req, res, next) => {
    console.log(chalk.cyan("A request is being made to /posts"));


    next();
});


const { getAllPosts } = require('../db');
postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});



module.exports = postsRouter;