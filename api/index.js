const express = require('express');
const apiRouter = express.Router();
const chalk = require('chalk');

// Before we start attaching our routers

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) { // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);

        
        
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

// This router goes before the others
apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log(chalk.cyan("User is set:"), req.user);
    }
  
    next();
  });

// Attach routers below here

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

// all routers attached ABOVE here
apiRouter.use((error, req, res, next) => {
    res.send(error);
  });


module.exports = apiRouter;