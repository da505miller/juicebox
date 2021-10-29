const express = require('express');
const chalk = require('chalk');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const { createPost, updatePost, getPostById } = require('../db');

postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    const postData = { };
    
    const tagArr = tags.trim().split(/\s+/);
    
    postData.title = title;
    postData.content = content;
    postData.authorId = req.user.id;
    
    

    // only send the tags if there are some to send
    if (tagArr.length) {
        postData.tags = tagArr;
    }
    
    
    try {
        // add authorId, title, content to postData object
        
        const post = await createPost(postData);
        if (post) {
            
            res.send({ post });
        }
        else {
            next({
                name: "IncorrectInfo",
                message: 'Error Writing `POST /api/posts'
            });
        }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.use((req, res, next) => {
    console.log(chalk.magentaBright("A request is being made to /posts"));


    next();
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);
        console.log(originalPost.author.id)

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnathorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});


const { getAllPosts } = require('../db');
const usersRouter = require('./users');
postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});



module.exports = postsRouter;