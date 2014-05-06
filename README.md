EValidator
==========
An object validator utilizing node-validator. Supports sync/async validation and scenarios.
## Quick Example
```javascript
var ev = new EValidator();
// Add a group of default rules
// These rules always get executed
ev.addRules({
    'name': [
        {validator: 'notEmpty', message: 'Name is empty!'},
        {validator: 'is', args: [/^[a-z]+$/]},
        {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
        function (value, ctx) {
            if (value.charAt(0) != 'f') {
                ctx.addError('Name should start with f');
            }
        },
        //async validation function
        function (value, ctx, done) {
            setTimeout(function () {
                if (value.length <= 3)
                    ctx.addError('Actually length must > 3');
                done();
            }, 30);
        },
        //async rule using promise
        function (value, ctx) {
            return someAction().then(function (success) {
                if (!success)
                    ctx.addError('someAction failed');
            });
        },
    ],
    'email': {validator: 'isEmail', allowEmpty: true}
}).
//This group executes only in 'onCreate' scenario
addRules({
    'name': function (value, ctx) {
        if (value == 'flux') {
            ctx.addError('Name cannot be flux');
        }
    },
    'email': function (value, ctx, done) {
        if (value == 'flux@mail.com') {
            ctx.addError('Email cannot be flux@mail.com');
        }
        done();
    }
}, 'onCreate');

var obj = {
    name: 'flux',
    email: ''
};

//execute default rules
ev.validate(obj, function (err, result) {
    if (result.hasError()) {
      //all errors, maped by attribute name
      console.log(result.getErrors());
      
      //get errors of 'name' attribute
      console.log(result.getError('name'));
    }
});

//use promise
ev.validate(obj)
    .then(function (err, result) {
        assert.ifError(err);
        if (result.hasError()) {
          //all errors, maped by attribute name
          console.log(result.getErrors());
          
          //get errors of 'name' attribute
          console.log(result.getError('name'));
        }
    }, function (err) {
        throw err;
    });

//execute default rules and 'onCreate' scenario rules
ev.validate(obj, 'onCreate', function (err, result) {
    //...
});
```

### Validators (validator.js 3.x.x)

- **equals(str, comparison)** - check if the string matches the comparison.
- **contains(str, seed)** - check if the string contains the seed.
- **matches(str, pattern [, modifiers])** - check if string matches the pattern. Either `matches('foo', /foo/i)` or `matches('foo', 'foo', 'i')`.
- **isEmail(str)** - check if the string is an email.
- **isURL(str [, options])** - check if the string is an URL. `options` is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false }`.
- **isIP(str [, version])** - check if the string is an IP (version 4 or 6).
- **isAlpha(str)** - check if the string contains only letters (a-zA-Z).
- **isNumeric(str)** - check if the string contains only numbers.
- **isAlphanumeric(str)** - check if the string contains only letters and numbers.
- **isHexadecimal(str)** - check if the string is a hexadecimal number.
- **isHexColor(str)** - check if the string is a hexadecimal color.
- **isLowercase(str)** - check if the string is lowercase.
- **isUppercase(str)** - check if the string is uppercase.
- **isInt(str)** - check if the string is an integer.
- **isFloat(str)** - check if the string is a float.
- **isDivisibleBy(str, number)** - check if the string is a number that's divisible by another.
- **isNull(str)** - check if the string is null.
- **isLength(str, min [, max])** - check if the string's length falls in a range.
- **isUUID(str [, version])** - check if the string is a UUID (version 3, 4 or 5).
- **isDate(str)** - check if the string is a date.
- **isAfter(str [, date])** - check if the string is a date that's after the specified date (defaults to now).
- **isBefore(str [, date])** - check if the string is a date that's before the specified date.
- **isIn(str, values)** - check if the string is in a array of allowed values.
- **isCreditCard(str)** - check if the string is a credit card.
- **isISBN(str [, version])** - check if the string is an ISBN (version 10 or 13).
- **isJSON(str)** - check if the string is valid JSON (note: uses JSON.parse).
- **isMultibyte(str)** - check if the string contains one or more multibyte chars.
- **isAscii(str)** - check if the string contains ASCII chars only.
- **isFullWidth(str)** - check if the string contains any full-width chars.
- **isHalfWidth(str)** - check if the string contains any half-width chars.
- **isVariableWidth(str)** - check if the string contains a mixture of full and half-width chars.

### validator.js 1.x.x polyfills
- **is()**                            //Alias for regex()
- **not()**                           //Alias for notRegex()
- **isUrl()**                         //Accepts http, https, ftp
- **isIPv4()**
- **isIPv6()**
- **isDecimal()**
- **notNull()**                       //Check if length is 0
- **notEmpty()**                      //Not just whitespace (input.trim().length !== 0)
- **regex(pattern, modifiers)**       //Usage: regex(/[a-z]/i) or regex('[a-z]','i')
- **notRegex(pattern, modifiers)**
- **len(min, max)**                   //max is optional
- **isUUIDv3()**                      //Alias for isUUID(3)
- **isUUIDv4()**                      //Alias for isUUID(4)
- **isUUIDv5()**                      //Alias for isUUID(5)
- **notIn(options)**
- **max(val)**
- **min(val)**
