// need for .env
require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys");
// a reminder of how .env works
// console.log(keys.keys);

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",

    password: keys.keys,
    database: "bamazon_DB"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    startPrompt();
});

function startPrompt(){
    connection.query("SELECT * FROM products", function(err, results){
        if(err) throw err;
        console.log(results);
    })

}