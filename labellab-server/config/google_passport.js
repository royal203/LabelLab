#!/usr/bin/env node
require("dotenv").config()

var OAuthUser = require("../models/oauth_user")
var passport = require("passport")
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://127.0.0.1:5000/api/v1/auth/google/callback"
		},
		function(accessToken, refreshToken, profile, done) {
			OAuthUser.findOne({ googleId: profile.id })
				.then(currentUser => {
					if (currentUser) {
						return done(null, currentUser)
					} else {
						new OAuthUser({
							accessToken: accessToken,
							googleId: profile.id,
							username: profile.displayName,
							thumbnail: profile._json.picture
						})
							.save()
							.then(newUser => {
								return done(null, newUser)
							})
					}
				})
				.catch(err => {
					console.log(err)
				})
		}
	)
)