const express = require('express');
const chalk = require('chalk');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');



usersRouter.use((req, res, next) => {
    console.log(chalk.magentaBright("A request is being made to /users"));

            
    next();
});

const { getUserByUsername } = require('../db');
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // request must have both
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const  user  = await getUserByUsername(username);

        if (user && user.password == password) {
            // create token and return to user
            const token = jwt.sign({ 
                id: user.id, 
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
        });
            
            res.send({ message: "You're logged in!",
                       token });
        }
        else {
            next({
                name: "IncorrectCredentialsError",
                message: 'Username or password is incorrect'
            });
        }
    }
    catch (error) {
        console.error(chalk.bold.red("Error with the login request!!!"));
        next(error);
    }
  });

  const { createUser } = require('../db');
  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {

        const _user = await getUserByUsername(username);
  
        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }
  
        const user = await createUser({
                username,
                password,
                name,
                location,
        });
  
        const token = jwt.sign({ 
                id: user.id, 
                username
        }, process.env.JWT_SECRET, {
                expiresIn: '1w'
        });
  
        res.send({ 
            message: "thank you for signing up",
            token 
        });
    } 
        catch ({ name, message }) {
        next({ name, message })
        } 
  });
  



const { getAllUsers } = require('../db');
usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

module.exports = usersRouter;