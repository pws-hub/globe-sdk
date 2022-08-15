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
exports.read = exports.write = exports.fromCDN = exports.toCDN = void 0;
/** -------------------------------------
 *  DTF: Delta To File (CDN Based File)
 ** --------------------------------------
 *
 * @version 1.0
 * @author Fabrice Marlboro
 * @copyright https://myapptech.com
 *
 * - Convert JSON data to File and upload to CDN
 * - Fetch file from CDN and reverse to JSON data
*/
var crypto_js_1 = __importDefault(require("crypto-js"));
var rand_token_1 = __importDefault(require("rand-token"));
function reverse(str) {
    return str.split('').reverse().join('');
}
var toCDN = function (file, location, origin) {
    return new Promise(function (resolve, reject) {
        var body = new FormData();
        body.append('file', file);
        window.fetch("".concat(origin, "/assets/upload/").concat(location || 'library'), { method: 'POST', body: body })
            .then(function (res) { return res.json(); })
            .then(resolve)
            .catch(reject);
    });
};
exports.toCDN = toCDN;
var fromCDN = function (url) {
    return new Promise(function (resolve, reject) {
        window.fetch(url).then(function (res) { return res.text(); })
            .then(resolve)
            .catch(reject);
    });
};
exports.fromCDN = fromCDN;
/**
 * Serialize: Generate cryptojs compatiable encoding token
 *
 * @param mixed $arg
 * @param mixed $key
 * @return string
 */
var encode = function (arg, key) {
    key = key || '1234567890abCDEfgh';
    arg = reverse(JSON.stringify(arg));
    var str = crypto_js_1.default.AES.encrypt(arg, key).toString(), result = '', i = 0;
    // Add random string of 8 length here
    str = rand_token_1.default.generate(8) + str + rand_token_1.default.generate(6);
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    do {
        var a = str.charCodeAt(i++), b = str.charCodeAt(i++), c = str.charCodeAt(i++);
        a = a ? a : 0;
        b = b ? b : 0;
        c = c ? c : 0;
        var b1 = (a >> 2) & 0x3F, b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF), b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3), b4 = c & 0x3F;
        if (!b)
            b3 = b4 = 64;
        else if (!c)
            b4 = 64;
        result += b64.charAt(b1) + b64.charAt(b2) + b64.charAt(b3) + b64.charAt(b4);
    } while (i < str.length);
    return result;
};
/**
 * Unserialize: Extract data from a CryptoJS encoding string (Token)
 *
 * @param string $str
 * @param string $key
 * @return object
 */
var decode = function (str, key) {
    // Default Reverse Encrypting Tool: Modified Base64 decoder
    key = key || '1234567890abCDEfgh';
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var result = '', i = 0;
    do {
        var b1 = b64.indexOf(str.charAt(i++)), b2 = b64.indexOf(str.charAt(i++)), b3 = b64.indexOf(str.charAt(i++)), b4 = b64.indexOf(str.charAt(i++)), a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3), b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF), c = ((b3 & 0x3) << 6) | (b4 & 0x3F);
        result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');
    } while (i < str.length);
    result = result.replace(result.slice(0, 8), '')
        .replace(result.slice(result.length - 6), '');
    result = crypto_js_1.default.AES.decrypt(result, key).toString(crypto_js_1.default.enc.Utf8);
    return JSON.parse(reverse(result));
};
/**
 * Write delta (JSON Data) as file to CDN
 *
 * @param object $delta
 * @param string $type
 * @return string
 */
var write = function (delta, type, origin) { return __awaiter(void 0, void 0, void 0, function () {
    var keygen, strFile, _a, error, message, links, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (typeof delta !== 'object' || !type)
                    return [2 /*return*/, false];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                keygen = rand_token_1.default.generate(58), strFile = "".concat(encode(delta, keygen), "$").concat(reverse(keygen));
                return [4 /*yield*/, (0, exports.toCDN)(new Blob([strFile], { type: 'text/' + type }), false, origin)];
            case 2:
                _a = _b.sent(), error = _a.error, message = _a.message, links = _a.links;
                if (error)
                    throw new Error(message);
                return [2 /*return*/, links[0]];
            case 3:
                error_1 = _b.sent();
                console.log('Error: ', error_1);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.write = write;
/**
 * Fetch CDN file and parse it to Delta (JSON Data)
 *
 * @param object $link
 * @return object
 */
var read = function (link) { return __awaiter(void 0, void 0, void 0, function () {
    var strFile, _a, content, key, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.fromCDN)(link)];
            case 1:
                strFile = _b.sent(), _a = strFile.split('$'), content = _a[0], key = _a[1];
                if (!content || !key)
                    throw new Error('Invalid File Content');
                return [2 /*return*/, decode(content, reverse(key))];
            case 2:
                error_2 = _b.sent();
                console.log('Error: ', error_2);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.read = read;
exports.default = { write: exports.write, read: exports.read, toCDN: exports.toCDN, fromCDN: exports.fromCDN };
