var assert = require('assert'),
    EValidator = require('../');

describe('EValidator', function () {
    var evSimple = new EValidator();
    evSimple.addRules({
        'name': [
            {validator: 'notEmpty', message: 'Name is empty!'},
            {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
            function (value, ctx) {
                if (value.charAt(0) != 'f')
                    ctx.addError('Name should start with f');
            },
            function (value, ctx, done) {
                setTimeout(function () {
                    if (value.length <= 3)
                        ctx.addError('Actually length must > 3');
                    done();
                }, 30);
            }
        ],
        'email': {validator: 'isEmail'}
    });

    it('should pass simple', function (done) {
        evSimple.validate({
            name: 'flux',
            email: 'fluxxu@gmail.com'
        }, function (err, result) {
            assert.ifError(err);
            assert.ok(!result.hasError(), 'Should not has error.');
            done();
        });
    });

    it('should fail name', function (done) {
        evSimple.validate({
            name: 'notflux',
            email: 'fluxxu@gmail.com'
        }, function (err, result) {
            assert.ifError(err);
            assert.ok(result.getErrors('name'));
            done();
        });
    });
});