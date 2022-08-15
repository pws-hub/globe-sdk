"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var Workspaces_1 = __importDefault(require("./wrappers/Workspaces"));
var verb_1 = __importDefault(require("./verb"));
var utils_1 = require("../../utils");
var config = function (config) {
    // Check whether all configuration field are defined
    (0, utils_1.checkConfig)('CSA', config);
    /** Generate CSA request headers Object and
     * make config available globally for any other
     * CSA import in other module of the project
     */
    config.headers = {
        'Authorization': 'Bearer ' + config.accessToken,
        'Content-Type': 'application/json'
    };
    global.Globe_CSAConfig = config;
    var verb = (0, verb_1.default)(config), api = {
        workspaces: (0, Workspaces_1.default)(verb)
    };
    return Object.assign(api, {
        setConfig: function (fields) {
            if (typeof fields != 'object')
                return false;
            // Update existing configuration
            Object.assign(config, fields);
            return true;
        },
        middleware: function (req, res, next) {
            if (typeof req != 'object' || !req.url)
                return;
            req.csa = api;
            next();
        }
    });
};
exports.config = config;
