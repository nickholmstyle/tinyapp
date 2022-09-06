const express = require("express");
const app = express();
const PORT = 8080;

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};



app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL };
  res.render('urls_show', templateVars)
})


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  // const longURL = req.body.longURL
  const id = generateRandomString();
  longURL = req.body.longURL
  urlDatabase[id] = longURL
  // console.log("+++++++++", id)
  console.log(urlDatabase)

  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});