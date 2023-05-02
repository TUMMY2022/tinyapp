const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const {
  emailChecher,
  urlUsers,
  generateRandomString,
} = require("./outer/helpers.js");
const PORT = 8080;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key"],
    maxAge: 1000 * 60 * 60 * 24,
  })
);

app.set("view engine", "ejs");
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
  aJ48lW: {
    id: "aJ48lW",
    email: "user1@example.com",
    hashedPassword: "user1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk",
  },
  JAZVA6: {
    id: "JAZVA6",
    email: "user3@example.com",
    hashedPassword: "user3",
  },
};
app.get('/get-session', function(req, res) {
  let user_id = req.session.user_id;
  res.send('User ID is ' + user_id);
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {
    return res.status(401).send("Log in to view this page");
  }
  const userUrls = urlUsers(user_id, urlDatabase);
  const templateVars = {
    user_id: user.email,
    urls: userUrls,
    message: !Object.keys(userUrls).length ? "You dont have any URLs " : null
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {
    return res.status(401).send("You need to be logged in to create a new URL");
  }
  
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {
    return res.status(401).send("Log in to view this page");
  }
  const templateVars = {
    user_id: user.email
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("The requested URL was not found."); 
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  
  if (!user) {
    return res.status(401).send("Log in to view this page");
  }
  
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("This URL does not exist");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("You do not have permission to access this URL");
  }
  
  const templateVars = {
    user_id: user.id,
    id: req.params.id,
    longURL: url.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const newLongURL = req.body.longURL;
  const url = urlDatabase[urlID];
  if (!userID) {
    return res.status(401).send("Please login to edit URLs.");
  }
  if (!url) {
    return res.status(404).send("URL not found.");
  }
  if (url.userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }
  urlDatabase[urlID].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL with given ID does not exist");
  }
  if (!user_id) {
    return res.status(401).send("You need to be logged in to delete this URL");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("You do not own this URL");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailChecher(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send("Invalid email or password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render('login', {user_id: user_id});
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  return res.status(200).redirect("/login");
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user_id: req.session.userId,
    urls: urlDatabase
  };
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('The Email and password are required');
  }
  if (emailChecher(email)) {
    return res.status(400).send('This Email already exists');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    name: name,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userId;
  res.redirect('/urls');
  res.status(201).send(`User registered successfully: ${email}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
