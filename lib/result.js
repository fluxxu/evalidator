var _ = require('lodash');

function Result(results) {
    /**
     * Check has error
     * @returns {boolean}
     */
    this.hasError = function () {
        return _.size(results) > 0;
    };

    /**
     * Get errors for prop or all errors
     * @param {string} [prop]
     * @returns {Array.<string>|Object.<string, Array.<string>>}
     */
    this.getErrors = function (prop) {
        if (prop) {
            return prop in results ? results[prop] : [];
        }
        return results;
    };
}

module.exports = Result;