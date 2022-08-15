"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extraSet(str) {
    var combines = str.split(/ ?: ?/);
    return combines.length == 2 ? combines : [str, false];
}
var Pattern = /** @class */ (function () {
    function Pattern() {
        this.date = function (value) {
            // validate a date
            // return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value )
        };
    }
    Pattern.prototype.test = function (rule, value) {
        // execute a function related to the rule specified
        if (/-/.test(rule))
            return this.multipleIdentity(rule.split('-'), value); // rule of multiple different type of value possible
        else {
            var pattern = extraSet(rule);
            return typeof this[pattern[0]] == 'function' ? this[pattern[0]](value, pattern[1]) : false; // strict rule application
        }
    };
    Pattern.prototype.multipleIdentity = function (list, value, extra) {
        // handle inputs that can have multiple different type of value possible
        // Can have: Email or phone or date or ...
        var state = false;
        if (list.length)
            // test if the value correspond to one of the type of the list
            for (var o = 0; o < list.length; o++) {
                var pattern = extraSet(list[o]);
                if (typeof this[pattern[0]] == 'function' && this[pattern[0]](value, pattern[1])) {
                    state = true;
                    break;
                }
            }
        return state;
    };
    Pattern.prototype.required = function (value) {
        // validate
        return /[a-zA-Z0-9]/.test(value);
    };
    Pattern.prototype.url = function (value) {
        // validate a url
        return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test(value);
    };
    Pattern.prototype.email = function (value) {
        // validate an email
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/i.test(value);
    };
    Pattern.prototype.phone = function (value) {
        // validate a phone number
        return /\d{7,}|(\d{2,} ) => {3,}/.test(String(value));
    };
    Pattern.prototype.fullname = function (value) {
        // validate a full name ( two word minimum )
        return /[a-zA-Z]/.test(value) && value.split(' ').length > 1;
    };
    Pattern.prototype.number = function (value) {
        // validate a number
        return typeof value == 'number' || !/[a-zA-Z]/.test(value);
    };
    Pattern.prototype.boolean = function (value) {
        // validate a boolean words
        return typeof value == 'boolean';
    };
    Pattern.prototype.string = function (value) {
        // validate a string words
        return typeof value == 'string';
    };
    Pattern.prototype.array = function (value) {
        // validate an array
        return Array.isArray(value);
    };
    Pattern.prototype.object = function (value) {
        // validate an object
        return typeof value == 'object' && !Array.isArray(value);
    };
    Pattern.prototype.password = function (value, type) {
        // validate a string words
        var TYPES = { weak: 1, medium: 2, strong: 3, perfect: 4 }, stars = 0, status;
        // Determine the level of password
        if (/(?=.*[a-z].*[a-z].*[a-z])/.test(value))
            stars++; // required string characters
        if (/(?=.*[!@#$&*])/.test(value))
            stars++; // required at least one special characters
        if (/(?=.*[A-Z].*[A-Z])/.test(value))
            stars++; // required at least one capital characters
        if (/(?=.*[0-9].*[0-9])/.test(value))
            stars++; // required numbers
        if (/.{12,20}/.test(value))
            stars += 2; // should length between 12 - 20 characters as long and strong password
        else if (/.{8,12}/.test(value))
            stars++; // should length between 8 - 12 characters as standard
        // Redable password status
        if (stars >= 0 && stars < 2)
            status = { type: 'weak', indice: 1 };
        else if (stars >= 2 && stars < 4)
            status = { type: 'medium', indice: 2 };
        else if (stars >= 4 && stars < 6)
            status = { type: 'strong', indice: 3 };
        else if (stars >= 6)
            status = { type: 'perfect', indice: 4 };
        return TYPES.hasOwnProperty(type) && TYPES[type] <= status.indice;
    };
    Pattern.prototype.length = function (value, size) {
        // validate a length of characters in the value
        return value.length == parseInt(size);
    };
    Pattern.prototype.minLength = function (value, size) {
        // validate value superior to min size specified
        return value.length >= parseInt(size);
    };
    Pattern.prototype.maxLength = function (value, size) {
        // validate value inferior to max size specified
        return value.length <= parseInt(size);
    };
    return Pattern;
}());
exports.default = Pattern;
