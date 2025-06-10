const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  googleId: String, // for Google auth
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
