const express = require('express')
const res = require('express/lib/response')
const { send, sendStatus } = require('express/lib/response')
const mysql = require('mysql2')
const { error } = require("console")
require('dotenv').config()

// Gets form info from html forms and reads as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine for rendering dynamic html pages
app.set('view engine', 'ejs')

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
})

// Creates the express app
const app = express()

// Creates the server for the app to run on
app.listen('3000', () => {
    if (err) throw err
    console.log('Server on')
})

//
// Main routes and functions

// Gets post at specified ID
function getPost() {

}

// Creates post and pushes it to main page
function createPost() {

}

// Deletes post at specified ID
function deletePost() {

}

// Edits post at specified ID
function editPost() {
    
}

// Renders the landing page
app.get('/', (req,res) => {
    try {
        res.render('index')
    }
    catch (err) {
        console.log('error caught')
        res.send('There was an error, try again or come back another time.')
    }
})
