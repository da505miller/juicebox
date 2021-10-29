const express = require('express');
const chalk = require('chalk');
const tagsRouter = express.Router();
const { getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log(chalk.magentaBright("A request is being made to /tags"));


    next();
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // read the tagname from the params
    const { tagName } = req.params;

    try {
        
        // use our method to get posts by tag name from the db
        const postList = await getPostsByTagName(tagName);
        // send out an object to the client { posts: // the posts }
        
        const filteredPosts = postList.filter(post => {

            if (post.active) {
                return true;
            }

            if (req.user && post.author.id === req.user.id) {
                return true;
            }

            return false;

        });

        if (filteredPosts) {
            console.log(filteredPosts);

            res.send({ posts: filteredPosts })
        
        } else {
            next({
                name: 'ErrorGettingPostByTag',
                message: 'Cannot get posts by tag name'
            })
        }
    }
    catch ({ name, message }) {
        // forward the name and message to the error handler
        next({ name, message });

    }
});


const { getAllTags } = require('../db');
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
    console.log(chalk.cyanBright("Tags: "), tags);

    res.send({
        tags
    });
});



module.exports = tagsRouter;