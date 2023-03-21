const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const generateRandomString = require("./outer/helper");
const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "abc123": {
    id: "user1",
    email: "user1@example.com",
    password: "user1password",
  },
  "efd456": {
    id: "user2",
    email: "user2@example.com",
    password: "user2password",
  },
};

const emailChecher = (emailToCheck, users) => {   
  for (let user in users) {
    if (users[user].email === emailToCheck) {
      return users[user];
    }  
  } 
};

const getUserByUserId = (userIdToCheck, users) => {   
  for (let user in users) {
    if (users[user].id === userIdToCheck) {
      return users[user];
    }  
  } 
};

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id= req.cookies['user_id'];
  const user = getUserByUserId(id,users);
  const templateVars = { urls: urlDatabase, user};
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body><p>please <a href='/login'>login</a></p></body></html>\n");
  }
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = getUserByUserId(id,users);
  console.log("user", user)
  const templateVars = {user}; 
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  //Store the new Short and LongURL in the Database
  urlDatabase[shortURL] = longURL;
  console.log("TEST ", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const id= req.cookies['user_id'];
  const user = getUserByUserId(id,users);
  const templateVars = {  id:req.params.id, urls: urlDatabase, user, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.params.user_id;

  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];  
    res.redirect(`/urls`);
  } else {
    res.status(403).send({ error : 'status(403): You do not have permission to delete!'});
  }

});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL; 
  res.redirect(`/urls`);
  
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = getUserByUserId(id,users);
  const templateVars = {user}; 
  console.log("templateVars",templateVars)
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = emailChecher(email, users);
  if (!email || !password) {
    res.status(400).send({ error : 'status(400): The email or password cannot be empty!'})
  };
  if (emailChecher(req.body.email,users)) {
    res.status(400).send({ error : 'status(400): Email already in used!'});
  }
  let newUser = {id, email, password};
  users[id] = newUser;
  res.cookie("user_id", id);   
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const user = getUserByUserId(id,users);
  const templateVars = {user}; 
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailChecher(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!emailChecher(email, users)) {
    res.status(403).send({ error : 'status(403): Not Registered. please register!'});
  }
  if (!bcrypt.compareSync(password, hashedPassword)) {
    res.status(403).send({ error : 'status(403): ***Invalid Credentials!, please try again'});
  }
  if (user.password !== req.body.password) {
    res.status(403).send({ error : 'status(403): Invalid Credentials!, please Try again'});
  }
  console.log("user_id", user.id);
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



