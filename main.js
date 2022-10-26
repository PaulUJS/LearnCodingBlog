const express = require('express')
const res = require('express/lib/response')
const { send, sendStatus } = require('express/lib/response')
const mysql = require('mysql2')
const { error } = require("console")
const { totalmem, devNull } = require('os')
const bcrypt = require('bcrypt')
const session = require("express-session")
const store = new session.MemoryStore()
require('dotenv').config()

//
// Varibles
//
let posts = [];
let current_post = [];

//
// App setup
//
// Creates the db connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
})

// Connects to the database once the file is run
db.connect((err) => {
    if (err) throw err;
    console.log('db connected')
})

// Creates the express app
const app = express()

// Creates the server for the app to run on
app.listen('3000', () => {
    console.log('Server on')
})


// Gets form info from html forms and reads as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine for rendering dynamic html pages
app.set('view engine', 'ejs')

//
// Main routes and functions
//

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: false,
        cookie: { maxAge: 30000 },
        store,
    })
);

// Creates posts table in database
app.get('/createtable', (req,res) => {
    let table = `create table if not exists posts(
        id int primary key auto_increment,
        title text not null,
        content text not null 
    )`

    let table_form = mysql.format(table)

    db.query(table, (err, res) => {
        if (err) throw err;
        console.log('table created')

    })
})

// Grabs all posts from database
function allPosts() {
    const select_query = "SELECT FROM TABLE posts TITLE, CONTENT"
    const sql_select = mysql.format(select_query)
    
    // Query for grabbing all posts
    db.query(sql_select, (err, result) => {
        if (err) throw err;
        console.log(result.length)

        // Loops through the posts from db
        for (let x = 0; x > result.length; x++) {
            let title = result[x].title;
            let content = result[x].content;

            // Pushes posts into an array as an object which will be rendered in html
            posts.push({
                title: title,
                content: content
            })
            console.log(posts)
        }
    })
}

// Renders the landing page
app.get('/', (req,res) => {
    if (req.session.authenticated = false) {
        res.render('adminindex', {posts: posts})
        console.log('admin online')
    }
    else if (req.session.authenticated = false) {
        res.render('index', {posts: posts})
        console.log('user online')
    }
})

// Lets me sign up, will be deleted later
app.get('/signup', (req,res) => {
    res.render('signup')
})

app.post('/signup', async (req,res) => {
    const email = req.body.email
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

    const select_query = "SELECT FROM user where email = ?"
    const sql_select = mysql.format(select_query, [email])

    const insert_query = "INSERT INTO user VALUES (0,?,?)";
    const sql_insert = mysql.format(insert_query, [email, hashedPass]);

    db.query(sql_select, (err, result) => {
        if (err) throw err;

        if (result.length != 0) {

        }
        else {
            db.query(sql_insert, (err, result) => {
                if (err) throw err;
                console.log('user created')
            })
        }

    })
})

// Lets me sign in to make, edit, and delete posts
app.get('login', (req,res) => {
    res.render('login')
})

app.post('login', (req,res) => {
    const email = req.body.email
    const password = req.body.password

    const sql_select = "SELECT * FROM users WHERE email = ?"
    const select_query = mysql.format(sql_select, [email])
    const req_var = req

    db.query(select_query, async (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
           console.log('No user')
        }
        else {
            const hashedPass = result[0].password

            if (await bcrypt.compare(password, hashedPass) == true) {
                req_var.session.authenticated = true
            }

            else if (await bcrypt.compare(password, hashedPass) == false){
                req_var.session.authenticated = false;
            }
        }
    })
})
// Creates post and pushes it to main page
app.post('/create', (req,res) => {
    let title = req.body.title
    let content = req.body.content 

    const insert_query = "INSERT INTO posts title = ?, content = ?"
    const sql_insert = mysql.format(insert_query, [title], [content])

    // Inserts the created post into the database
    db.query(sql_insert, (err, result) => {
        if (err) throw err;
        console.log(result)
        console.log('Post created')
    })

    res.redirect('/')
})

// Renders the page where the user creates posts
app.get('/create', (req,res) => {
    res.render('create')
})

// Grabs post at secified ID then pushes it into the current post array
app.get('/post/:id', (req,res) => {
    // Grabs ID parameter from the url
    let id = req.params['id']
    // Gets index of that post based off its ID
    let index = id - 1
    // Pushes that post object into the current post array
    current_post.push(posts[index])
    res.redirect(`/post/${id}`)
})

// Renders the post that was grabbed in the previous get request
app.get('/post/:id', (req,res) => {
    res.render('post', {current_post: current_post})
})

// Deletes post at specified ID
app.get('/delete/:id', (req,res) => {
    let id = req.params['id']
    let index = id - 1

    let del_query = "DELETE * FROM TABLE posts WHERE id = ?"
    let sql_del = mysql.format(del_query, [id])

    // Deletes post from the db
    db.query(sql_del, (err, result) => {
        if (err) throw err;
        console.log(`Post ${id} deleted from database`)
    })
    
    // Deletes post from the posts array
    posts.splice(index, 1)
    console.log(`Post ${id} deleted from the array`)
    current_post = []

    res.redirect('/')
})

// Renders page where you can edit the post
app.get('/edit/:id', (req,res) => {
    res.render('edit', {current_post: current_post})
})

// Posts the edit to the post
app.post('/edit/:id', (req,res) => {
    let id = req.params['id']
    let title = req.body.title
    let content = req.body.content
    let index = id - 1

    // Grabs the object from the array at index
    let change = posts[id]
    // Changes the title and content to the edited version
    change['title'] = title
    change['content'] = content
    current_post = []

    res.redirect('/')
})



