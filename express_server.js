
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;
// const cookieParser = require('cookie-parser');

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};



app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//route to the page to add new urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//show the list of urls
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL };
  res.render('urls_show', templateVars)
})


// generate a random string and create a new entry to the database list
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  longURL = req.body.longURL
  urlDatabase[id] = longURL
  res.redirect(`/urls/${id}`);
});


//redirect the short url link to the long url. Goes to website.
app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

//create form to update short url
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
})

//delete url
app.post("/urls/:id/delete", (req, res) => {
  const {id} = req.params
  delete urlDatabase[id];
  res.redirect('/urls')

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});














// const express = require("express");
// const app = express();
// const PORT = 8080;

// const generateRandomString = () => {
//   return Math.random().toString(36).slice(2, 8)
// };



// app.use(express.urlencoded({ extended: true }));
// app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });

// app.get("/urls/new", (req, res) => {
//   res.render("urls_new");
// });

// app.get("/urls/:id", (req, res) => {
//   const id = req.params.id
//   const longURL = urlDatabase[id]
//   const templateVars = { id, longURL };
//   res.render('urls_show', templateVars)
// })















// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.post("/urls", (req, res) => {
//   // const longURL = req.body.longURL
//   const id = generateRandomString();
//   longURL = req.body.longURL
//   urlDatabase[id] = longURL
//   // console.log("+++++++++", id)
//   console.log(urlDatabase)

//   res.redirect(`/urls/${id}`);
// });

// //delete url
// app.post("/urls/:id", (req, res) => {
//   const {id} = req.params
//   // same as const id = req.params.id
//   delete urlDatabase[id];
//   res.redirect('/urls')

// })
// // ln
// app.get("/u/:id", (req, res) => {
//   const id = req.params.id
//   const longURL = urlDatabase[id]
//   res.redirect(longURL);
// });

// app.get("urls/:id", (req, res) => {
//   const {id} = req.params
//   res.render("/url_show", templateVars)
// });

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}!`)
// });