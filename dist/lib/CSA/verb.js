"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
exports.default = (function (config) {
    return function (verb, method, body) {
        return new Promise(function (resolve, reject) {
            if (typeof (config || Globe_CSAConfig) !== 'object')
                return reject({ error: true, status: 'CSA-REQUEST::FAILED', message: 'Undefined Configuration' });
            var _a = config || Globe_CSAConfig, baseURL = _a.baseURL, headers = _a.headers;
            (0, request_1.default)("".concat(baseURL, "/").concat(verb), { headers: headers, method: method, body: body, json: true, timeout: 8000 }, function (error, resp, body) {
                if (error)
                    return reject({ error: true, status: 'CSA-REQUEST::FAILED', message: error });
                resolve(typeof body != 'string' ? body : { error: true, status: 'CSA-REQUEST::FAILED', message: body });
            });
        });
    };
});
