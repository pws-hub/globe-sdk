"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.connect = exports.setConfig = exports.config = void 0;
var Connect_1 = __importDefault(require("./Connect"));
exports.connect = Connect_1.default;
var APIWrapper_1 = __importDefault(require("./APIWrapper"));
exports.api = APIWrapper_1.default;
var utils_1 = require("../../utils");
var config = function (config) {
    // Check whether all configuration field are defined
    (0, utils_1.checkConfig)('WPS', config);
    /** Generate WPS request headers Object and
     * make config available globally for any other
     * WPS import in other module of the project
     */
    config.headers = {
        'Origin': "//".concat(config.host),
        'WPS-User-Agent': config.userAgent,
        'WPS-Event-Provider': config.provider,
        'WPS-Access-Token': config.accessToken
    };
    global.Globe_WPSConfig = config;
};
exports.config = config;
var setConfig = function (config) {
    if (typeof config != 'object')
        return false;
    // Update existing configuration
    Object.assign(global.Globe_WPSConfig, config);
    return true;
};
exports.setConfig = setConfig;
