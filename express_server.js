const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const generateRandomString = require("./outer/helper");

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

const emailValidator = (emailToCheck, users) => {   
  for (let user in users) {
    if (users[user].email === emailToCheck) {
      
      return user;
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
  const user= req.cookies['username'];
  console.log("username", user);
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  //Store the new Short and LongURL in the Database
  urlDatabase[shortURL] = longURL;
  console.log("TEST ", urlDatabase);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
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


app.post("/login", (req, res) => {
  const name = req.body.name;
  res.cookie('username', name)
  console.log("is name", name);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send({ error : 'status(400): The email or password cannot be empty!'})
  };

  if (emailValidator(req.body.email)) {
    res.status(400).send({ error : 'status(400): Email already in used!'});
  }
  let newUser = {id, email, password};
  users[id] = newUser;   
  req.params.user_id = id;  
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const id = req.params.user_id;
  const user = users[id];
  
  const templateVars = {user}; 
  res.render("registration", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



