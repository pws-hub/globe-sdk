"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var Transport_1 = __importDefault(require("./wrappers/Transport"));
var Template_1 = __importDefault(require("./wrappers/Template"));
var Registry_1 = __importDefault(require("./wrappers/Registry"));
var Sender_1 = __importDefault(require("./wrappers/Sender"));
var verb_1 = __importDefault(require("./verb"));
var utils_1 = require("../../utils");
function config(config) {
    // Check whether all configuration field are defined
    (0, utils_1.checkConfig)('BND', config);
    /** Generate BND request headers Object and
     * make config available globally for any other
     * BND import in other module of the project
     */
    config.headers = {
        'Origin': config.host,
        'BND-User-Agent': config.userAgent,
        'BND-Application': config.application,
        'BND-Access-Token': config.accessToken
    };
    global.Globe_BNDConfig = config;
    var verb = (0, verb_1.default)(config), api = {
        send: (0, Sender_1.default)(verb),
        registry: (0, Registry_1.default)(verb),
        template: (0, Template_1.default)(verb),
        transport: (0, Transport_1.default)(verb)
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
            req.bnd = api;
            next();
        }
    });
}
exports.config = config;
