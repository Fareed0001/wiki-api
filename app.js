const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//This code is to avoid deprecation warnings
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {
  useNewUrlParser: true
});

const articleSchema = {
  title: String,
  content: String
}

const Article = mongoose.model("Article", articleSchema);
//////////////////REQUEST TARGETING ALL ARTICLES
// using chained routing method, instead of saying app.get, app.post, app.delete etc on thesame route
// that will make your code combersome. instead call the route and link app the app methods to it
app.route("/articles")
  // goto https://expressjs.com/en/guide/routing.html to see routing method

  .get(function(req, res) {
    // using the find method, what this line of code does is to find everything in the article collection
    Article.find(function(err, foundArticles) {
      if (!err) { //if there were no errors, send the found articles
        res.send(foundArticles);
      } else { //if there were errors, send error message
        res.send(err);
      }
    });
  }) // remove the closing semi-colons from the end of each method so that the code doesnt end but links to the next code (;)

  .post(function(req, res) {
    //when the post request get sent by the client we use the req.body."form-name-attribute" ie (name, phoneNumber) to grab data the html form with that name
    //TO CREATE DATA IN MONGODB DATABASE
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    })
    newArticle.save(function(err) { // to kow how to use this save err callback, goto https://mongoosejs.com/docs/models.html
      if (!err) {
        res.send("successfully saved a new article");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    //https://mongoosejs.com/docs/api.html#model_Model-deleteMany to see the delete documentations
    Article.deleteMany(function(err) {
      if (!err) {
        res.send("successfully deleted all articles");
      } else {
        res.send(err);
      }
    });
  });

/////////////////////REQUEST TARGETING SPECIFIC ROUTE
// goto app.route("/articles/jack-bauer") to see route parameters
app.route("/articles/:articleTitle")
  //this code tries to capture the articleTitle the user inputted so that it can be used in a callback function
  .get(function(req, res) {
    // we check our database for the parameter the user inputted, since we only expect one result, we use the findOne method
    //params are the parameters the user inputted in the link
    Article.findOne({
      title: req.params.articleTitle
    }, function(err, foundArticle) {
      //here we go through our articles and find that one with thesame title the user needs
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found");
      }
    });
  })

  //used to replace an entire document content
  .put(function(req, res) {
    Article.replaceOne( //using the mongodb replace syntax https://mongoosejs.com/docs/api.html#model_Model-update
      { //This is the condition, saying the document that matches the article title is the one we want to update
        title: req.params.articleTitle
      }, { //This is the update to be made, the fields we wish to update are the title and content
        title: req.body.title,
        content: req.body.content
      }, { //by default mongodb allows over rides but mongoose doesnt so we need to set it to true to be allowed to override the selected fields
        overwrite: true
      },
      function(err) { //this is to check if there were any errors
        if (!err) { //if there were no errors
          res.send("successfully updated article");
        }
      }
    );
  })

  //used to replace parts of a document
  .patch(function(req, res) {
    Article.updateOne({ //this is the condition to check for article with that title
        title: req.params.articleTitle
      }, { //https://www.mongodb.com/docs/manual/reference/operator/aggregation/set/#mongodb-pipeline-pipe.-set
        $set: req.body
      },
      function(err) {
        if (!err) {
          res.send("Article has been updated");
        } else {
          res.send(err);
        }
      }
    );
  })

  // This delete method deletes the article with the title
  .delete(function(req, res) {
    Article.deleteOne({ //https://mongoosejs.com/docs/api.html#model_Model-deleteOne
        title: req.params.articleTitle
      },
      function(err) {
        if (!err) {
          res.send("document deleted successfully");
        } else {
          res.send(err);
        }
      }
    );
  });
  //NB the last bracket in the entire chain method is the one with the closing semi-colon






app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//rs to restart nodemon
