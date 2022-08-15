"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTF = exports.CAS = exports.CSA = exports.BND = exports.WPS = exports.APS = exports.MDP = exports.Authorizer = void 0;
exports.Authorizer = require('./lib/Authorizer'); // Microservices interconnection authorization handler
exports.MDP = require('./lib/MDP'); // Main Data Provider
exports.APS = require('./lib/APS'); // Authentication Process Server
exports.WPS = require('./lib/WPS'); // Webhook Protocol Server
exports.BND = require('./lib/BND'); // Bulk Notification Dispatcher
exports.CSA = require('./lib/CSA'); // Cubic Server API
exports.CAS = require('./lib/CAS'); // CDN Assets Space
exports.DTF = require('./lib/DTF'); // Delta to File
exports.default = { Authorizer: exports.Authorizer, MDP: exports.MDP, APS: exports.APS, WPS: exports.WPS, BND: exports.BND, CSA: exports.CSA, CAS: exports.CAS, DTF: exports.DTF };
