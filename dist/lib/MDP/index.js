"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/** Data Query Interface/Driver

  Give a simple interface that reduce the hassle of making
  traditional API request and its params to a MongoDB Database
  or and external Data-Provider server.
  
  @author Fabrice Marlboro
  @date 31/03/2021
  
*/
var DB_1 = __importDefault(require("./DB"));
var DS_1 = __importDefault(require("./DS"));
var utils_1 = require("../../utils");
var config = function (type, options) {
    // Check whether all configuration field are defined
    (0, utils_1.checkConfig)('MDP.' + type.toUpperCase(), options);
    switch (type.toLowerCase()) {
        // Data Provider (External Server)
        case 'ds': return new DS_1.default(options);
        // DataBase (Internal Connection to database)
        case 'db':
        default: return (0, DB_1.default)(options);
    }
};
exports.config = config;
