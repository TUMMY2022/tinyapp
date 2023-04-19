function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

//find if user id there in database
const emailChecher = (email, users) => {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

//return an object to match the database forms
const urlUsers = function(userID, urlDatabase) {
  const newDatabase = {};
  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      newDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return newDatabase;
};


module.exports = { generateRandomString, emailChecher, urlUsers};