"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signout = exports.config = void 0;
var request_1 = __importDefault(require("request"));
var express_1 = require("express");
var utils_1 = require("../utils");
/** APS Provided Routes
 *
 * - /auth/signin
 * - /auth/signout
 * - /auth/verification
 * - /auth/change-phone
 * - /auth/resend-sms
 * - /auth/create-account
 * - /auth/qrsignin
 *
 */
var ALLOWED_VERBS = [
    'signin',
    'signout',
    'verification',
    'change-phone',
    'resend/sms',
    'create-account',
    'qrsignin'
];
var CONFIG;
function To(verb, method, body, headers) {
    if (headers === void 0) { headers = {}; }
    return new Promise(function (resolve, reject) {
        Object.assign(headers, {
            // 'Origin': toOrigin( req.headers.host ),
            'X-User-Agent': CONFIG.userAgent || 'GB.web/1.0',
            'X-Auth-App': CONFIG.provider
        });
        (0, request_1.default)("".concat(CONFIG.baseURL, "/").concat(verb), { headers: headers, method: method, form: body, json: true, timeout: 20000 }, function (error, resp, body) {
            if (error)
                return reject({ error: true, status: 'AUTH::FAILED', message: error });
            resolve(body);
        });
    });
}
function config(options) {
    var _this = this;
    if (typeof options != 'object')
        return function (req, res, next) { return next('[APS]: No Authentication Configuration Found'); };
    CONFIG = __assign(__assign({}, (CONFIG || {})), options);
    // Check whether all configuration field are defined
    (0, utils_1.checkConfig)('APS', CONFIG);
    return (0, express_1.Router)().all('/auth/*', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var verb, body, _a, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    verb = req.url.replace('/auth/', ''), body = req.method == 'GET' ? req.query : req.body;
                    // Only allowed route verbs
                    if (!ALLOWED_VERBS.includes(verb))
                        return [2 /*return*/, next('No Found')
                            // Send request and forward answer
                        ];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    _b = (_a = res).json;
                    return [4 /*yield*/, To(verb, req.method, body)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    res.json({ error: true, status: 'AUTH::FAILED', message: 'Unexpected Error Occured' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
exports.config = config;
var signout = function (ctoken, deviceId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('signout', 'GET', false, { 'X-Auth-Token': ctoken, 'X-Auth-Device': deviceId })];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, { error: true, status: 'AUTH::FAILED', message: 'Unexpected Error Occured' }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signout = signout;
