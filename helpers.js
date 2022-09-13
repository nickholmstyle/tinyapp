//Search through a database with a provided email to discover which user it belongs to.


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const getUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userUrls[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };