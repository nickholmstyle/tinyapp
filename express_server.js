////////////IMPORTS///////////
const express = require("express");

const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

///HELPER FUNCTIONS
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["tinyKeys"]
}));
app.set("view engine", "ejs");

////////////GLOBAL OBJECTS///////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

////////////GET REQUESTS///////////

///Redirects route to revelent page upon visit based on login status
app.get('/', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});

///Permissions set to allow only logged in users to access the apps features.
///Redirects non users to login page where they can opt to register with the provided link.
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  
  if (!userID) {
    res.redirect('/login');
    return;
  }
  
  const user = users[userID];
  const filteredDB = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: filteredDB, user};
  res.render("urls_index", templateVars);
 
});
///
///Page to create shortened urls. Access only granted if logged in.
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    res.redirect('/login');
    return;
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

///Page shows the shortened url, and provides a link to visit the page from it's associated long url.
//Access only granted to logged in users, and error messaged thrown if the short url belongs to an invalid long url.
app.get("/urls/:id", (req, res) => {
 
  const userID = req.session.userID;
  const user = users[userID];
  
  if (!user) {
    return res.send(`Please Login or create a new account <a href='/login'>here.</a>`);
  }
  
  const longURL = req.body.longURL;
  const id = req.params.id;
  const urlObj = urlDatabase[id];
  if (!urlObj) {
    return res.send(`The information you have entered is incorrect. Please <a href='/urls'>try again.</a>`);
  }

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) {
    return res.send(`You have selected an invalid url. Please <a href='/urls'>try again.</a>`);
  }
  
  const templateVars = { id, longURL, user };
  res.render('urls_show', templateVars);
});

//Redirects the short url link to the long url. Goes to website.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  //Validates that the user owns an id that exists in the database
  if (!urlsForUser(id, urlDatabase)) {
    res.send(`url not found! Please <a href='/urls'>try again.</a>`);
  }

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);

});

///Registration page. Only  non existing users may register. Upon registration the new user is reidrected to the urls page.
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
  }
  
  const templateVars = { user };
  res.render("urls_register", templateVars);
});

///Login Page. If the user is logged in already they are redirected to the urls page so they cannot attempt to login twice.
app.get("/login", (req, res) => {
  const currentUser = users[req.session.userID];
  if (currentUser) {
    return res.redirect('/urls');
  }

  const templateVars = { user: currentUser };
  res.render("urls_login", templateVars);
});

////////////POSTS///////////

///Login post: Requires encrypted password and for the user to exist in the server users database.
///Throws an error and provides a link to try again or opt to register back on the login page.
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  
  if (!user) {
    return res.send(`Sorry, we were unable to log you in. Please ensure the information is correct <a href='/login'>here.</a>`);
  }

  const passwordCheck = bcrypt.compareSync(password, user.hashedPassword);
  if (passwordCheck) {
    req.session.userID = user.userID;
    return res.redirect('/urls');
  }
  return res.send(`Sorry, we were unable to log you in. Please ensure the information is correct <a href='/login'>here.</a>`);
});

///Register post: Requires to both fields must be filled in, generates a user id and provides the client with a hashed password.
///If salt does not match the an error is thrown with relevant html.
///Response message left vague as to not expose an existing user's email.
app.post("/register", (req, res) => {
 
  const userID = generateRandomString();
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !hashedPassword) {
    res.status(400).send(`Please re-enter credentials. Both fields must be filled. Please <a href='/register'>try again.</a>`);
  }
  
  if (getUserByEmail(email)) {
    res.send(`Sorry, we were unable to log you in. Please ensure the information is correct <a href='/register'>here.</a>`);
  }
  
  users[userID] = { userID, email, hashedPassword };
  req.session.userID = userID;
  
  res.redirect("/urls");
});

///urls post: Allows logged in users to create  create urls and store them the url database
///Redirects clients who are not logged in to a page with an html link to login or register
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (!user) {
    return res.send(`Please Login or create a new account <a href='/login'>here.</a>`);
  }
  
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {longURL, userID: req.session.userID}; //Stores a user's urls to the url database
  res.redirect(`/urls/${id}`);
});

///Update url: Should take an existing key value pair of short id with its long url value, update that id with a new url and have that update diplay on url page
app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    return res.send(`Please Login or create a new account <a href='/login'>here.</a>`);
  }
  
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send(`The information you have entered is incorrect. Please <a href='/urls'>try again.</a>`);
  }

  const id = req.params.id;
  const urlObj = urlDatabase[id];
  if (!urlObj) {
    return res.send(`The information you have entered is incorrect. Please <a href='/urls'>try again.</a>`);
  }

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) {
    return res.send(`The information you have entered is incorrect. Please <a href='/urls'>try again.</a>`);
  }

  urlDatabase[id] = {longURL, userID};
  res.redirect("/urls");
});

///Delete url, must be logging or will be redirected to do so if not.
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (!user) {
    return res.send(`Please Login or create a new account <a href='/login'>here.</a>`);
  }
  
  const {id} = req.params;
  delete urlDatabase[id];
  
  res.redirect('/urls');
});

///Logs user out and clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

///Accepts requests from the client.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
