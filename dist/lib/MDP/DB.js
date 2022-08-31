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
/** Data-Provider Interface/Driver

  Gives a more friendly interface to connect and make mongodb database
  queries and also help switch an application from external Data Provider
  Server connection to normal database connection without changing
  any query code.
  
  @author Fabrice Marlboro

  @params collections (Array) List of collections, subject of query
                      transactions or use function "arguments" as alternative

  WARNING: Requires environment variable (in .env file) like:
    - DATABASE_URL = Connection String (URL) of the mongodb database
    - DATABASE_NAME = Name of targeted database
*/
var mongodb_1 = require("mongodb");
var utils_1 = require("../../utils");
var fastify_plugin_1 = __importDefault(require("fastify-plugin"));
var STypes = ['one', 'many', 'all'], isEmpty = function (entry) {
    // test empty array or object
    if (!entry || typeof entry !== 'object')
        return null;
    return Array.isArray(entry) ?
        !entry.length
        : Object.keys(entry).length === 0 && entry.constructor === Object;
}, depthField = function (data, field) {
    var depths = field.split('.');
    var depthValue = JSON.parse(JSON.stringify(data));
    for (var o = 0; o < depths.length; o++) {
        if (depths[o] == '$' && typeof depthValue == 'object')
            return {
                objectValue: depthValue,
                matchField: depths.slice(o + 1).join('.')
            };
        if (!depthValue.hasOwnProperty(depths[o]))
            return null;
        depthValue = depthValue[depths[o]];
    }
    return depthValue;
}, extendData = function (dbClient, result, options, index) {
    if (index === void 0) { index = 0; }
    return __awaiter(void 0, void 0, void 0, function () {
        var process, field, to, as, maxdepth, select, excludes, toSplited, table, tField_1, DBCollection_1, value, exclusion_1, findMatche, objectValue, matchField, isObject, idx, _a, foundField, each;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    process = { error: false, final: {} }, field = options.field, to = options.to, as = options.as, maxdepth = options.maxdepth, select = options.select, excludes = options.excludes;
                    maxdepth = maxdepth || 1; // Fisrt deep level by default
                    if (Array.isArray(result)) {
                        if (!result.length) // Empty array send to extend
                            return [2 /*return*/, { error: false, final: result }];
                        process.data = result[index];
                    }
                    else
                        process.data = result;
                    if (!field) return [3 /*break*/, 11];
                    /* Single field only
                    "extend": {
                          "field": "user_id",
                          "to": "user._id",
                          "as": "profile"
                      }
                    */
                    if (!to || !/\./.test(to)) {
                        process.error = { error: false, status: 'QUERY::FAILED', message: 'Invalid Join Set: "to" expected (Eg. user._id)' };
                        return [2 /*return*/, process];
                    }
                    toSplited = to.split('.'), table = toSplited.shift(), tField_1 = toSplited.join('.'), DBCollection_1 = dbClient.collection(table);
                    if (!DBCollection_1) {
                        process.error = { error: false, status: 'QUERY::FAILED', message: 'Unknown Tenant' };
                        return [2 /*return*/, process];
                    }
                    value = tField_1 == '_id' ?
                        new mongodb_1.ObjectId(process.data[field])
                        : depthField(process.data, field);
                    exclusion_1 = {};
                    if (Array.isArray(select) || Array.isArray(excludes)) {
                        select && select.map(function (each) { return exclusion_1[each] = 1; });
                        excludes && excludes.map(function (each) { return exclusion_1[each] = 0; });
                    }
                    findMatche = function (value, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var found, asField;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, DBCollection_1.findOne((_a = {}, _a[tField_1] = value, _a), exclusion_1)
                                    // console.log( 'table: ', table, 'tField: ', tField, 'value: ', value, 'found: ', found )
                                ];
                                case 1:
                                    found = _b.sent();
                                    asField = as || field;
                                    if (index !== undefined) {
                                        index = typeof index != 'number' ? '"' + index + '"' : index; // object key or array index
                                        asField = asField.replace('.$', '[' + index + ']');
                                    }
                                    try {
                                        eval('process.data.' + asField + ' = found');
                                    }
                                    catch (error) {
                                        console.log('Depth Assigning of ' + asField + ' Failed: ', error);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    if (!(value && typeof value == 'object')) return [3 /*break*/, 8];
                    objectValue = value.objectValue, matchField = value.matchField;
                    isObject = false;
                    if (!Array.isArray(objectValue)) {
                        // Object of matches to find
                        isObject = true;
                        value = matchField ?
                            // Match object entries fields
                            Object.entries(objectValue)
                            // Match object keys fields
                            : Object.keys(objectValue);
                    }
                    // Matche array contents
                    else
                        value = objectValue;
                    idx = 0;
                    _b.label = 1;
                case 1:
                    if (!(idx < value.length)) return [3 /*break*/, 7];
                    if (!(Array.isArray(value[idx]) && value[idx].length == 2)) return [3 /*break*/, 3];
                    return [4 /*yield*/, findMatche(matchField ? depthField(value[idx][1], matchField) : value[idx][1], value[idx][0])]; // Object entries
                case 2:
                    _a = _b.sent(); // Object entries
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, findMatche(matchField ? depthField(value[idx], matchField) : value[idx], isObject ? value[idx] : idx)]; // Normal Array
                case 4:
                    _a = _b.sent(); // Normal Array
                    _b.label = 5;
                case 5:
                    _a; // Normal Array
                    _b.label = 6;
                case 6:
                    idx++;
                    return [3 /*break*/, 1];
                case 7: return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, findMatche(value)];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 14];
                case 11:
                    if (!maxdepth) return [3 /*break*/, 14];
                    foundField = void 0;
                    // Find extendable field
                    for (each in process.data)
                        if (/(\w+)_id$/.test(each)) {
                            foundField = each;
                            break;
                        }
                    if (!foundField) return [3 /*break*/, 14];
                    return [4 /*yield*/, extendData(dbClient, process.data, { field: foundField, to: foundField.replace('_id', '') + '._id', maxdepth: maxdepth })];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, extendData(dbClient, result, options, index)];
                case 13: return [2 /*return*/, _b.sent()];
                case 14:
                    if (!(Array.isArray(result) && result[index + 1])) return [3 /*break*/, 16];
                    return [4 /*yield*/, extendData(dbClient, result, options, index + 1)];
                case 15: return [2 /*return*/, _b.sent()];
                case 16: return [2 /*return*/, { error: process.error, final: result }];
            }
        });
    });
};
var Query = /** @class */ (function () {
    function Query(table, dbClient) {
        this.table = table;
        this.dbClient = dbClient;
        this.DBCollection = dbClient.collection(table);
    }
    Query.prototype.insert = function (data, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var returnId, result, sResponse, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!data
                            || typeof data != 'object'
                            || isEmpty(data))
                            throw new Error('Invalid Insertion Data Argument');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        returnId = operators.returnId;
                        if (!Array.isArray(data)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.DBCollection.insertMany(data)];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.DBCollection.insertOne(data)];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        result = _a, sResponse = { error: false, status: 'QUERY::SUCCESS', message: 'Insert' };
                        // Return Inserted Doc "_id"
                        if (returnId)
                            sResponse.result = result.insertedId;
                        if (result && result.acknowledged)
                            return [2 /*return*/, sResponse];
                        else
                            throw new Error('Unexpected Error Occurs');
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error('Insert Query: ', error_1);
                        throw new Error('- ' + error_1);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.find = function (conditions, operators, target) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var select, excludes, limit, desc, orderby, extend, count, fn, result, exclusion_2, _a, error, final, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!conditions || typeof conditions != 'object')
                            throw new Error('Invalid Query Condition Argument');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 14, , 15]);
                        select = operators.select, excludes = operators.excludes, limit = operators.limit, desc = operators.desc, orderby = operators.orderby, extend = operators.extend, count = operators.count, fn = target == 'one' ? 'findOne' : 'find', result = void 0;
                        conditions = conditions || {}; // default condition
                        exclusion_2 = {};
                        if (!(Array.isArray(select)
                            || Array.isArray(excludes))) return [3 /*break*/, 3];
                        select && select.map(function (each) { return exclusion_2[each] = 1; });
                        excludes && excludes.map(function (each) { return exclusion_2[each] = 0; });
                        return [4 /*yield*/, this.DBCollection[fn](conditions, exclusion_2)];
                    case 2:
                        result = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.DBCollection[fn](conditions)
                        // when "find" or "findMany"
                    ];
                    case 4:
                        result = _c.sent();
                        _c.label = 5;
                    case 5:
                        if (!(target != 'one')) return [3 /*break*/, 11];
                        if (!orderby) return [3 /*break*/, 7];
                        return [4 /*yield*/, result.sort((_b = {}, _b[orderby] = desc ? -1 : 1, _b))];
                    case 6:
                        result = _c.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (!desc) return [3 /*break*/, 9];
                        return [4 /*yield*/, result.sort({ _id: -1 })];
                    case 8:
                        result = _c.sent();
                        _c.label = 9;
                    case 9:
                        if (limit)
                            result = result.limit(limit);
                        return [4 /*yield*/, result.toArray()];
                    case 10:
                        result = _c.sent();
                        _c.label = 11;
                    case 11:
                        if (!(result && extend)) return [3 /*break*/, 13];
                        return [4 /*yield*/, extendData(this.dbClient, result, extend)];
                    case 12:
                        _a = _c.sent(), error = _a.error, final = _a.final;
                        if (error)
                            return [2 /*return*/, error];
                        result = final;
                        _c.label = 13;
                    case 13:
                        // Return only the result count
                        if (count)
                            result = result.length || (target == 'one' ? 1 : 0);
                        return [2 /*return*/, result];
                    case 14:
                        error_2 = _c.sent();
                        console.error('Find Query: ', error_2);
                        throw new Error('- ' + error_2);
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.findOne = function (conditions, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.find(conditions, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.update = function (conditions, data, operators, target) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var select, excludes, upsert, returnUpdate, arrayFilters, fn, toUpdate, result, superOps_1, value, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data
                            || typeof data != 'object'
                            || isEmpty(data))
                            throw new Error('Invalid Query Data Argument');
                        if (!conditions || typeof conditions != 'object')
                            return [2 /*return*/, 'Invalid Query Condition Argument'];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        select = operators.select, excludes = operators.excludes, upsert = operators.upsert, returnUpdate = operators.returnUpdate, arrayFilters = operators.arrayFilters, fn = target && STypes.includes(target) ? 'update' + (0, utils_1.toCapitalCase)(target) : 'updateOne', toUpdate = {}, result = void 0;
                        // Aggregation update
                        if (Array.isArray(data))
                            toUpdate = data;
                        // Normal update
                        else {
                            if (data.hasOwnProperty('$set')) {
                                toUpdate['$set'] = data['$set'];
                                delete data['$set'];
                            }
                            if (data.hasOwnProperty('$unset')) {
                                toUpdate['$unset'] = data['$unset'];
                                delete data['$unset'];
                            }
                            if (data.hasOwnProperty('$push')) {
                                toUpdate['$push'] = data['$push'];
                                delete data['$push'];
                            }
                            if (data.hasOwnProperty('$pull')) {
                                toUpdate['$pull'] = data['$pull'];
                                delete data['$pull'];
                            }
                            if (data.hasOwnProperty('$addToSet')) {
                                toUpdate['$addToSet'] = data['$addToSet'];
                                delete data['$addToSet'];
                            }
                            if (data.hasOwnProperty('$inc')) {
                                toUpdate['$inc'] = data['$inc'];
                                delete data['$inc'];
                            }
                            // Merge the remain content in data as "toSet"
                            toUpdate['$set'] = Object.assign(toUpdate['$set'] || {}, data);
                            // Avoid mongodb "empty $set" error
                            isEmpty(toUpdate['$set']) && delete toUpdate['$set'];
                        }
                        superOps_1 = {};
                        if (!(upsert || returnUpdate)) return [3 /*break*/, 5];
                        if (!returnUpdate) return [3 /*break*/, 3];
                        superOps_1.returnDocument = 'after';
                        if (Array.isArray(select)
                            || Array.isArray(excludes)) {
                            superOps_1.projection = {};
                            select && select.map(function (each) { return superOps_1.projection[each] = 1; });
                            excludes && excludes.map(function (each) { return superOps_1.projection[each] = 0; });
                        }
                        return [4 /*yield*/, this.DBCollection.findOneAndUpdate(conditions, toUpdate, superOps_1)];
                    case 2:
                        value = (_a.sent()).value;
                        return [2 /*return*/, value];
                    case 3:
                        // Auto-create new document if there's none to update
                        if (upsert)
                            superOps_1.upsert = true;
                        if (arrayFilters)
                            superOps_1.arrayFilters = arrayFilters;
                        return [4 /*yield*/, this.DBCollection[fn](conditions, toUpdate, superOps_1)];
                    case 4:
                        result = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.DBCollection[fn](conditions, toUpdate)];
                    case 6:
                        result = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (result && result.acknowledged)
                            return [2 /*return*/, !result.modifiedCount ? 'Already Up-to-date' : 'Updated'];
                        else
                            throw new Error('Not Found');
                        return [3 /*break*/, 9];
                    case 8:
                        error_3 = _a.sent();
                        console.error('Find Query: ', error_3);
                        throw new Error('- ' + error_3);
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.updateOne = function (conditions, data, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.update(conditions, data, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.updateMany = function (conditions, data, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.update(conditions, data, operators, 'many')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.delete = function (conditions, operators, target) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var fn, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* NOTE: Upcoming operator
                          - archive {boolean} MDP will push the item to
                                    archived collection instead of totally delete it
                        */
                        if (!conditions || typeof conditions != 'object')
                            throw new Error('Invalid Query Condition Argument');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        fn = target && STypes.includes(target) ? 'delete' + (0, utils_1.toCapitalCase)(target) : 'remove';
                        return [4 /*yield*/, this.DBCollection[fn](conditions)];
                    case 2:
                        result = _a.sent();
                        if (result && result.acknowledged)
                            return [2 /*return*/, !result.deletedCount ? 'Nothing to delete' : 'Deleted'];
                        else
                            throw new Error('Not Found');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Find Query: ', error_4);
                        throw new Error('- ' + error_4);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.deleteOne = function (conditions, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.delete(conditions, operators, 'one')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Query.prototype.deleteMany = function (conditions, operators) {
        if (operators === void 0) { operators = {}; }
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.delete(conditions, operators, 'many')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    // Find and only return the count of the result
    Query.prototype.count = function (conditions, operators) {
        if (operators === void 0) { operators = {}; }
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
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!stages || typeof stages != 'object')
                            throw new Error('Invalid Aggregation Stage Argument');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.DBCollection.aggregate(stages).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Aggregation Query: ', error_5);
                        throw new Error('- ' + error_5);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Query;
}());
function dbConnect(config) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var dbServer = config.dbServer, dbName = config.dbName, collections = config.collections;
        require('mongodb')
            .MongoClient
            .connect(dbServer, { useNewUrlParser: true, useUnifiedTopology: true }, function (error, client) {
            // On connection error we display then exit
            if (error) {
                reject('Error connecting to MongoDB: ' + error);
                return;
            }
            var dbClient = client.db(dbName), api = {};
            resolve({
                collections: collections,
                dp: function () {
                    // Assign each collection as Query Object to DBInterface
                    Array.isArray(collections)
                        && collections.map(function (each) { return api[each] = new Query(each, dbClient); });
                    return api;
                },
                express: function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Assign each collection as Query Object to DBInterface
                        Array.isArray(collections)
                            && collections.map(function (each) { return api[each] = new Query(each, dbClient); });
                        req.dp = api;
                        next();
                        return [2 /*return*/];
                    });
                }); },
                fastify: function () {
                    return (0, fastify_plugin_1.default)(function (App) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            App.addHook('onRequest', function (req) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Assign each collection as Query Object to DBInterface
                                    Array.isArray(collections)
                                        && collections.map(function (each) { return api[each] = new Query(each, dbClient); });
                                    req.dp = api;
                                    return [2 /*return*/];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                }
            });
        });
    });
}
exports.default = (function (config) { return dbConnect(config); });
