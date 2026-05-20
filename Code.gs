```javascript id="97g8qs"
const SPREADSHEET_ID = "11EnQdVmP1L8GZ4q9K1hvBxrJWRsApYlbpD9Rr2pKUqo";

const USERS = {
  "Usman": "1234",
  "UKlove": "1234"
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('UK Watch')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

function checkLogin(username, password) {
  if (USERS[username] && USERS[username] === password) {
    return { success: true, user: username };
  }

  return {
    success: false,
    message: "Wrong Username or Password"
  };
}

/* BAQI FUNCTIONS SAME RAHENGE */
```

