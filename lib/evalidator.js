var _ = require('lodash'),
    async = require('async'),
    Promise = require('bluebird'),
    Validator = require('validator').Validator;

var Result = require('./result');

/**
 * EValidator
 * @param {Object} [options]
 * @constructor
 */
function EValidator(options) {
    options = options || {};
    var obj_ = null,
        scenarioGroups_ = {},
        alwaysGroups_ = [],
        validatorInstance = new Validator();

    //add rules in options
    if (options.hasOwnProperty('rules'))
        alwaysGroups_.push(options.rules);

    var extractValue_ = function (obj, attr) {
        if (attr in obj)
            return obj[attr];

        var segments = attr.split('.');
        if (segments.length > 1) {
            var parent = obj;
            for (var i = 0; parent && i < segments.length; ++i)
                parent = parent[segments[i]];
            return parent;
        } else
            return undefined;
    };

    var execRule_ = function (attr, rule, errorMap, done) {
        var value = extractValue_(obj_, attr),
            errors = [],
            finish_=  function () {
                if (errors.length)
                    errorMap[attr] = errorMap[attr] ? errorMap[attr].concat(errors) : errors;
                done.apply(done, arguments);
            },
            ctx = {
                /**
                 * Set/get attribute
                 * @param {string} attr
                 * @param {string} [value]
                 */
                'attr': function (attr, value) {
                    if (value) {
                        obj_[attr] = value;
                        return undefined;
                    }
                    else
                        return obj_[attr] || null;
                },
                /**
                 * @param {string} error
                 */
                'addError': function (error) {
                    errors.push(error);
                }
            };

        if (_.isObject(rule) && rule.validator) {
            //node-validator function
            //{validator:'name', args: [...], message:''}
            var validatorName = rule.validator,
                args = rule.args,
                message = rule.message,
                allowEmpty = rule.allowEmpty;
            if (!(validatorName in Validator.prototype)) {
                finish_(new Error('Validator not found: ' + validatorName));
                return;
            }

            if (allowEmpty && !value) {
                finish_();
                return;
            }

            var err,
                func = Validator.prototype[validatorName];
            validatorInstance.check(value, message);
            try {
                if (args)
                    func.apply(validatorInstance, args);
                else
                    func.call(validatorInstance);
            } catch (e) {
                if (e.name == 'ValidatorError')
                    errors.push(e.message);
                else
                    err = e;
            }
            finish_(err);
        } else if (_.isFunction(rule)) {
            //customize function
            if (rule.length == 2) {
                //sync or returns promise
                //value, context
                Promise.cast(rule.call(obj_, value, ctx)).then(function () {
                    finish_();
                }, finish_);
            } else if (rule.length == 3) {
                //async
                //value, context, done
                rule.call(obj_, value, ctx, finish_);
            } else {
                finish_(new Error("Invalid validate function for '" + attr + "': " + rule));
            }
        } else {
            finish_(new Error("Invalid validate rule for '" + attr + "': " + rule));
        }
    };

    var execGroup_ = function (rules, done) {
        var errorMap = {},
            tasks = [],
            push_ = function (attr, rule) {
                tasks.push(function (next) {
                    execRule_(attr, rule, errorMap, next);
                });
            };

        _.each(rules, function (rule, attr) {
            if (_.isArray(rule)) {
                _.each(rule, function (item) {
                    push_(attr, item);
                });
            } else {
                push_(attr, rule);
            }
        });

        async.series(tasks, function (err) {
            if (err) {
                done(err);
            }
            else {
                done(null, errorMap);
            }
        })
    };

    var getResult_ = function (errorMaps) {
        var merged = {};
        errorMaps.forEach(function (errorMap) {
            _.each(errorMap, function (errors, attr) {
                merged[attr] = (merged[attr] || []).concat(errors);
            });
        });
        return new Result(merged);
    };

    /**
     * Run validation
     * @param obj
     * @param scenario
     * @param done
     * @private
     */
    var validate_ = function (obj, scenario, done) {
        obj_ = obj;

        var tasks = [];
        //Always rules
        alwaysGroups_.forEach(function (group) {
            tasks.push(function (next) {
                execGroup_(group, next);
            });
        });

        if (scenario) {
            //Scenario rules
            scenarioGroups_[scenario].forEach(function (group) {
                tasks.push(function (next) {
                    execGroup_(group, next);
                });
            });
        }

        if (tasks.length) {
            async.parallel(tasks, function (err, results) {
                if (err) {
                    obj_ = null;
                    done(err);
                }
                else {
                    obj_ = null;
                    done(null, getResult_(results));
                }
            });
        } else {
            obj_ = null;
            done(null, new Result({}));
        }
    };

    /**
     * Add a group of rule
     * @param {Object} rulesGroup   Rules mapped to properties
     * @param {string} [scenario]   Scenario name. If omitted, rules always execute
     */
    this.addRules = function (rulesGroup, scenario) {
        if (scenario) {
            if (!_.isArray(scenarioGroups_[scenario])) {
                scenarioGroups_[scenario] = [];
            }
            scenarioGroups_[scenario].push(rulesGroup);
        } else {
            alwaysGroups_.push(rulesGroup);
        }
        return this;
    };

    /**
     * Validate object
     * @param {Object} obj          Object to validate
     * @param {string|function} [scenario]   Scenario name
     * @param {function} [done]     Callback. If not provided, a promise will be returned
     */
    this.validate = function (obj, scenario, done) {
        var argc = arguments.length;
        if (argc < 1) {
            throw new Error('Validation target object is required.');
        }

        if (argc == 2 && _.isFunction(scenario)) {
            done = scenario;
            scenario = undefined;
        } else if (argc > 2 && !_.isFunction(done)) {
            throw new Error('Callback argument is not a function.');
        }

        if (!_.isObject(obj)) {
            throw new Error('Object to validate is invalid.');
        }

        if (scenario && !(scenario in scenarioGroups_)) {
            throw new Error('Scenario not found.');
        }

        if (done)
            validate_(obj, scenario, done);
        else {
            return new Promise(function (resolve, reject) {
                validate_(obj, scenario, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            });
        }
    };
}

module.exports = EValidator;