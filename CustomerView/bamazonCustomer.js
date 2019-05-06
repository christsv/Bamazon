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
        customer(results);
    });
}

function customer(table){
    inquirer
    .prompt([
        {
            type:"input",
            name: "id",
            message: "What is tje ID of the item you would like to buy? (or type 'quit' to leave)"
        },
        {
            type:"input",
            name:"quantity",
            message: "How many Units would you like to buy of that product?"
        }
    ])
    .then(function(answers){

        // making the answer a number
        var id = parseInt(answers.id);
        var stock = parseInt(answers.quantity);
        // check if the product is in the database
        var product = checkID(id, table);

        // if product is in inventory this is where we check if the there is enough to buy
        if (product){
            checkQuantity(stock, product);

        }
        else if(answers.id == "quit"){
            connection.end();
        }
        else { 
            console.log("\nThe item is not in the inventory. ");
            startPrompt();
        }
    
    })

}

function checkID(id, table){
    for(var i=0; i <table.length; i++){
        if(table[i].item_id == id){
            return table[i];
        }
    }

    return null;
}

function checkQuantity(stock, product){
    if(product.stock_quantity >= stock){
        console.log("There is enough!\n");
        connection.query(
            "UPDATE products SET stock_quantity = stock_quantity -? WHERE item_id = ?",
            [stock, product.item_id],
            function(err, res){
                console.log("\nSuccessfully purchased " + stock + " " + product.product_name + "'s!");
                startPrompt();
            }
        )
    }
    else{
        console.log("Insufficient quantity!\n");
        startPrompt();
    }
}