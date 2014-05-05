var validator = require('validator'),
    _ = require('lodash');

var validators = {};

//mapping to validator.js
_.each([
    'equals', //(str, comparison)** - check if the string matches the comparison.
    'contains', //(str, seed)** - check if the string contains the seed.
    'matches', //(str, pattern [, modifiers])** - check if string matches the pattern. Either `matches('foo', /foo/i)` or `matches('foo', 'foo', 'i')`.
    'isEmail', //(str)** - check if the string is an email.
    'isURL', //(str [, options])** - check if the string is an URL. `options` is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false }`.
    'isIP', //(str [, version])** - check if the string is an IP (version 4 or 6).
    'isAlpha', //(str)** - check if the string contains only letters (a-zA-Z).
    'isNumeric', //(str)** - check if the string contains only numbers.
    'isAlphanumeric', //(str)** - check if the string contains only letters and numbers.
    'isHexadecimal', //(str)** - check if the string is a hexadecimal number.
    'isHexColor', //(str)** - check if the string is a hexadecimal color.
    'isLowercase', //(str)** - check if the string is lowercase.
    'isUppercase', //(str)** - check if the string is uppercase.
    'isInt', //(str)** - check if the string is an integer.
    'isFloat', //(str)** - check if the string is a float.
    'isDivisibleBy', //(str, number)** - check if the string is a number that's divisible by another.
    'isNull', //(str)** - check if the string is null.
    'isLength', //(str, min [, max])** - check if the string's length falls in a range.
    'isUUID', //(str [, version])** - check if the string is a UUID (version 3, 4 or 5).
    'isDate', //(str)** - check if the string is a date.
    'isAfter', //(str [, date])** - check if the string is a date that's after the specified date (defaults to now).
    'isBefore', //(str [, date])** - check if the string is a date that's before the specified date.
    'isIn', //(str, values)** - check if the string is in a array of allowed values.
    'isCreditCard', //(str)** - check if the string is a credit card.
    'isISBN', //(str [, version])** - check if the string is an ISBN (version 10 or 13).
    'isJSON', //(str)** - check if the string is valid JSON (note: uses JSON.parse).
    'isMultibyte', //(str)** - check if the string contains one or more multibyte chars.
    'isAscii', //(str)** - check if the string contains ASCII chars only.
    'isFullWidth', //(str)** - check if the string contains any full-width chars.
    'isHalfWidth', //(str)** - check if the string contains any half-width chars.
    'isVariableWidth' //(str)** - check if the string contains a mixture of full and half-width chars.
], function (name) {
    validators[name] = validator[name];
});

//backward compatibility for validator.js 1.x & 2.x functions
_.assign(validators, {
    is: validators.matches,
    not: function () {
        return !validators.matches.apply(undefined, arguments);
    },
    isUrl: validators.isURL,
    isIPv4: function (str) {
        return validators.isIP(str, 4);
    },
    isIPv6: function (str) {
        return validators.isIP(str, 6);
    },
    isDecimal: validators.isFloat,
    notNull: function (str) {
        return !validator.isNull(str);
    },
    notEmpty: function (str) {
        return !/^[\s\t\r\n]*$/.test(validator.toString(str));
    },
    notContains: function (str, seed) {
        return !validators.contains(str, seed);
    },
    regex: validators.matches,
    notRegex: function () {
        return !validators.matches.apply(undefined, arguments);
    },
    len: validators.isLength,
    isUUIDv3: function () {
        return validators.isUUID(3);
    },
    isUUIDv4: function () {
        return validators.isUUID(4);
    },
    isUUIDv5: function () {
        return validators.isUUID(5);
    },
    max: function (str, val) {
        str = validator.toString(str);
        var number = parseFloat(str);
        return isNaN(number) || number <= val;
    },
    min: function (str, val) {
        str = validator.toString(str);
        var number = parseFloat(str);
        return isNaN(number) || number >= val;
    }
});

module.exports = validators;