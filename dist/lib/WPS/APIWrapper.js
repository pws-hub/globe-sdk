"use strict";
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
exports.send = exports.getOutgoingRequestToken = exports.getIncomingRequestToken = exports.getIncomingRequestURL = exports.testURL = exports.deleteApp = exports.updateApp = exports.getApps = exports.getApp = exports.createApp = void 0;
var request_1 = __importDefault(require("request"));
function To(verb, method, body) {
    return new Promise(function (resolve, reject) {
        if (typeof Globe_WPSConfig !== 'object')
            return reject({ error: true, status: 'WPS-REQUEST::FAILED', message: 'Undefined Configuration' });
        var server = Globe_WPSConfig.server, headers = Globe_WPSConfig.headers;
        (0, request_1.default)("".concat(server, "/v1/").concat(verb), { headers: headers, method: method, form: body, json: true, timeout: 8000 }, function (error, resp, body) {
            if (error)
                return reject({ error: true, status: 'WPS-REQUEST::FAILED', message: error });
            resolve(body);
        });
    });
}
var createApp = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('application/create', 'POST', payload)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, error_1];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createApp = createApp;
var getApp = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('application/' + appId, 'GET')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, error_2];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getApp = getApp;
var getApps = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('application/list', 'GET')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, error_3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getApps = getApps;
var updateApp = function (appId, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('application/update/' + appId, 'PUT', payload)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, error_4];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateApp = updateApp;
var deleteApp = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('application/delete/' + appId, 'DELETE')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, error_5];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteApp = deleteApp;
var testURL = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('testurl', 'POST', payload)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, error_6];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.testURL = testURL;
var getIncomingRequestURL = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('generate/url/' + appId, 'GET')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, error_7];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getIncomingRequestURL = getIncomingRequestURL;
var getIncomingRequestToken = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('generate/incoming_token/' + appId, 'GET')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, error_8];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getIncomingRequestToken = getIncomingRequestToken;
var getOutgoingRequestToken = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, To('generate/outgoing_token/' + appId, 'GET')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                error_9 = _a.sent();
                return [2 /*return*/, error_9];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOutgoingRequestToken = getOutgoingRequestToken;
var send = function (appId, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var response, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof Globe_WPSConfig !== 'object')
                    return [2 /*return*/, { error: true, status: 'WPS-REQUEST::FAILED', message: 'Undefined Configuration' }
                        // Get Incoming request URL and save in Configs for next request
                    ];
                if (!!Globe_WPSConfig.sendVerb) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.getIncomingRequestURL)(appId)];
            case 1:
                response = _a.sent();
                if (response.error)
                    return [2 /*return*/, response];
                Globe_WPSConfig.sendVerb = response.result.replace(Globe_WPSConfig.sendVerb + '/v1/', '');
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, To(Globe_WPSConfig.sendVerb, 'POST', payload)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                error_10 = _a.sent();
                return [2 /*return*/, error_10];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.send = send;
exports.default = {
    createApp: exports.createApp,
    getApp: exports.getApp,
    getApps: exports.getApps,
    updateApp: exports.updateApp,
    deleteApp: exports.deleteApp,
    testURL: exports.testURL,
    getIncomingRequestURL: exports.getIncomingRequestURL,
    getIncomingRequestToken: exports.getIncomingRequestToken,
    getOutgoingRequestToken: exports.getOutgoingRequestToken,
    send: exports.send
};
