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
/** Data-Provider Interface/Driver

  Give a simple interface that reduce the hassle of making
  traditional API request and its params to the Data-Provider
  server.
  
  @author Fabrice Marlboro

  @params collections (Array) List of collections, subject of query
                      transactions or use function "arguments" as alternative
  @params options:
      - agent: User-Agent or this consumer (Know by the DP)
      - token: Authentication token given to the consumer by the Data-Provider

  WARNING: Requires environment variable (in .env file) like:
    - MDP_ENDPOINT = Host of the Main Data Provider server
    - MDP_ACCESS_TOKEN = Access token to that server
    - USER_AGENT & USER_AGENT_VERSION = to be identify as the request origin
    - ADDRESS = Define the origin of query requests (Optional: default is IP address of the server)
*/
var url_1 = require("url");
var request_1 = __importDefault(require("request"));
var CONFIG;
var isEmpty = function (entry) {
    // test empty array or object
    if (!entry || typeof entry !== 'object')
        return null;
    return Array.isArray(entry) ?
        !entry.length
        : Object.keys(entry).length === 0 && entry.constructor === Object;
}, getOrigin = function (hreq) {
    var origin = hreq.headers.origin ?
        new url_1.URL(hreq.headers.origin).hostname
        : hreq.headers.host;
    return (origin || '').replace(/:[0-9]{4,}/, '');
}, getAddress = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i, exec = require('child_process').exec;
    var cached, command, filterRE;
    switch (process.platform) {
        case 'win32':
            command = 'ipconfig';
            filterRE = /\bIPv[46][^:\r\n]+:\s*([^\s]+)/g;
            break;
        case 'darwin':
            command = 'ifconfig';
            filterRE = /\binet\s+([^\s]+)/g;
            // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
            break;
        default:
            command = 'ifconfig';
            filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
            // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
            break;
    }
    return function (bypassCache) {
        return new Promise(function (resolve, reject) {
            if (cached && !bypassCache) {
                resolve(cached);
                return;
            }
            // system call
            exec(command, function (error, stdout, sterr) {
                if (error)
                    return reject(error);
                cached = [];
                var matches = stdout.match(filterRE) || [], ip;
                for (var i = 0; i < matches.length; i++) {
                    ip = matches[i].replace(filterRE, '$1');
                    if (!ignoreRE.test(ip))
                        cached.push(ip);
                }
                resolve(cached);
            });
        });
    };
})();
var Query = /** @class */ (function () {
    function Query(table) {
        this.activeTenant = '';
        this.bribe = '';
        this.table = table;
    }
    Query.prototype.exec = function (api, method, payload, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var origin, _a, error_1, headers;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        origin = '';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        _a = CONFIG.host;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, getAddress()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        origin = _a;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        headers = {
                            'origin': origin,
                            'cache-control': 'no-cache',
                            'mdp-user-agent': CONFIG.userAgent,
                            'mdp-access-token': CONFIG.accessToken,
                            'mdp-tenant-id': this.bribe || this.activeTenant || ''
                        };
                        /* Leave no trace of a bribe even
                          before the request is made
                        */
                        this.bribe = '';
                        // console.log( 'headers: ', headers )
                        (0, request_1.default)(CONFIG.server + api, {
                            method: method,
                            headers: headers,
                            body: payload,
                            json: true
                        }, function (error, response, body) {
                            // Normal request error
                            if (error)
                                return callback(error);
                            // String response returned: Usually 400, 401, 403 errors
                            if (typeof body == 'string')
                                return callback(body);
                            // Requested process error
                            if (body.error)
                                return callback(body.message);
                            callback(false, body.result !== undefined ? body.result : body.message);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.insert = function (data, operators) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!data
                || typeof data != 'object'
                || isEmpty(data))
                reject('Invalid Insertion Data Argument');
            var payload = { table: _this.table, data: data };
            if (!isEmpty(operators))
                Object.assign(payload, operators);
            _this.exec('/query/insert', 'POST', payload, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Query.prototype.find = function (conditions, operators, alts) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!conditions || typeof conditions != 'object')
                reject('Invalid Query Condition Argument');
            var payload = { table: _this.table, conditions: conditions };
            if (!isEmpty(operators))
                Object.assign(payload, operators);
            _this.exec('/query/find' + (alts ? '?target=' + alts : ''), 'POST', payload, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Query.prototype.findOne = function (conditions, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.find(conditions, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.update = function (conditions, data, operators, alts) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!data
                || typeof data != 'object'
                || isEmpty(data))
                reject('Invalid Query Data Argument');
            if (!conditions || typeof conditions != 'object')
                reject('Invalid Query Condition Argument');
            var payload = { table: _this.table, data: data, conditions: conditions };
            if (!isEmpty(operators))
                Object.assign(payload, operators);
            _this.exec('/query/update' + (alts ? '?target=' + alts : ''), 'PUT', payload, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Query.prototype.updateOne = function (conditions, data, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.update(conditions, data, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.updateMany = function (conditions, data, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.update(conditions, data, operators, 'many')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.delete = function (conditions, operators, alts) {
        var _this = this;
        /* NOTE: Upcoming operator
          - archive {boolean} MDP will push the item to
                    archived collection instead of totally delete it
        */
        return new Promise(function (resolve, reject) {
            if (!conditions || typeof conditions != 'object')
                reject('Invalid Query Condition Argument');
            var payload = { table: _this.table, conditions: conditions };
            if (!isEmpty(operators))
                Object.assign(payload, operators);
            _this.exec('/query/delete' + (alts ? '?target=' + alts : ''), 'DELETE', payload, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Query.prototype.deleteOne = function (conditions, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.delete(conditions, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.deleteMany = function (conditions, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.delete(conditions, operators, 'many')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    // Find and only return the count of the result
    Query.prototype.count = function (conditions, operators) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.find(conditions, Object.assign(operators || {}, { count: true }))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    // Massive aggregation pipeline
    Query.prototype.aggregate = function (stages) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (!stages || typeof stages != 'object')
                            reject('Invalid Aggregation Stage Argument');
                        _this.exec('/query/aggregate', 'POST', { table: _this.table, stages: stages }, function (error, result) { return error ? reject(error) : resolve(result); });
                    })];
            });
        });
    };
    return Query;
}());
var Tenant = /** @class */ (function () {
    function Tenant() {
    }
    Tenant.prototype.exec = function (action, method, payload, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var origin, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        origin = '';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        _a = CONFIG.host;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, getAddress()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        origin = _a;
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        (0, request_1.default)("".concat(CONFIG.server, "/tenant/").concat(action), {
                            method: method,
                            headers: {
                                'origin': origin,
                                'cache-control': 'no-cache',
                                'mdp-user-agent': CONFIG.userAgent,
                                'mdp-access-token': CONFIG.accessToken
                            },
                            body: payload,
                            json: true,
                            timeout: 8000
                        }, function (error, response, body) {
                            // Normal request error
                            if (error)
                                return callback(error);
                            // String response returned: Usually 400, 401, 403 errors
                            if (typeof body == 'string')
                                return callback(body);
                            // Requested process error
                            if (body.error)
                                return callback(body.message);
                            callback(false, body.result !== undefined ? body.result : body.message);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Tenant.prototype.add = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec('add', 'POST', data, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Tenant.prototype.update = function (tenantId, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec('update', 'PUT', { tenantId: tenantId, updates: data }, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    Tenant.prototype.drop = function (tenantId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec('drop?tenantId=' + tenantId, 'DELETE', {}, function (error, result) { return error ? reject(error) : resolve(result); });
        });
    };
    return Tenant;
}());
var DSInterface = /** @class */ (function () {
    function DSInterface(config) {
        CONFIG = __assign(__assign({}, (CONFIG || {})), config);
        this.collections = (Array.isArray(config.collections) && config.collections) || Object.values(arguments);
        this.tenant = new Tenant();
    }
    DSInterface.prototype.dp = function () {
        // Assign each collection as Query Object to DSInterface
        Array.isArray(this.collections)
            && this.collections.map(function (each) {
                var query = new Query(each);
                /** Give another tenant's ID to DP Query as bribe
                  to overwite the request origin. Expecially designed
                  to facilitate Share-Session
          
                  WARNING: Using this the wrong way could create
                  data accessibility bridge between tenant sessions.
                */
                query.corrupt = function (tenantId) {
                    query.bribe = tenantId;
                    return query;
                };
                DSInterface.prototype[each] = query;
            });
        return this;
    };
    DSInterface.prototype.middleware = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var origin;
            return __generator(this, function (_a) {
                origin = getOrigin(req);
                // console.log('origin: ', origin )
                Array.isArray(this.collections)
                    && this.collections.map(function (each) {
                        var query = new Query(each);
                        // Request Host is use as tenant ID
                        query.activeTenant = origin.replace('auth.', '');
                        /** Give another tenant's ID to DP Query as bribe
                          to overwite the request origin. Expecially designed
                          to facilitate Share-Session
                  
                          WARNING: Using this the wrong way could create
                          data accessibility bridge between tenant sessions.
                        */
                        query.corrupt = function (tenantId) {
                            query.bribe = tenantId;
                            return query;
                        };
                        DSInterface.prototype[each] = query;
                    });
                req.dp = this;
                next();
                return [2 /*return*/];
            });
        });
    };
    return DSInterface;
}());
exports.default = DSInterface;
