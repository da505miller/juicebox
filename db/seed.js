const chalk = require('chalk');

// grab our client with destructuing from the export in index.js
const { client,
        createUser,
        updateUser,
        getAllUsers,
        getUserById,
        createPost,
        updatePost,
        getAllPosts,
        getPostsByUser,
        getPostById,
        createTags,
        addTagsToPost,
        getPostsByTagName
} = require('./index');

// this function should call a query which drops all tables from our database
async function dropTables() {
    
    try {
        console.log(chalk.cyan("Starting to drop tables..."));
        
        // have to make sure to drop in the correct order
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);

        console.log(chalk.green("Finished dropping tables!"));
    }
    catch (error) {
        console.error(chalk.red("Error dropping tables!"));
        throw error; // we pass the error up to the function that calls dropTables
    }
}

// this function should call a query which creates all tables for our database 
async function createTables() {
    try {
        console.log(chalk.cyan("Starting to build tables!"));

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE ("postId", "tagId")
            );
        `);

        console.log(chalk.green("Finished building tables!"));
    }
    catch (error) {
        console.log(chalk.red("Error building tables!"));
        throw error; 
    }
}

async function createInitialUsers() {
    try {
        console.log(chalk.cyan("Starting to create users..."));

        await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });
        await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin'" });
        await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });

        console.log(chalk.green("Finished creating users!"));
    }
    catch (error) {
        console.error(chalk.red("Error creating users!"));
        throw error;
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log(chalk.cyan("Starting to create posts..."));
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["#happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "How does this work?",
            content: "Seriously, does this even do anything??",
            tags: ["#happy", "#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posing.",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });
        console.log(chalk.green("Finished creating posts!"));
    }
    catch (error) {
        console.error(chalk.red("Error creating posts!!!!!"));
        throw error;
    }
}

// async function createInitialTags() {
//     try {
//         console.log("Starting to create tags...");

//         const [happy, sad, inspo, catman] = await createTags([
//             '#happy',
//             '#worst-day-ever',
//             '#youcandoanything',
//             '#catmandoeverything'
//         ]);

//         const [postOne, postTwo, postThree] = await getAllPosts();

//         await addTagsToPost(postOne.id, [happy, inspo]);
//         await addTagsToPost(postTwo.id, [sad, inspo]);
//         await addTagsToPost(postThree.id, [happy, catman, inspo]);

//         console.log("Finished creating initial tags!");
//     }
//     catch (error) {
//         console.error("Create initial tags ERROR!");
//         throw error;
//     }
// }

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        // await createInitialTags();
    }
    catch (error) {
        console.error(chalk.red("Error during rebuildDB"))
        throw error;
    }
}

async function testDB() {
    try {
        console.log(chalk.cyan("Starting to test database..."));

        console.log(chalk.cyan("Calling getAllUsers"))
        const users = await getAllUsers();
        console.log("Result:", users);

        console.log(chalk.cyan("Calling updateUser on users[0]"))
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log(chalk.cyan("Calling getAllPosts"));
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log(chalk.cyan("Calling updatePost on posts[1], only updating tags"));
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log(chalk.cyan("Calling getUserById with 1"));
        const albert = await getUserById(1);
        console.log("Result:", albert);

        console.log(chalk.cyan("Calling getPostsByTagName with #happy"));
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

        console.log(chalk.green("Finished database tests!"));
    } 
    catch (error) {
        console.error(chalk.red("Error testing database!"));
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());