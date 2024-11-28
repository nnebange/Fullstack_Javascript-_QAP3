const express = require("express");  
const path = require("path");  
const session = require("express-session");  
const bcrypt = require('bcrypt');  
  
const app = express();  
const PORT = 3000;  
const SALT_ROUNDS = 10;  
  
app.use(express.urlencoded({ extended: true }));  
app.use(express.static(path.join(__dirname, "public")));  
app.use(  
   session({  
      secret: "replace_this_with_a_secure_key",  
      resave: false,  
      saveUninitialized: true,  
   })  
);  
  
app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views"));  
  
const USERS = [  
   {  
      id: 1,  
      username: "AdminUser",  
      email: "admin@example.com",  
      password: bcrypt.hashSync("admin123", SALT_ROUNDS),  
      role: "admin",  
   },  
   {  
      id: 2,  
      username: "RegularUser",  
      email: "user@example.com",  
      password: bcrypt.hashSync("user123", SALT_ROUNDS),  
      role: "user",  
   },  
];  
  
// GET /login - Render login form  
app.get("/login", (request, response) => {  
   response.render("login", { error: null });  
});  
  
// POST /login - Allows a user to login  
app.post("/login", (request, response) => {  
   const { email, password } = request.body;  
   const user = USERS.find((user) => user.email === email);  
  
   if (!user) {  
      response.render("login", { error: "User not found" });  
   } else {  
      bcrypt.compare(password, user.password, (err, result) => {  
        if (err || !result) {  
           response.render("login", { error: "Invalid password" });  
        } else {  
           request.session.user = user;  
           response.redirect("/landing");  
        }  
      });  
   }  
});  
  
// GET /signup - Render signup form  
app.get("/signup", (request, response) => {  
   response.render("signup", { error: null });  
});  
  
// POST /signup - Allows a user to signup  
app.post("/signup", (request, response) => {  
   const { username, email, password } = request.body;  
   const existingUser = USERS.find((user) => user.email === email);  
  
   if (existingUser) {  
      response.render("signup", { error: "Email already in use" });  
   } else {  
      bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {  
        if (err) {  
           console.log(err);  
           response.render("signup", { error: "An error occurred" });  
        } else {  
           const newUser = {  
              id: USERS.length + 1,  
              username,  
              email,  
              password: hash,  
              role: "user"  
           };  
           USERS.push(newUser);  
           request.session.user = newUser;  
           response.redirect("/landing");  
        }  
      });  
   }  
});  
  
// GET / - Render index page or redirect to landing if logged in  
app.get("/", (request, response) => {  
   if (request.session.user) {  
      return response.redirect("/landing");  
   }  
   response.render("index");  
});  
  
// GET /landing - Shows a welcome page for users, shows the names of all users if an admin  
app.get("/landing", (request, response) => {  
   if (!request.session.user) {  
      return response.redirect("/login");  
   }  
    
   if (request.session.user.role === 'admin') {  
      response.render("landing", { user: request.session.user, users: USERS, isAdmin: true });  
   } else {  
      response.render("landing", { user: request.session.user, isAdmin: false });  
   }  
});  

// GET /logout - Logs out the user  
app.get("/logout", (request, response) => {  
    request.session.destroy((err) => {  
       if (err) {  
         console.log(err);  
       }  
       response.redirect("/");  // Redirect to home page after logout  
    });  
 });  
   
 // Ensure this route is present and correct  
 app.get("/", (request, response) => {  
    if (request.session.user) {  
       return response.redirect("/landing");  
    }  
    response.render("index");  
 });
  
// Start server  
app.listen(PORT, () => {  
   console.log(`Server running at http://localhost:${PORT}`);  
});
