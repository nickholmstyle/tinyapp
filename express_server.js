
// const cookieParser = require("cookie-parser");
const { name } = require("ejs");
const express = require("express");
const cookieSession = require("cookie-session");

const bcrypt = require("bcryptjs");
// const password = "purple-monkey-dinosaur"; // found in the req.body object
// const hashedPassword = bcrypt.hashSync(password, 10);

//sets app as express
const app = express();

//declares the port we are using
const PORT = 8080;


//Middleware

app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["tinyKeys"]
}))
app.set("view engine", "ejs");

//Global Objects

// Old DB
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

/////
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

//generate random string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};

//determine if the user email exists in the users database


//returns the URLS where the userID is equal to the id of the currently logged in user
//loop through the database keys
// change the structure of the database to include all the users who have a particular short url
// append a user an object to key of the short url
// userDB = {
  //ede4fr: {
      // longURL: www.blahblah.com
      // userID: req.cookies["userID"]
  //}

const urlsForUser = (id, urlDatabase) => {
  let userUrls = {}
    for (let urlID in urlDatabase) {
      if (urlDatabase[urlID].userID === id) {
        userUrls[urlID] = urlDatabase[urlID].longURL
      }
    }
  return userUrls;
}



////////////GET///////////

//parse through the database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//displays the "database" of urls. Update url or delete here. 
app.get("/urls", (req, res) => {
  
  // const userID = req.cookies["userID"]
  const userID = req.session.userID;
  const user = users[userID]
  const filteredDB = urlsForUser(userID, urlDatabase);
  // console.log(filteredDB)
  // console.log(userID)
  
  const templateVars = { 
    urls: filteredDB,
    user
   };
 
   res.render("urls_index", templateVars);
});

//route to the page to add new urls
app.get("/urls/new", (req, res) => {
  // const userID = req.cookies["userID"];
  const userID = req.session.userID;
  const user = users[userID]
  // const currentUser = users[req.cookies["userID"]];
  // if (!currentUser) {
  if(!user) {
    res.redirect('/login');
    return
  }
  const templateVars = { 
    user
   }; 
  res.render("urls_new", templateVars);
});

//show new short url , update the short url here.
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]['longURL'];
  // const userID = req.cookies["userID"];
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = { id, longURL, user, userID };
  res.render('urls_show', templateVars);
})

//redirect the short url link to the long url. Goes to website.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.status(401).send(`URL does not exist`)
  }
  res.redirect(longURL);
});

//end path for registration form
app.get("/register", (req, res) => {
  // const userID = req.cookies["userID"]
  const userID = req.session.userID
  const user = users[userID]
  if (user) {
    res.redirect('/urls')
  }
  const templateVars = { user };
  res.render("urls_register", templateVars);
});
//Login Page
app.get("/login", (req, res) => {
  // const currentUser = users[req.cookies["userID"]];
  const currentUser = users[req.session.userID];
  if (currentUser) {
    res.redirect('/urls');
    return
  }

  const templateVars = { user: currentUser }
  res.render("urls_login", templateVars)
});

////////////POST///////////

// generate a random string and create a new entry to the database list
app.post("/urls", (req, res) => {
  // const currentUser = users[req.cookies["userID"]];
  const currentUser = users[req.session.userID];
  
  if (!currentUser) {
    return res.redirect('/401').send(`Please Login or create a new account.`)
  }
  
  const id = generateRandomString();
  longURL = req.body.longURL;
  // urlDatabase[id] = {longURL, userID: req.cookies["userID"]};
  urlDatabase[id] = {longURL, userID: req.session.userID};
  res.redirect(`/urls/${id}`);
});

//form to update short url
app.post("/urls/:id/edit", (req, res) => {
  // const currentUser = users[req.cookies["userID"]];
  const currentUser = users[req.session.userID];
  console.log(currentUser);
  
  if (!currentUser) {
    return res.redirect('/401').send(`Please login or create a new account.`)
  }
  
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  const currentUser = users[req.session.userID];
  
  if (!currentUser) {
    return res.redirect('/401').send(`Please login or create a new account`)
  }
  
  const {id} = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');

});

//login


const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email){
      return users[id];
    }
  }
  return null;
};



app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send(`Please re-enter credentials. Both fields must be filled`)
  }
  
  const user = getUserByEmail(email);
  // console.log(user)
  const passwordCheck = bcrypt.compareSync(password, user.hashedPassword);
  
  
    if (!user) {
    res.status(401).send(`Invalid Email.`)
  } else if (passwordCheck) {
    req.session.userID = user.userID
    res.redirect('/urls')
  } else {
    res.status(401).send(`Password is incorrect`)
  }

  

  // if (!user) {
  //   return res.status(401).send(`Invalid Email.`)
  // } 
  // if (user.password !== password) {
  //   return res.status(401).send(`Password is incorrect.`)
  // }
  
  // res.cookie("userID", user.userID);
  
  // return res.redirect("/urls");
 
});

//logout

app.post("/logout", (req, res) => {
  // res.clearCookie("userID");
  req.session = null
  res.redirect("/login");
});

//handles the registration form data

app.post("/register", (req, res) => {
 
  const userID = generateRandomString();
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  
  if (!email || !hashedPassword) {
    res.status(400).send(`Please re-enter credentials. Both fields must be filled`)
  }
  
  if (getUserByEmail(email)) {
    res.status(400).send(`This password is already associated with an account.`)
  }
  


  users[userID] = { userID, email, hashedPassword };
  req.session.userID = userID
  // res.cookie("userID", userID);

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