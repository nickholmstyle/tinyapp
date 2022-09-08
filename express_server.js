
const cookieParser = require("cookie-parser");
const { name } = require("ejs");
const express = require("express");

//sets app as express
const app = express();

//declares the port we are using
const PORT = 8080;


//Middleware

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//Global Objects

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {}


///EXAMPLE///////////////////

// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

/////////////////////////////

//Helper functions

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};



////////////GET///////////

//parse through the database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//displays the "database" of urls. Update url or delete here. 
app.get("/urls", (req, res) => {
  
  const userID = req.cookies["userID"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase,
    user
   };
  res.render("urls_index", templateVars);
});

//route to the page to add new urls
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"]
  const user = users[userID]
  const templateVars = { 
    user
   }; 
  res.render("urls_new", templateVars);
});

//show new short url , update the short url here.
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userID = req.cookies["userID"]
  const user = users[userID]
  const templateVars = { id, longURL, user };
  res.render('urls_show', templateVars)
})

//redirect the short url link to the long url. Goes to website.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//end path for registration form
app.get("/register", (req, res) => {
  const userID = req.cookies["userID"]
  const user = users[userID]
  const templateVars = { user };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["userID"]
  const user = users[userID];
  const templateVars = { user }
  res.render("urls_login", templateVars)
});

////////////POST///////////

// generate a random string and create a new entry to the database list
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

//form to update short url
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  const {id} = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');

});

//login

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
})

//logout

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

//handles the registration form data

const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email){
      return users[id]
    }
  }
  return null
}



app.post("/register", (req, res) => {
 
  const userID = generateRandomString();
  const {email, password} = req.body;
  // const password = req.body.password;
  
  // console.log(users)
  
  if (!email || !password) {
    res.redirect('/400')
  }
  
  if (getUserByEmail(email)) {
    res.redirect('/400')
  }
  users[userID] = { userID, email, password };

  res.cookie("userID", userID);

  res.redirect("/urls");

});

/////////////////////////////////////////////////////

//which port we listen to the client on
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