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
        console.log("Original post authorId is ", originalPost.author.id)

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            console.log(updatedPost);
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

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost });
        } else {
            // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours!!!"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }
    }
    catch ({ name, message }) {
        next({ name, message })
    }
});


const { getAllPosts } = require('../db');
const usersRouter = require('./users');
postsRouter.get('/', async (req, res) => {
    try {

    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
        // keep a post if it is either active, or if it belongs to the current user
        // if the post is active - doesn't matter who it belongs to
        if (post.active) {
            return true;
        }

        // if the post is not active, but it belongs to the current user
        if (req.user && post.author.id === req.user.id) {
            return true;
        }

        // if none of the above are true
        return false;
    });
    
    res.send({
        posts
    });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});



module.exports = postsRouter;