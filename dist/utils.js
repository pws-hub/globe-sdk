"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.toCapitalCase = exports.getOrigin = exports.checkConfig = void 0;
var url_1 = require("url");
var DEBUG_MODE = true;
var checkConfig = function (type, config) {
    if (!config)
        throw new Error("[".concat(type, "] No configuration defined"));
    if (typeof config !== 'object')
        throw new Error("[".concat(type, "] Invalid configuration"));
    var requiredFields = [];
    switch (type) {
        case 'Authorizer':
            requiredFields = ['service', 'manifest', 'agentHeader', 'tokenHeader'];
            break; // 'expiry', 'rotateToken', 'allowedOrigins'
        case 'APS':
            requiredFields = ['baseURL', 'provider'];
            break;
        case 'CSA':
            requiredFields = ['baseURL', 'accessToken'];
            break;
        case 'WPS':
            requiredFields = ['server', 'userAgent', 'provider', 'host', 'accessToken'];
            break;
        case 'BND':
            requiredFields = ['server', 'userAgent', 'application', 'host', 'accessToken'];
            break;
        case 'CAS':
            requiredFields = ['accessKey', 'secret', 'spaces', 'defaultRegion', 'compressKey'];
            break;
        case 'CAS:SPACE':
            requiredFields = ['region', 'endpoint', 'host', 'bucket'];
            break;
        case 'MDP.DS':
            requiredFields = ['server', 'userAgent', 'host', 'accessToken', 'collections'];
            break;
        case 'MDP.DB':
            requiredFields = ['dbServer', 'dbName', 'collections'];
            break;
    }
    for (var o = 0; o < requiredFields.length; o++) {
        if (!config.hasOwnProperty(requiredFields[o]))
            throw new Error("[".concat(type, "] <").concat(requiredFields[o], "> configuration is required"));
    }
};
exports.checkConfig = checkConfig;
var getOrigin = function (hreq) {
    var origin = typeof hreq == 'object' ?
        hreq.headers.origin ?
            new url_1.URL(hreq.headers.origin).hostname
            : hreq.headers.host
        : (hreq || '').replace(/http(s?):\/\//, '');
    return (origin || '').replace(/:[0-9]{4,}/, '');
};
exports.getOrigin = getOrigin;
var toCapitalCase = function (arg) {
    // Fonction de capitalisation du premier caractère d'un mot
    arg = arg.toLowerCase();
    var First = arg.charAt(0);
    return First.toUpperCase() + arg.split(new RegExp('^' + First))[1];
};
exports.toCapitalCase = toCapitalCase;
var debug = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return DEBUG_MODE && console.log.apply(console, args);
};
exports.debug = debug;
