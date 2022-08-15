"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = exports.validateField = exports.checkFormSchema = void 0;
var patterns_1 = __importDefault(require("./patterns"));
var pattern = new patterns_1.default();
// Middleway to check entry forms
var checkFormSchema = function (schema) {
    return function (req, res, next) {
        if (!Array.isArray(schema))
            return next();
        var form = ['GET'].includes(req.method) ? req.query : req.body;
        var _a = (0, exports.validateSchema)(schema, form), requires = _a.requires, invalids = _a.invalids, message = '', ERROR_FOUND = false, isLot;
        if (Array.isArray(requires) && requires.length) {
            // no defined but requried
            isLot = requires.length > 1;
            message += 'The Field' + (isLot ? 's' : '') + ' "' + requires.join(',') + '" ' + (isLot ? 'are' : 'is') + ' required';
            ERROR_FOUND = true;
        }
        if (Array.isArray(invalids) && invalids.length) {
            // wrong format set
            isLot = invalids.length > 1;
            message += (ERROR_FOUND ? ' And ' : 'The Field' + (isLot ? 's ' : ' '))
                + '"' + invalids.join(',') + '" formats ' + (isLot ? 'are' : 'is') + ' invalid';
            ERROR_FOUND = true;
        }
        if (ERROR_FOUND) {
            console.error('[REQUEST SCHEMA VALIDATION ERROR]: ' + message);
            res.status(400).json({ error: true, status: 'REQUEST_FORM::INVALID', message: message });
        }
        else
            next(); // valid form schema: proceed to next middleware of req callback function
    };
};
exports.checkFormSchema = checkFormSchema;
// Validate fields value with a defined pattern
var validateField = function (ptrn, value) { return pattern.test(ptrn, value); };
exports.validateField = validateField;
// validate form by type with pre-defined expected fields
var validateSchema = function (schema, form, parent) {
    var requires = [], invalids = [], parentKey = parent ? parent + '.' : '';
    if (!Array.isArray(schema) || !form)
        return false;
    if (schema.length) {
        var _loop_1 = function () {
            // Optional state
            if (!form[schema[x].name])
                !schema[x].optional ? requires.push(parentKey + schema[x].name) : null;
            // Multi-type possible
            else if (Array.isArray(schema[x].type)) {
                var oneValid_1 = false;
                schema[x].type.map(function (each) {
                    if (pattern.test(each, form[schema[x].name]))
                        oneValid_1 = true;
                });
                !oneValid_1 && invalids.push(parentKey + schema[x].name);
            }
            // Single type
            else if (!pattern.test(schema[x].type, form[schema[x].name]))
                invalids.push(parentKey + schema[x].name);
            // Also validate deep object field with a given schema
            if (schema[x].type == 'object' && Array.isArray(schema[x].schema)) {
                var result = (0, exports.validateSchema)(schema[x].schema, form[schema[x].name], parentKey + schema[x].name);
                [].push.apply(requires, result.requires);
                [].push.apply(invalids, result.invalids);
            }
        };
        for (var x = 0; x < schema.length; x++) {
            _loop_1();
        }
    }
    return { requires: requires, invalids: invalids };
};
exports.validateSchema = validateSchema;
exports.default = { checkFormSchema: exports.checkFormSchema, validateSchema: exports.validateSchema, validateField: exports.validateField };
