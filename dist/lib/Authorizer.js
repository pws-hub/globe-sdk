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
/**---------------------------------------
*          Service API Authorizer
* ----------------------------------------
*  @author: Fabrice Marlboro
*  @description: Access Manager for Sensible APIs portals
*              that required special authorization credentials
*              before to grant access to its APIs
*
*  Copyright 2019, MyappLabs - https://webmicros.com/license
*
*  @param {String} service Type of service being protected by the authorizer
*                        For now only two are supported:
*                        - Database access
*                        - API endpoints access
*
*  @param {String} manifest Absolute url/path to the manifest JSON list
*                            containing all credentials and scopes set
*                            provided by this service. Which 3rd party
*                            service is allowed to access them and how.
*                            Eg. /.../manifest.json
*  @return {Object}
*      - authorization: Middleware function to track censorsed
*                      API requests and verify authorizations
*      - routers: function that expose a set of routers to be
*                allocate to express in order to handle authorization
*                request and management by 3rd party API consumers
*/
var rand_token_1 = __importDefault(require("rand-token"));
var express_1 = require("express");
var fastify_plugin_1 = __importDefault(require("fastify-plugin"));
var validator_1 = require("../validator");
var utils_1 = require("../utils");
var CONFIG;
var HTTP_ERROR_MESSAGES = {
    "400": "Bad Request. Check https://developer.webmicros.com/api/error/HTTP-400",
    "401": "Access Denied. check https://developer.webmicros.com/api/error/HTTP-401",
    "403": "Forbidden Access. check https://developer.webmicros.com/api/error/HTTP-403",
    "412": "Precondition Undefined. check https://developer.webmicros.com/api/error/HTTP-412"
}, askCreds = [
    { type: 'string', name: 'agent' },
    { type: 'object', name: 'scope' },
    { type: ['boolean', 'string'], name: 'instance', optional: true }
], refreshCreds = [
    { type: 'string', name: 'agent' },
    { type: 'string', name: 'token' },
    { type: 'number', name: 'expiry' }
], revokeCreds = [
    { type: 'string', name: 'agent' },
    { type: 'string', name: 'token' }
], 
// Validation schemas
requestErrorSchema = {
    type: 'object',
    properties: {
        agent: { type: 'string' },
        token: { type: 'string' },
        expiry: { type: 'number' },
    }
}, askCredsSchema = {
    schema: {
        headers: {},
        body: {
            type: 'object',
            properties: {
                agent: { type: 'string' },
                instance: { type: 'boolean' },
                scope: {
                    type: 'object',
                    patternProperties: {
                        '^.*$': { type: ['string'] }
                    }
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    error: { type: 'boolean' },
                    status: { type: 'string' },
                    message: { type: 'string' },
                    result: {
                        type: ['object', 'null'],
                        properties: {
                            agent: { type: 'string' },
                            token: { type: 'string' },
                            expiry: { type: 'number' }
                        }
                    }
                }
            },
            '4xx': requestErrorSchema
        }
    }
}, refreshCredsSchema = {
    schema: {
        headers: {},
        body: {
            type: 'object',
            properties: {
                agent: { type: 'string' },
                token: { type: 'string' },
                expiry: { type: 'number' },
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    error: { type: 'boolean' },
                    status: { type: 'string' },
                    message: { type: 'string' },
                    result: {
                        type: ['object', 'null'],
                        properties: {
                            agent: { type: 'string' },
                            token: { type: 'string' },
                            expiry: { type: 'number' }
                        }
                    }
                }
            },
            '4xx': requestErrorSchema
        }
    }
}, revokeCredsSchema = {
    schema: {
        headers: {},
        body: {
            type: 'object',
            properties: {
                agent: { type: 'string' },
                token: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    error: { type: 'boolean' },
                    status: { type: 'string' },
                    message: { type: 'string' },
                    result: {
                        type: ['object', 'null'],
                        properties: {
                            agent: { type: 'string' }
                        }
                    }
                }
            },
            '4xx': requestErrorSchema
        }
    }
}, SUPPORTED_FRAMEWORKS = {
    express: function () {
        var ExpiryDelay = Number(CONFIG.expiry) || 30, // in minute
        // Assign API Authorizations Manifest
        checkAgent = function (req, res, next) {
            var _a = req.body.agent.split('/'), name = _a[0], version = _a[1];
            // Check credentials
            if (!name || !version
                || !CONFIG.manifest.hasOwnProperty(name)
                || CONFIG.manifest[name].version != version)
                return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unknown User-Agent' });
            req.agent = { name: name, version: version, manifest: CONFIG.manifest[name] };
            next();
        };
        return {
            /* Verify whether authorization access is granted
              to any user-agent making API request: All routes
              on this server are sealed
            */
            checker: function (req, res, next) {
                if (CONFIG.allowedOrigins) {
                    // Require request origin
                    if (!req.headers.origin)
                        return res.status(403).send(HTTP_ERROR_MESSAGES['403']);
                    // Check headers
                    var origin_1 = req.headers.origin.replace(/http(s?):\/\//, '');
                    // regex domain matcher
                    if (!(new RegExp(CONFIG.allowedOrigins, 'i').test(origin_1)))
                        return res.status(403).send(HTTP_ERROR_MESSAGES['403']);
                }
                if (!req.headers[CONFIG.agentHeader]
                    || !req.headers[CONFIG.tokenHeader])
                    return res.status(412).send(HTTP_ERROR_MESSAGES['412']);
                var _a = req.headers[CONFIG.agentHeader].split('/'), name = _a[0], version = _a[1], url = req.url.replace(/\?(.+)$/, ''), body = ['GET'].includes(req.method) ? req.query : req.body;
                // Check user-agent
                if (!name || !version
                    || !CONFIG.manifest.hasOwnProperty(name)
                    || CONFIG.manifest[name].version != version)
                    return res.status(401).send(HTTP_ERROR_MESSAGES['401']);
                // Check credentials
                var token = req.headers[CONFIG.tokenHeader];
                var creds = CONFIG.manifest[name].credentials, index;
                if (Array.isArray(creds)) {
                    for (var o = 0; o < creds.length; o++) {
                        if (creds[o].token == token) {
                            index = o;
                            creds = creds[index];
                            break;
                        }
                    }
                    if (index == undefined)
                        return res.status(401).send(HTTP_ERROR_MESSAGES['401']);
                }
                if (!creds
                    || !creds.token
                    || creds.token != token
                    /* The condition below impose that any user-agent
                      that get its credentials including expiry date
                      must setup expiry check-up works in other to auto-
                      matically renew those credentials before the expire.
                      Otherwise, Data-provider will bounce their requests
                    */
                    || (CONFIG.rotateToken && creds.expiry && creds.expiry < Date.now()))
                    return res.status(401).send(HTTP_ERROR_MESSAGES['401']);
                // console.log( 'body: ', body, url )
                // Check allowed APIs
                // if( !CONFIG.manifest[ name ].scope.endpoints.includes( url ) )
                //   return res.status(400).send( HTTP_ERROR_MESSAGES['400'] )
                // console.log( 'body: ', body )
                // Check allowed datatables for CRUD requests only
                if (CONFIG.service == 'database'
                    && !url.includes('/tenant')
                    && !url.includes('/authorization') // except authorization API requests
                    && (!body
                        || !body.table
                        || !CONFIG.manifest[name].scope.datatables.includes(body.table)))
                    return res.status(400).send(HTTP_ERROR_MESSAGES['400']);
                next();
            },
            /* Autorization request routers  to be register to
              the app's routing system like express
            */
            routers: function () {
                return (0, express_1.Router)()
                    // Grant access credentials to Resources
                    .post('/authorization/request', (0, validator_1.checkFormSchema)(askCreds), checkAgent, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var scope, AllowedScopes, o, o, thisCreds, credentials;
                    return __generator(this, function (_a) {
                        scope = req.body.scope, AllowedScopes = req.agent.manifest.scope;
                        if ( // No endpoints scope defined but required
                        (Array.isArray(AllowedScopes.endpoints)
                            && AllowedScopes.endpoints.length
                            && (!Array.isArray(scope.endpoints) || !scope.endpoints.length))
                            // No table scope defined but required
                            || CONFIG.service == 'database'
                                && Array.isArray(AllowedScopes.datatables)
                                && AllowedScopes.datatables.length
                                && (!Array.isArray(scope.tables) || !scope.tables.length))
                            return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Authorization Scope' })
                                // Check allowed APIs
                            ];
                        // Check allowed APIs
                        for (o = 0; o < scope.endpoints.length; o++)
                            if (!AllowedScopes.endpoints.includes(scope.endpoints[o]))
                                return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope API' })
                                    // Check allowed datatables for CRUD requests only
                                ];
                        // Check allowed datatables for CRUD requests only
                        if (CONFIG.service == 'database')
                            for (o = 0; o < scope.tables.length; o++)
                                if (!AllowedScopes.datatables.includes(scope.tables[o]))
                                    return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope Table' })
                                        // Grant access
                                    ];
                        thisCreds = {
                            token: rand_token_1.default.generate(88),
                            expiry: Date.now() + (ExpiryDelay * 60 * 1000) // Expire in an hour
                        };
                        /* For multi-instance cluster servers or
                            multiple services using the same user-agent
                            to get credentials, it's recommanded to specified
                            the "instance" attribute for Authorizer to be able
                            to create and manage an array of credentials
                            granted to each instance.
              
                            Otherwise, credentials granted for each instances
                            will overwrite the previous one's rendering the
                            previous instance's credentials invalid.
                        */
                        if (req.body.instance) {
                            credentials = req.agent.manifest.credentials || [];
                            if (!Array.isArray(credentials))
                                credentials = [credentials];
                            credentials.push(thisCreds);
                            req.agent.manifest.credentials = credentials;
                        }
                        else
                            req.agent.manifest.credentials = thisCreds;
                        // console.log( 'updated: ', CONFIG.manifest )
                        res.status(201)
                            .json({
                            error: false,
                            status: 'AUTHORIZATION::GRANTED',
                            result: Object.assign({ agent: req.body.agent }, thisCreds)
                        });
                        return [2 /*return*/];
                    });
                }); })
                    // Refresh access credentials to Resources
                    .put('/authorization/refresh', (0, validator_1.checkFormSchema)(refreshCreds), checkAgent, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var creds, index, token, isArrayCreds, o, thisCreds;
                    return __generator(this, function (_a) {
                        if (!req.agent.manifest.credentials)
                            return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })];
                        creds = req.agent.manifest.credentials;
                        token = req.body.token, isArrayCreds = Array.isArray(creds);
                        if (isArrayCreds) {
                            for (o = 0; o < creds.length; o++) {
                                if (creds[o].token == token) {
                                    index = o;
                                    creds = creds[index];
                                    break;
                                }
                            }
                            if (index == undefined)
                                return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })];
                        }
                        if (!creds.token
                            || !creds.expiry
                            || token != creds.token)
                            return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' })
                                // Generate new credentials
                            ];
                        thisCreds = {
                            token: rand_token_1.default.generate(88),
                            expiry: Date.now() + (ExpiryDelay * 60 * 1000) // Expire in an hour
                        };
                        isArrayCreds ?
                            req.agent.manifest.credentials[index] = thisCreds
                            : req.agent.manifest.credentials = thisCreds;
                        // console.log( 'updated: ', CONFIG.manifest )
                        res.json({
                            error: false,
                            status: 'AUTHORIZATION::REFRESHED',
                            result: Object.assign({ agent: req.body.agent }, thisCreds)
                        });
                        return [2 /*return*/];
                    });
                }); })
                    // Revoke access credentials to Resources
                    .delete('/authorization/revoke', (0, validator_1.checkFormSchema)(revokeCreds), checkAgent, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var creds, index, token, isArrayCreds, o;
                    return __generator(this, function (_a) {
                        if (!req.agent.manifest.credentials)
                            return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })];
                        creds = req.agent.manifest.credentials;
                        token = req.body.token, isArrayCreds = Array.isArray(creds);
                        if (isArrayCreds) {
                            for (o = 0; o < creds.length; o++) {
                                if (creds[o].token == token) {
                                    index = o;
                                    creds = creds[index];
                                    break;
                                }
                            }
                            if (index == undefined)
                                return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })];
                        }
                        if (!creds.token
                            || !creds.expiry
                            || token != creds.token)
                            return [2 /*return*/, res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' })
                                // Generate new credentials
                            ];
                        // Generate new credentials
                        isArrayCreds ?
                            req.agent.manifest.credentials.splice(index, 1)
                            : delete req.agent.manifest.credentials;
                        // console.log( 'updated: ', CONFIG.manifest )
                        res.json({
                            error: false,
                            status: 'AUTHORIZATION::REVOKED',
                            result: { agent: req.body.agent }
                        });
                        return [2 /*return*/];
                    });
                }); });
            }
        };
    },
    fastify: function () {
        var ExpiryDelay = Number(CONFIG.expiry) || 30, // in minute
        // Assign API Authorizations Manifest
        checkAgent = function (req, rep) {
            var agent = req.body.agent, _a = agent.split('/'), name = _a[0], version = _a[1];
            // Check credentials
            if (!name || !version
                || !CONFIG.manifest.hasOwnProperty(name)
                || CONFIG.manifest[name].version != version)
                return rep.send({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unknown User-Agent' });
            req.agent = { name: name, version: version, manifest: CONFIG.manifest[name] };
        };
        return {
            /* Verify whether authorization access is granted
              to any user-agent making API request: All routes
              on this server are sealed
            */
            checker: (0, fastify_plugin_1.default)(function (App) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    App
                        .addHook('onRequest', function (req, rep) {
                        if (CONFIG.allowedOrigins) {
                            // Require request origin
                            if (!req.headers.origin)
                                return rep.code(403).send(HTTP_ERROR_MESSAGES['403']);
                            // Check headers
                            var origin_2 = req.headers.origin.replace(/http(s?):\/\//, '');
                            // regex domain matcher
                            if (!(new RegExp(CONFIG.allowedOrigins, 'i').test(origin_2)))
                                return rep.code(403).send(HTTP_ERROR_MESSAGES['403']);
                        }
                        if (!req.headers[CONFIG.agentHeader]
                            || !req.headers[CONFIG.tokenHeader])
                            return rep.status(412).send(HTTP_ERROR_MESSAGES['412']);
                        var _a = req.headers[CONFIG.agentHeader].split('/'), name = _a[0], version = _a[1], url = req.url.replace(/\?(.+)$/, ''), body = (['GET'].includes(req.method) ? req.query : req.body);
                        // Check user-agent
                        if (!name || !version
                            || !CONFIG.manifest.hasOwnProperty(name)
                            || CONFIG.manifest[name].version != version)
                            return rep.code(401).send(HTTP_ERROR_MESSAGES['401']);
                        // Check credentials
                        var token = req.headers[CONFIG.tokenHeader];
                        var creds = CONFIG.manifest[name].credentials, index;
                        if (Array.isArray(creds)) {
                            for (var o = 0; o < creds.length; o++) {
                                if (creds[o].token == token) {
                                    index = o;
                                    creds = creds[index];
                                    break;
                                }
                            }
                            if (index == undefined)
                                return rep.code(401).send(HTTP_ERROR_MESSAGES['401']);
                        }
                        if (!creds
                            || !creds.token
                            || creds.token != token
                            /* The condition below impose that any user-agent
                              that get its credentials including expiry date
                              must setup expiry check-up works in other to auto-
                              matically renew those credentials before the expire.
                              Otherwise, Data-provider will bounce their requests
                            */
                            || (CONFIG.rotateToken && creds.expiry && creds.expiry < Date.now()))
                            return rep.code(401).send(HTTP_ERROR_MESSAGES['401']);
                        // console.log( 'body: ', body, url )
                        // Check allowed APIs
                        // if( !CONFIG.manifest[ name ].scope.endpoints.includes( url ) )
                        //   return res.status(400).send( HTTP_ERROR_MESSAGES['400'] )
                        // console.log( 'body: ', body )
                        // Check allowed datatables for CRUD requests only
                        if (CONFIG.service == 'database'
                            && !url.includes('/tenant')
                            && !url.includes('/authorization') // except authorization API requests
                            && (!body
                                || !body.table
                                || !CONFIG.manifest[name].scope.datatables.includes(body.table)))
                            return rep.code(400).send(HTTP_ERROR_MESSAGES['400']);
                    });
                    return [2 /*return*/];
                });
            }); }),
            /* Autorization request routers  to be register to
              the app's routing system like express
            */
            routers: function (App) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    App
                        // Grant access credentials to Resources
                        .post('/authorization/request', __assign(__assign({}, askCredsSchema), { preHandler: [checkAgent] }), function (req, rep) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, scope, agent, instance, AllowedScopes, o, o, thisCreds, credentials;
                        return __generator(this, function (_b) {
                            if (!req.agent)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::FAILED', message: 'Unexpected error occured' }];
                            _a = req.body, scope = _a.scope, agent = _a.agent, instance = _a.instance, AllowedScopes = req.agent.manifest.scope;
                            if ( // No endpoints scope defined but required
                            (Array.isArray(AllowedScopes.endpoints)
                                && AllowedScopes.endpoints.length
                                && (!Array.isArray(scope.endpoints) || !scope.endpoints.length))
                                // No table scope defined but required
                                || CONFIG.service == 'database'
                                    && Array.isArray(AllowedScopes.datatables)
                                    && AllowedScopes.datatables.length
                                    && (!Array.isArray(scope.tables) || !scope.tables.length))
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Authorization Scope' }
                                    // Check allowed APIs
                                ];
                            // Check allowed APIs
                            for (o = 0; o < scope.endpoints.length; o++)
                                if (!AllowedScopes.endpoints.includes(scope.endpoints[o]))
                                    return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope API' }
                                        // Check allowed datatables for CRUD requests only
                                    ];
                            // Check allowed datatables for CRUD requests only
                            if (CONFIG.service == 'database')
                                for (o = 0; o < scope.tables.length; o++)
                                    if (!AllowedScopes.datatables.includes(scope.tables[o]))
                                        return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope Table' }
                                            // Grant access
                                        ];
                            thisCreds = {
                                token: rand_token_1.default.generate(88),
                                expiry: Date.now() + (ExpiryDelay * 60 * 1000) // Expire in an hour
                            };
                            /* For multi-instance cluster servers or
                                multiple services using the same user-agent
                                to get credentials, it's recommanded to specified
                                the "instance" attribute for Authorizer to be able
                                to create and manage an array of credentials
                                granted to each instance.
                  
                                Otherwise, credentials granted for each instances
                                will overwrite the previous one's rendering the
                                previous instance's credentials invalid.
                            */
                            if (instance) {
                                credentials = req.agent.manifest.credentials || [];
                                if (!Array.isArray(credentials))
                                    credentials = [credentials];
                                credentials.push(thisCreds);
                                req.agent.manifest.credentials = credentials;
                            }
                            else
                                req.agent.manifest.credentials = thisCreds;
                            // console.log( 'updated: ', CONFIG.manifest )
                            rep.code(201)
                                .send({
                                error: false,
                                status: 'AUTHORIZATION::GRANTED',
                                result: Object.assign({ agent: agent }, thisCreds)
                            });
                            return [2 /*return*/];
                        });
                    }); })
                        // Refresh access credentials to Resources
                        .put('/authorization/refresh', __assign(__assign({}, refreshCredsSchema), { preHandler: [checkAgent] }), function (req) { return __awaiter(void 0, void 0, void 0, function () {
                        var creds, index, _a, agent, token, isArrayCreds, o, thisCreds;
                        return __generator(this, function (_b) {
                            if (!req.agent)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::FAILED', message: 'Unexpected error occured' }];
                            if (!req.agent.manifest.credentials)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' }];
                            creds = req.agent.manifest.credentials;
                            _a = req.body, agent = _a.agent, token = _a.token, isArrayCreds = Array.isArray(creds);
                            if (isArrayCreds) {
                                for (o = 0; o < creds.length; o++) {
                                    if (creds[o].token == token) {
                                        index = o;
                                        creds = creds[index];
                                        break;
                                    }
                                }
                                if (index == undefined)
                                    return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' }];
                            }
                            if (!creds.token
                                || !creds.expiry
                                || token != creds.token)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' }
                                    // Generate new credentials
                                ];
                            thisCreds = {
                                token: rand_token_1.default.generate(88),
                                expiry: Date.now() + (ExpiryDelay * 60 * 1000) // Expire in an hour
                            };
                            isArrayCreds ?
                                req.agent.manifest.credentials[index] = thisCreds
                                : req.agent.manifest.credentials = thisCreds;
                            // console.log( 'updated: ', CONFIG.manifest )
                            return [2 /*return*/, {
                                    error: false,
                                    status: 'AUTHORIZATION::REFRESHED',
                                    result: Object.assign({ agent: agent }, thisCreds)
                                }];
                        });
                    }); })
                        // Revoke access credentials to Resources
                        .delete('/authorization/revoke', __assign(__assign({}, revokeCredsSchema), { preHandler: [checkAgent] }), function (req) { return __awaiter(void 0, void 0, void 0, function () {
                        var creds, index, _a, agent, token, isArrayCreds, o;
                        return __generator(this, function (_b) {
                            if (!req.agent)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::FAILED', message: 'Unexpected error occured' }];
                            if (!req.agent.manifest.credentials)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' }];
                            creds = req.agent.manifest.credentials;
                            _a = req.body, agent = _a.agent, token = _a.token, isArrayCreds = Array.isArray(creds);
                            if (isArrayCreds) {
                                for (o = 0; o < creds.length; o++) {
                                    if (creds[o].token == token) {
                                        index = o;
                                        creds = creds[index];
                                        break;
                                    }
                                }
                                if (index == undefined)
                                    return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' }];
                            }
                            if (!creds.token
                                || !creds.expiry
                                || token != creds.token)
                                return [2 /*return*/, { error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' }
                                    // Generate new credentials
                                ];
                            // Generate new credentials
                            isArrayCreds ?
                                req.agent.manifest.credentials.splice(index, 1)
                                : delete req.agent.manifest.credentials;
                            // console.log( 'updated: ', CONFIG.manifest )
                            return [2 /*return*/, {
                                    error: false,
                                    status: 'AUTHORIZATION::REVOKED',
                                    result: { agent: agent }
                                }];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); }
        };
    }
};
module.exports = function (options) {
    if (typeof options != 'object')
        throw new Error('[Authorizer]: Undefined Configuration');
    // Check whether all configuration field are defined
    CONFIG = __assign(__assign({}, (CONFIG || {})), options);
    (0, utils_1.checkConfig)('Authorizer', CONFIG);
    if (CONFIG.framework && !Object.keys(SUPPORTED_FRAMEWORKS).includes(CONFIG.framework))
        throw new Error('[Authorizer]: Unsupported Nodejs Framework');
    // Run by nodejs framework: expressjs by default
    return SUPPORTED_FRAMEWORKS[(CONFIG.framework || 'express')]();
};
