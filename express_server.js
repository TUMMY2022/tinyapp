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
  const userName = req.cookies['username'];
  console.log("username", userName);
  const templateVars = { urls: urlDatabase, userName };
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

app.get('/register', (req, res) => {
  res.render("registration");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

