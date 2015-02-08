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
var REGISTRATION_SUC = 101;
var LOGIN_SUC = 102;
var INVALID_WP = 'The password you entered is invalid!';
var ACCOUNT_NOT_FOUND = 'There is no account with that e-mail/pseudonym.';

module.exports.INTERNAL_ERROR = INTERNAL_ERROR;
module.exports.EMAILPSEUDO_IN_USE = EMAILPSEUDO_IN_USE;
module.exports.EMAIL_IN_USE = EMAIL_IN_USE;
module.exports.PSEUDO_IN_USE = PSEUDO_IN_USE;
module.exports.REGISTRATION_SUC = REGISTRATION_SUC;
module.exports.LOGIN_SUC = LOGIN_SUC;
module.exports.INVALID_WP = INVALID_WP;
module.exports.ACCOUNT_NOT_FOUND = ACCOUNT_NOT_FOUND;

// PBKDF2 STATICS
var ITERATIONS = 10000;
var LENGTH = 256;
var SALT_LENGTH = 32;

module.exports.PBKDF2_ITERATIONS = ITERATIONS;
module.exports.PBKDF2_LENGTH = LENGTH;
module.exports.SALT_LENGTH = SALT_LENGTH;