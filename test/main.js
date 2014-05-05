var assert = require('assert'),
    EValidator = require('../'),
    Promise = require('bluebird');

describe('EValidator', function () {
    describe('Single group', function () {
        var evSimple = new EValidator();
        evSimple.addRules({
            'name': [
                {validator: 'notEmpty', message: 'Name is empty!'},
                {validator: 'is', args: [/^[a-z]+$/]},
                {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
                function (value, ctx) {
                    if (value.charAt(0) != 'f') {
                        ctx.addError('Name should start with f');
                    }
                },
                function (value, ctx, done) {
                    setTimeout(function () {
                        if (value.length <= 3)
                            ctx.addError('Actually length must > 3');
                        done();
                    }, 30);
                }
            ],
            'email': {validator: 'isEmail', allowEmpty: true}
        });

        it('should pass', function (done) {
            evSimple.validate({
                name: 'flux',
                email: ''
            }, function (err, result) {
                assert.ifError(err);
                assert.ok(!result.hasError(), 'Should not have error.');
                done();
            });
        });

        it('should fail with 1 error (1 async)', function (done) {
            evSimple.validate({
                name: 'notflux',
                email: 'fluxxu@gmail.com'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 1, 'Should have 1 error');
                assert.deepEqual(result.getErrors('name'), errors.name);
                done();
            });
        });

        it('should fail with 4 errors (2 node-validator, 1 sync, 1 async, same attribute)', function (done) {
            evSimple.validate({
                name: '!',
                email: 'fluxxu@gmail.com'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 4, 'Should have 4 errors');
                assert.deepEqual(result.getErrors('name'), errors.name);
                done();
            });
        });

        it('should fail with 5 errors (3 node-validator, 1 sync, 1 async, 2 attributes)', function (done) {
            evSimple.validate({
                name: '!',
                email: 'fluxxu!!!'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 4, 'name: Should have 4 errors');
                assert.ok(errors.email.length == 1, 'email: Should have 1 errors');
                done();
            });
        });
    });

    describe('multiple groups without scenario', function () {
        var ev2Groups = new EValidator();
        ev2Groups.
            addRules({
                'name': [
                    {validator: 'notEmpty', message: 'Name is empty!'},
                    {validator: 'is', args: [/^[a-z]+$/]},
                    {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
                    function (value, ctx) {
                        if (value.charAt(0) != 'f') {
                            ctx.addError('Name should start with f');
                        }
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
            }).
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
            });

        it('should pass', function (done) {
            ev2Groups.validate({
                name: 'fluxzzz',
                email: 'fluxxu@gmail.com'
            }, function (err, result) {
                assert.ifError(err);
                assert.ok(!result.hasError(), 'Should not have error.');
                done();
            });
        });

        it('should fail with 1 error', function (done) {
            ev2Groups.validate({
                name: 'notflux',
                email: 'fluxxu@gmail.com'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 1, 'Should have 1 error');
                assert.deepEqual(result.getErrors('name'), errors.name);
                done();
            });
        });

        it('should fail with 4 errors', function (done) {
            ev2Groups.validate({
                name: '!',
                email: 'fluxxu@gmail.com'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 4, 'Should have 4 errors');
                assert.deepEqual(result.getErrors('name'), errors.name);
                done();
            });
        });

        it('should fail with 5 errors', function (done) {
            ev2Groups.validate({
                name: '!',
                email: 'fluxxu!!!'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 4, 'name: Should have 4 errors');
                assert.ok(errors.email.length == 1, 'email: Should have 1 errors');
                done();
            });
        });

        it('should fail with 2 errors', function (done) {
            ev2Groups.validate({
                name: 'flux',
                email: 'flux@mail.com'
            }, function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 1, 'name: Should have 1 error');
                assert.ok(errors.email.length == 1, 'email: Should have 1 error');
                done();
            });
        });
    });

    describe('multiple groups with scenario', function () {
        var ev2GroupsS = new EValidator();
        ev2GroupsS.
            addRules({
                'name': [
                    {validator: 'notEmpty', message: 'Name is empty!'},
                    {validator: 'is', args: [/^[a-z]+$/]},
                    {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
                    function (value, ctx) {
                        if (value.charAt(0) != 'f') {
                            ctx.addError('Name should start with f');
                        }
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
            }).
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
            }, 's1');

        it('should pass', function (done) {
            ev2GroupsS.validate({
                name: 'flux',
                email: 'flux@mail.com'
            }, function (err, result) {
                assert.ifError(err);
                assert.ok(!result.hasError(), 'Should not have error.');
                done();
            });
        });

        it('should fail with 2 errors', function (done) {
            ev2GroupsS.validate({
                name: 'flux',
                email: 'flux@mail.com'
            }, 's1', function (err, result) {
                assert.ifError(err);
                var errors = result.getErrors();
                assert.ok(errors.name.length == 1, 'name: Should have 1 error');
                assert.ok(errors.email.length == 1, 'email: Should have 1 error');
                done();
            });
        });
    });

    it('nested attribute name', function (done) {
        var ev = new EValidator();
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
                function (value, ctx, done) {
                    setTimeout(function () {
                        if (value.length <= 3)
                            ctx.addError('Actually length must > 3');
                        done();
                    }, 30);
                }
            ],
            'email': {validator: 'isEmail', allowEmpty: true},
            'test.nested.value': {validator: 'notEmpty'},
            'test.nested.value2': {validator: 'notEmpty'}
        });

        ev.validate({
            name: 'flux',
            test: {
                nested: {
                    value: 999
                    //value2: ''
                }
            }
        }, function (err, result) {
            assert.ifError(err);
            var errors = result.getErrors();
            assert.ok(errors['test.nested.value2'] && errors['test.nested.value2'].length == 1, 'test.nested.value2: Should have 1 error');
            done();
        });
    });

    it('promise', function () {
        var ev = new EValidator({
            rules: {
                'name': [
                    {validator: 'notEmpty', message: 'Name is empty!'},
                    {validator: 'is', args: [/^[a-z]+$/]},
                    {validator: 'len', args: [2, 16], message: 'Length should be between 2 and 16'},
                    function (value, ctx) {
                        if (value.charAt(0) != 'f') {
                            ctx.addError('Name should start with f');
                        }
                    },
                    function (value, ctx) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                if (value.length <= 3)
                                    ctx.addError('Actually length must > 3');
                                resolve();
                            }, 30);
                        });
                    }
                ],
                'email': {validator: 'isEmail', allowEmpty: true},
                'test.nested.value': {validator: 'notEmpty'},
                'test.nested.value2': {validator: 'notEmpty'}
            }
        });

        return ev.validate({
            name: 'flux',
            test: {
                nested: {
                    value: 999
                    //value2: ''
                }
            }
        })
            .then(function (result) {
                var errors = result.getErrors();
                assert.ok(errors['test.nested.value2'] && errors['test.nested.value2'].length == 1, 'test.nested.value2: Should have 1 error');
            });
    });
});