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

### List of validation methods(validator.js 1.x.x)
```javascript
is()                            //Alias for regex()
not()                           //Alias for notRegex()
isEmail()
isUrl()                         //Accepts http, https, ftp
isIP()                          //Combines isIPv4 and isIPv6
isIPv4()
isIPv6()
isAlpha()
isAlphanumeric()
isNumeric()
isHexadecimal()
isHexColor()                    //Accepts valid hexcolors with or without # prefix
isInt()                         //isNumeric accepts zero padded numbers, e.g. '001', isInt doesn't
isLowercase()
isUppercase()
isDecimal()
isFloat()                       //Alias for isDecimal
notNull()                       //Check if length is 0
isNull()
notEmpty()                      //Not just whitespace (input.trim().length !== 0)
equals(equals)
contains(str)
notContains(str)
regex(pattern, modifiers)       //Usage: regex(/[a-z]/i) or regex('[a-z]','i')
notRegex(pattern, modifiers)
len(min, max)                   //max is optional
isUUID(version)                 //Version can be 3, 4 or 5 or empty, see http://en.wikipedia.org/wiki/Universally_unique_identifier
isUUIDv3()                      //Alias for isUUID(3)
isUUIDv4()                      //Alias for isUUID(4)
isUUIDv5()                      //Alias for isUUID(5)
isDate()                        //Uses Date.parse() - regex is probably a better choice
isAfter(date)                   //Argument is optional and defaults to today. Comparison is non-inclusive
isBefore(date)                  //Argument is optional and defaults to today. Comparison is non-inclusive
isIn(options)                   //Accepts an array or string
notIn(options)
max(val)
min(val)
isCreditCard()                  //Will work against Visa, MasterCard, American Express, Discover, Diners Club, and JCB card numbering formats
```