

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://nandani:prakash.mali876@mongoyoutube.ie0bohm.mongodb.net/todolistDB',  {useNewUrlParser: true})
.then(() => console.log("connection successfull..."))
.catch((err) => console.log(err));

const itemsSchema = new mongoose.Schema({
  name: String
});
const Items = mongoose.model("Items", itemsSchema);

const item1 = new Items({
  name : "Welcome to your todolist!"
});
const item2 = new Items({
  name : "Hit the + button to aff a new item."
});
const item3 = new Items({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

  const getDocument = async () => {
    const result = await Items.find() . then ((foundItems) => {

    if (foundItems.length === 0) {
     Items.insertMany(defaultItems)
      .then(() => console.log("successfully inserted..."))
      .catch((err) => console.log(err));
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
  }  
  getDocument();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Items({
    name : itemName
  });  
  
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    const foundDocument = async () => {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
  }
    foundDocument();
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  const deleteDocument = async () => {
  try {
    if (listName === "Today") {
      await Items.findByIdAndDelete(checkedItemId);
      // console.log("Successfully deleted checked item.");
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } } );
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error(err);
    // res.status(500).send("An error occurred while deleting the item.");
  }
}
deleteDocument();
});

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);
  const getDocument = async () => {
  try{
    const foundList = await List.findOne({name: customListName});
    if (!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }catch(err){
      console.log(err);
  }
  }
  getDocument();
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.eny.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});


