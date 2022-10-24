const express = require('express')
const res = require('express/lib/response')
const { send, sendStatus } = require('express/lib/response')
const mysql = require('mysql2')
const { error } = require("console")
require('dotenv').config()

// Creates the db connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
})

db.connect((err) => {
    if (err) throw err;
})

const app = express()

app.listen('3000', () => {
    if (err) throw err
    console.log('Server on')
})