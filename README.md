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
