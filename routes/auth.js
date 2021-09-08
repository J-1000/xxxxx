const { Router } = require("express");
const router = new Router();

const mongoose = require('mongoose');

const bcryptjs = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User.model");

const passport = require('passport');

// GET route ==> to display the signup form to users
router.get("/signup", (req, res) => res.render("auth/signup"));

// POST route ==> to process form data
router.post("/signup", (req, res, next) => {
  // console.log("The form data: ", req.body);

  const { username, email, password } = req.body;

  //users must fill all mandatory fields
  if (!username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'Please provide all mandatory fields' })
    return;
  }

  // make sure passwords are strong
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }



  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        password: hashedPassword
      });
    })
    .then((userFromDB) => {
      //console.log("new user: ", userFromDB);
      res.redirect("/userProfile", { "new user": userFromDB });
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: 'Username and email need to be unique. Either username or email is already used.' });
      } else {
        next(error);
      }
    });
});


router.get('/login', (req, res, next) => res.render('auth/login'));

// router.post(
//   '/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     // passReqToCallback: true
//   })
// );

// router.post('/login', (req, res, next) => {
//   passport.authenticate('local', (err, theUser, failureDetails) => {
//     if (err) {
//       // Something went wrong authenticating user
//       return next(err);
//     }

//     if (!theUser) {
//       // Unauthorized, `failureDetails` contains the error messages from our logic in "LocalStrategy" {message: '…'}.
//       res.render('auth/login', { errorMessage: 'Wrong password or username' });
//       return;
//     }

//     // save user in session: req.user
//     req.login(theUser, err => {
//       if (err) {
//         // Session save went bad
//         return next(err);
//       }

//       // All good, we are now logged in and `req.user` is now set
//       res.redirect('/');
//     });
//   })(req, res, next);
// });



module.exports = router;
