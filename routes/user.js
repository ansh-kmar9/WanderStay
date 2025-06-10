const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  // Show signup form
  .get(userController.renderSignupForm)
  // Handle signup
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  // Show login form
  .get(userController.renderLoginForm)
  // Handle local login
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// Google login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/auth/google/callback",
  saveRedirectUrl,
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.googleLogin
);

// Logout
router.get("/logout", userController.logout);

module.exports = router;
