/**
 * Copyright (c) 2015 Michael Koeppl
 *
 * Created by mko on 04/02/15.
 *
 * static variables
 */

// STATUS CODES
var INTERNAL_ERROR = 'Internal error.';
var EMAILPSEUDO_IN_USE = 'This e-mail address as well as the pseudonym are in use.';
var EMAIL_IN_USE = 'This e-mail address is in use.';
var PSEUDO_IN_USE = 'This pseudonym is in use.';
var SUB_NAME_IN_USE = 'This sub name already exists.';
var REGISTRATION_SUC = 101;
var LOGIN_SUC = 102;
var NEWSUB_SUC = 103;
var NEWPOST_SUC = 104;
var FOLLOW_SUC = 105;
var INVALID_WP = 'The password you entered is invalid.';
var ACCOUNT_NOT_FOUND = 'There is no account with that e-mail/pseudonym.';
var NO_POSTS_FOUND = 'There are no posts created by this username';

module.exports.INTERNAL_ERROR = INTERNAL_ERROR;
module.exports.EMAILPSEUDO_IN_USE = EMAILPSEUDO_IN_USE;
module.exports.EMAIL_IN_USE = EMAIL_IN_USE;
module.exports.PSEUDO_IN_USE = PSEUDO_IN_USE;
module.exports.SUB_NAME_IN_USE = SUB_NAME_IN_USE;
module.exports.REGISTRATION_SUC = REGISTRATION_SUC;
module.exports.LOGIN_SUC = LOGIN_SUC;
module.exports.NEWSUB_SUC = NEWSUB_SUC;
module.exports.NEWPOST_SUC = NEWPOST_SUC;
module.exports.FOLLOW_SUC = FOLLOW_SUC;
module.exports.INVALID_WP = INVALID_WP;
module.exports.ACCOUNT_NOT_FOUND = ACCOUNT_NOT_FOUND;
module.exports.NO_POSTS_FOUND = NO_POSTS_FOUND;

// PBKDF2 STATICS
var ITERATIONS = 10000;
var LENGTH = 256;
var SALT_LENGTH = 32;

module.exports.PBKDF2_ITERATIONS = ITERATIONS;
module.exports.PBKDF2_LENGTH = LENGTH;
module.exports.SALT_LENGTH = SALT_LENGTH;

var ABOUT_HTTP_MESSAGE = "Hypertext Transfer Protocol (HTTP) is the way servers and browsers talk to each other. It’s a great language for computers, but it’s not encrypted. Think of it this way. If everyone in the world spoke English, everyone would understand each other. Every browser and server in the world speaks HTTP, so if an attacker managed to hack in, he could read everything going on in the browser, including that username and password you just typed in. Don't get us wrong. Nothing is ever 100% secure, but using HTTPS lowers the risk of someone reading everything you do and all your personal data."
module.exports.ABOUT_HTTP_MESSAGE = ABOUT_HTTP_MESSAGE;