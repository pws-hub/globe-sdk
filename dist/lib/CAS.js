"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.config = void 0;
/** CDN Assets Space
*
* @author: Fabrice Marlboro
*
* CDN Space configuration variables
* Note: AWS parameters are set in .env file
*
*   - DO_SPACE_KEY
*   - DO_SPACE_SECRET
*   - DO_SPACE_VERSION ( Version of AWS S3 API. Default is "latest" )
*   - DO_SPACE_ENDPOINT ( Storage Space endpoint. Eg. fra1.digitaloceanspaces.com )
*   - DO_SPACE_PUBLIC_ENDPOINT ( Public domain of the space. Eg. https://cdn.vend.one )
*   - DO_SPACE_ASSETS_URL_PREFIX ( static asset url prefix regex that route to CDN. Eg. @cdn)
*   - DO_SPACE_DEFAULT_BUCKET ( Defaut bucket name )
*
*   - TINIFY_API_KEY ( Tinify Compression API Key )[ https://tinypng.com/developers/reference ]
*
* @features:
*   # Multiple datacenter region spaces support
*   # Space:
*     - Create bucket
*     - Fetch existing assets list
*     - Get existing asset
*     - Write new assets: image, video, ...
*     - Compress assets before save to CDN space ( image with Tinify API: [ https://tinypng.com/developers/reference ] )
*     - Delete assets
*
*   # Static:
*     - Routers to route assets trafic between the CDN & a web application frontend
*/
var fs_1 = __importDefault(require("fs"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var tinify_1 = __importDefault(require("tinify"));
var request_1 = __importDefault(require("request"));
var parseurl_1 = __importDefault(require("parseurl"));
var rand_token_1 = __importDefault(require("rand-token"));
var stream_1 = require("stream");
var utils_1 = require("../utils");
var CONFIG, CONN = {};
var S3Downstream = /** @class */ (function (_super) {
    __extends(S3Downstream, _super);
    /** Pass any ReadableStream options to the NodeJS Readable
     * super class here. For this example we wont use this,
     * however I left it in to be more robust
     */
    function S3Downstream(S3Instance, S3Params, streamParams, readableStreamOptions) {
        var _this = _super.call(this, readableStreamOptions) || this;
        _this.__currentCursorPosition = 0; // Holds the current starting position for our range queries
        _this.__chunkRange = 128; // Amount of bytes to grab (2048 is default: For HD video files)
        _this.S3 = S3Instance;
        _this.__S3Params = S3Params;
        _this.__streamParams = streamParams;
        if (streamParams.chunkRange)
            _this.__chunkRange = streamParams.chunkRange;
        // maxLength is strictly required
        if (!streamParams.maxLength)
            throw new Error('Undefined Maximum Data Content Length');
        _this.__maxContentLength = streamParams.maxLength;
        return _this;
    }
    S3Downstream.prototype._read = function () {
        var _this = this;
        /** If the current position is greater than
         * the amount of bytes in the file.
         * We push null into the buffer, NodeJS
         * ReadableStream will see this as the end
         * of file (EOF) and emit the 'end' event
         */
        if (this.__currentCursorPosition > this.__maxContentLength)
            this.push(null);
        else {
            var 
            // Calculate the range of bytes we want to grab
            range = this.__currentCursorPosition + (this.__chunkRange * 1024), 
            /** If the range is greater than the total number of
             * bytes in the file. We adjust the range to grab
             * the remaining bytes of data
             */
            adjustedRange = range < this.__maxContentLength ? range : this.__maxContentLength;
            // Set the Range property on our s3 stream parameters
            this.__S3Params.Range = "bytes=".concat(this.__currentCursorPosition, "-").concat(adjustedRange);
            // Update the current range beginning for the next go
            this.__currentCursorPosition = adjustedRange + 1;
            // Grab the range of bytes from the file
            this.S3.getObject(this.__S3Params, function (error, data) {
                error ?
                    /** If we encounter an error grabbing the bytes.
                     * We destroy the stream, NodeJS ReadableStream
                     * will emit the 'error' event
                     */
                    _this.destroy(error)
                    // We push the data into the stream buffer
                    : _this.push(data.Body);
            });
        }
    };
    return S3Downstream;
}(stream_1.Readable));
var S3Upstream = /** @class */ (function () {
    function S3Upstream(S3Instance, S3Params, streamParams) {
        var _this = this;
        this.queueSize = 1; // How many chunk/part of bytes to simultaneously stream
        this.chunkRange = 128; // Amount of bytes to send (2048 is default: For HD video files)
        var pass = new stream_1.PassThrough();
        S3Params.Body = pass;
        this.progressListener = function (_a) {
            var loaded = _a.loaded, total = _a.total;
            console.log("Progress: ".concat(loaded, "/").concat(total || '-'));
        };
        if (streamParams.queueSize)
            this.queueSize = streamParams.queueSize;
        if (streamParams.chunkRange)
            this.chunkRange = streamParams.chunkRange;
        var manager = S3Instance.upload(S3Params, {
            partSize: this.chunkRange * 1024,
            queueSize: this.queueSize
        });
        manager.on('httpUploadProgress', function (details) { return _this.progressListener(details); });
        this.upStream = pass;
        this.promise = manager.promise();
    }
    S3Upstream.prototype.trackProgress = function (fn) { this.progressListener = fn; };
    return S3Upstream;
}());
function Init() {
    // Empty config
    if (!Object.keys(CONFIG).length)
        throw new Error('[CAS]: Undefined Configuration. User <config> method');
    // Initialize AWS Interface
    aws_sdk_1.default.config.update({
        accessKeyId: CONFIG.accessKey,
        secretAccessKey: CONFIG.secret
    });
    // Compression Provider Key
    tinify_1.default.key = CONFIG.compressKey;
    // Check whether spaces are defined
    if (!Array.isArray(CONFIG.spaces) || !CONFIG.spaces.length)
        throw new Error('[CAS]: Invalid configuration. <spaces> field is expected to be <array>');
    // Create S3 clients by region
    CONFIG.spaces.map(function (space) {
        // Check whether all configuration field are defined
        (0, utils_1.checkConfig)('CAS:SPACE', space);
        CONN[space.region] = {
            bucket: space.bucket,
            host: space.host,
            S3: new aws_sdk_1.default.S3({ endpoint: new aws_sdk_1.default.Endpoint(space.endpoint), apiVersion: space.version || 'latest' })
        };
    });
    // Methods to interact with spaces by datacenter region
    function Space(region, options) {
        var _this = this;
        region = region
            /** Control switching between regions by request thread
             * by setting `req.session.cas_region` value to targeted
             * region.
             *
             * NOTE: Support for `req.session` must be defined by the express app.
             *        otherwise will fallback to default region.
             */
            // || (this.session && this.session.cas_region)
            // Fallback/Default region
            || CONFIG.defaultRegion // Predefined in the configuration
            || CONFIG.spaces[0].region; // First specified space's region
        function getURL(path) {
            return "".concat((typeof options == 'object' && options.absoluteURL ? CONN[region].host : '@' + region), "/").concat(path);
        }
        function write(path, body, bucket) {
            return new Promise(function (resolve, reject) {
                if (!path)
                    return reject('Undefined File Path');
                if (!body)
                    return reject('Undefined File Body');
                path = path.replace(/^\//, '');
                var options = {
                    Bucket: bucket || CONN[region].bucket,
                    Key: path,
                    // private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control
                    ACL: CONFIG.permission || 'public-read',
                    Body: body
                };
                CONN[region].S3.putObject(options, function (error, data) { return error ? reject(error) : resolve(getURL(path)); });
            });
        }
        function compress(path, options) {
            return new Promise(function (resolve, reject) {
                var filepath = (options.namespace ? options.namespace + '/' : '')
                    + (options.type ? options.type + '/' : '')
                    + (options.name ? options.name : rand_token_1.default.generate(58)) + '-' + Date.now()
                    + (options.extension || '.' + (options.mime ? options.mime.split('/')[1] : 'jpg'));
                // Only image file compression is supported for now
                if (options.mime.includes('image')) {
                    tinify_1.default.fromFile(path)
                        .preserve('copyright', 'creation')
                        .toBuffer(function (error, resultData) {
                        if (error)
                            return reject(error);
                        write(filepath, resultData)
                            .then(function (link) { return resolve(link); })
                            .catch(function (error) { return reject(error); });
                    });
                    return;
                }
                // Write raw file to CDN Storage
                fs_1.default.readFile(path, function (error, resultData) {
                    if (error)
                        return reject(error);
                    write(filepath, resultData)
                        .then(function (link) { return resolve(link); })
                        .catch(function (error) { return reject(error); });
                });
            });
        }
        function fetch(folder, bucket) {
            return new Promise(function (resolve, reject) {
                var options = {
                    Bucket: bucket || CONN[region].bucket,
                    // Delimiter: 'STRING_VALUE',
                    // EncodingType: url,
                    // ExpectedBucketOwner: 'STRING_VALUE',
                    // Marker: 'STRING_VALUE',
                    // MaxKeys: limit,
                    Prefix: folder || ''
                };
                CONN[region].S3.listObjects(options, function (error, data) {
                    error ?
                        reject(error)
                        : resolve((data.Contents || []).map(function (each) {
                            return {
                                src: getURL(each.Key),
                                size: each.Size,
                                lastModified: each.LastModified
                            };
                        }));
                });
            });
        }
        return {
            // Create asset bucket
            bucket: function (name) {
                return new Promise(function (resolve, reject) {
                    var options = {
                        Bucket: name,
                        // ACL: 'public-read-write',
                        // CreateBucketConfiguration: {
                        //     LocationConstraint: 'EU'
                        // },
                        // GrantFullControl: 'write',
                        // GrantRead: 'STRING_VALUE',
                        // GrantReadACP: 'STRING_VALUE',
                        // GrantWrite: 'STRING_VALUE',
                        // GrantWriteACP: 'STRING_VALUE',
                        // ObjectLockEnabledForBucket: true || false
                    };
                    CONN[region].S3.createBucket(options, function (error, data) { return error ? reject(error) : resolve(data); });
                });
            },
            // Get item from CDN
            get: function (path, type) {
                return new Promise(function (resolve, reject) {
                    var options = { url: CONN[region].host + path };
                    if (type)
                        type == 'json' ?
                            options.json = true
                            : options.encoding = type;
                    request_1.default.get(options, function (error, response, body) {
                        if (error) {
                            console.log('CDN HTTPS/GET Request Error: ', error);
                            return reject(error);
                        }
                        resolve(body);
                    });
                });
            },
            // Fetch assets
            fetch: fetch,
            // Write a new asset
            write: write,
            // Compress asset before to write
            compress: compress,
            // Delete asset
            delete: function (path, bucket) {
                return new Promise(function (resolve, reject) {
                    if (!path)
                        return reject('Undefined File Path');
                    path = path.replace(/^\//, '');
                    var options = {
                        Bucket: bucket || CONN[region].bucket,
                        Key: path
                    };
                    CONN[region].S3.deleteObject(options, function (error, data) { return error ? reject(error) : resolve(true); });
                });
            },
            // Stream asset
            stream: {
                /** Handle stream download file from Amazon S3 */
                from: function (path, pipeStreamOptions) {
                    return new Promise(function (resolve, reject) {
                        var options = {
                            Bucket: CONN[region].bucket,
                            Key: path
                        };
                        try {
                            CONN[region].S3.headObject(options, function (error, data) {
                                if (error)
                                    return reject(error);
                                /** Instantiate the S3Downstream class with
                                 * details returned by s3.headObject
                                 *
                                 * NOTE: Set default chunk data range to 1Mb (1024)
                                 *        by default.
                                 *        Though, scheduled to be upgraded to
                                 *        self adaptation to underline bandwith
                                 */
                                var streamParams = {
                                    chunkRange: 1024,
                                    maxLength: data.ContentLength
                                };
                                resolve(new S3Downstream(CONN[region].S3, options, streamParams, pipeStreamOptions));
                            });
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                },
                /** Handle stream upload file to Amazon S3 */
                to: function (path, progress) { return __awaiter(_this, void 0, void 0, function () {
                    var options, 
                    /** Instantiate the S3Upstream class to upload
                     *
                     * NOTE: Set default chunk data range to 5Mb (5 * 1024)
                     *        by default: Minimum limit set by AWS S3
                     *        Though, scheduled to be upgraded to
                     *        self adaptation to underline bandwith.
                     *
                     *        Also queue at least 4 chunks/parts of 5M
                     *        simultaneously to speed up the streaming
                     *        if the underline connection can handle it.
                     */
                    manager;
                    return __generator(this, function (_a) {
                        options = {
                            Bucket: CONN[region].bucket,
                            Key: path
                        }, manager = new S3Upstream(CONN[region].S3, options, { chunkRange: 5 * 1024, queueSize: 4 });
                        // Register progress tracking listener
                        typeof progress == 'function'
                            && manager.trackProgress(progress);
                        // Log stream error in console
                        manager.promise.catch(console.log);
                        // Return upload stream to be piped
                        return [2 /*return*/, manager.upStream];
                    });
                }); }
            }
        };
    }
    // Middleware to serve CDN Assets as proxy to a web application frontend
    function Static(req, res, next) {
        var _a;
        /** IMPORTANT: Bind space function to express request
         *  thread object, to be able to access & call
         * `req.app.Space(...)` method in middlewares & routers
         */
        req.app.Space = Space.bind(req);
        var path = decodeURIComponent((_a = (0, parseurl_1.default)(req)) === null || _a === void 0 ? void 0 : _a.pathname).replace(/^\//, ''), regions = Object.keys(CONN);
        /** Temporay fix to still route @cdn prefix assets created
         *  on getlearncloud.com platform.
         *
         * TODO: Clear this lines and next below later
         */
        regions.push('cdn');
        var prefixRegex = new RegExp("^@(".concat(regions.join('|'), ")/"));
        if ((req.method !== 'GET'
            && req.method !== 'HEAD')
            /* CDN Assets URL cognition prefix: Require in
              a case whereby this middleware is used globaly
    
              Otherwire, every asssets url related or not to
              the CDN will be send as request to the CDN server
              Notice: It impact on performance an some XML errors
                      maybe return as response content if the
                      requested find is not found.
            */
            || !prefixRegex.test(path)
            || !/\.[a-z0-9]{3,6}$/.test(path)) // Known application files extensions
            return next();
        var _b = path.match(prefixRegex) || [], _ = _b[0], region = _b[1];
        path = path.replace(prefixRegex, '');
        /** Temporay fix to still route @cdn prefix assets created
         *  on getlearncloud.com platform.
         *
         * TODO: Clear this lines and previous above later
         *
         * Control switching between regions by request thread
         * by setting `req.session.cas_region` value to targeted
         * region.
         *
         * NOTE: Support for `req.session` must be defined by the express app.
         *        otherwise will fallback to default region.
         */
        if (region == 'cdn')
            region = (req.session && req.session.cas_region)
                // Fallback/Default region
                || CONFIG.defaultRegion // Predefined in the configuration
                || CONFIG.spaces[0].region; // First specified space's region
        function onError(error) {
            console.log('HTTPS Request Error: ', error);
            next("[CAS]: ".concat(error));
        }
        if (!CONN[region] || !CONN[region].host)
            return onError('[CAS]: Invalid space region');
        // console.log( 'out:', `${CONN[ region ].host}/${path}` )
        req.pipe((0, request_1.default)("".concat(CONN[region].host, "/").concat(path)).on('error', onError))
            .pipe(res);
    }
    // Manually use APIs
    return { Space: Space, Static: Static };
}
var config = function (options) {
    if (typeof options != 'object')
        return function (req, res, next) { return next('[CAS]: Undefined Configuration'); };
    // Check whether all configuration field are defined
    CONFIG = __assign(__assign({}, (CONFIG || {})), options);
    (0, utils_1.checkConfig)('CAS', CONFIG);
    // Initialize
    return Init();
};
exports.config = config;
