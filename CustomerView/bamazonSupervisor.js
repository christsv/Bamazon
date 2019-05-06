// need for .env
require("dotenv").config();
require("console.table");

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
        console.table(results);
        customer(results);
    });
}

function customer(){

    inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "Quit"]
      }
    ])
    .then(function(val) {
      // Checking to see what option the user chose and running the appropriate function
      if (val.choice === "View Product Sales by Department") {
        viewSales();
      }
      else if (val.choice === "Create New Department") {
        addDepartment();
      }
      else {
        console.log("Goodbye!");
        process.exit(0);
      }
    });
}

function viewSales(){
  // Selects a few columns from the departments table, calculates a total_profit column
  connection.query(
    " SELECT " +
    // not really sure about the d. and p. i think you can keep it as departments.department_id
    // YOU CANNOT ^ DO THAT AT LEAST WHEN I TRIED IT WOULDNT WORK
    // okay it DOES work BUT you have to remove all the "shortcuts"
    "   departments.department_id, " +
    "   departments.department_name, " +
    "   departments.over_head_costs, " +
    // this adds product_sales to the new column temporarily
    "   SUM(IFNULL(products.product_sales, 0)) as product_sales, " +
    // this adds a new temporary column total_profit calculated through (product sales - overheadcost)
    "   SUM(IFNULL(products.product_sales, 0)) - departments.over_head_costs as total_profit " +
    "FROM products " +
    "   RIGHT JOIN departments ON products.department_name = departments.department_name " +
    "GROUP BY " +
    "   departments.department_id, " +
    "   departments.department_name, " +
    "   departments.over_head_costs",
    function(err, res) {
      console.table(res);
      customer();
    }
  );

}

function addDepartment(){
// Asking the user about the department they would like to add
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?"
      },
      {
        type: "input",
        name: "overhead",
        message: "What is the overhead cost of the department?",
        validate: function(val) {
          return val > 0;
        }
      }
    ])
    .then(function(val) {
      // Using the information the user provided to create a new department
      connection.query(
        "INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)",
        [val.name, val.overhead],
        function(err) {
          if (err) throw err;
          // If successful, alert the user, run makeTable again
          console.log("ADDED DEPARTMENT!");
          startPrompt();
        }
      );
    });

}