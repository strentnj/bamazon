var mysql = require("mysql");

var inquirer = require("inquirer");

var table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "", 
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("What would you like to purchase?");
    console.log("--------------------------")
    start();
})


//not fully working
//
//
var start = function() {
  connection.query("SELECT * FROM Products",
    function(err, res) {
      var store = new table ({
        head: ['ItemID', "Product Name","Price",],
        colWidths: [10, 20, 10]
      });

      for (var i = 0; i < res.length; i++) {
        var stock = [res[i].ItemID, res[i].ProductName, res[i].Price];
        store.push(stock);
      }
      console.log(store.toString());
      transaction();
  });
};

var transaction = function() {
    inquirer.prompt([{
        name: "purchase",
        type: "input",
        message: "State the ItemID of what you would like to purchase, please.",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          } else {
            console.log("State the ItemID, please.")
            return false;
          }
        }
    }, {
        name: "quantity",
        type: "input",
        message: "State the quantity that you would like to purchase, please.",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          } else {
            console.log("State the quantity, please.")
            return false;
          }
        }
    }]).then(function(answer) {
        var numDesired = parseInt(answer.quantity);
        connection.query("SELECT * FROM Products WHERE ?",{
            ItemID: answer.purchase
          }, function(err, data) {
            if (err) throw err;
            if (data[0].StockQuantity < numDesired) {
              console.log("Insufficient Quantity");
              start();
            } else {
                var newInventory = data[0].StockQuantity - numDesired;
                var cost = data[0].Price * numDesired;
                cost = cost.toFixed(2);
                connection.query("UPDATE Products SET ? WHERE ?", [{
                    StockQuantity: newInventory
                }, {
                    ItemID: answer.purchase
                }], function(err, res) {
                    if (err) throw err;
                    console.log("Your purchase is $" + cost +". Would you like something else?");
                    start();

            });
           }
        });
    });
};