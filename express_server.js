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
    maxAge: 24 * 60 * 60 * 1000,
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
    hashedPassword:
			"user3",
  },
};
app.get("/", (req, res) => {
  return res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    urls: urlUsers(id, urlDatabase),
    user,
  };

  if (!user) {
    res.status(401);
    return res.render("login", {
      user: null,
      error: "To view your TinyUrls please login first",
    });
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const user = null;
  res.render("login", { user, error: null });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(403);
    return res.render("login", {
      user: null,
      error: "Please try again: enter a valid email and password",
    });
  }
  const userExists = emailChecher(email, users);
  if (!userExists) {
    res.status(403);
    return res.render("login", {
      user: null,
      error: "please try again: user doesn't exist",
    });
  }
  if (!bcrypt.compareSync(password, userExists.hashedPassword)) {
    res.status(403);
    return res.render("login", {
      user: null,
      error: "Please try again: password is not correct",
    });
  }
  req.session.user_id = userExists.id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/");
});

app.get("/register", (req, res) => {
  const user = null;
  res.render("registration", { user, error: null });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res.status(401);
    return res.render("registration", {
      user: null,
      error: "Please try again: enter a valid email and password",
    });
  }
  const userExists = emailChecher(email, users);
  if (userExists) {
    res.status(403);
    return res.render("registration", {
      user: null,
      error: "Please try again: The email already in used",
    });
  }
  const id = generateRandomString(6);
  users[id] = { id, email, hashedPassword };
  req.session.user_id = id;
  return res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_new", { user });
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user };
  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  return res.redirect(longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if ((urlDatabase[shortURL].userID = id)) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
  }
  return res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if ((urlDatabase[shortURL].userID = id)) {
    delete urlDatabase[shortURL];
  }
  return res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("* ", (req, res) => {
  res.send("Page not found");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
