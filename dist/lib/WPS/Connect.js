"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var utils_1 = require("../../utils");
var IOClient, TransportReady, Listeners = {}, Manager = {
    emit: function (_event, target, payload) {
        if (!global.Globe_WPSConfig.host)
            throw new Error('Undefined Event Origin. Check configuration <host>');
        if (typeof _event !== 'string' || !target || !payload)
            throw new Error('Invalid Event Parameters');
        sendEvent(global.Globe_WPSConfig.host, _event, target, payload);
    },
    outgoing: function (req, res, next) {
        /** Make outgoing events trigger available
            from API router's request object
        */
        req.Event = function (_event, target, payload) { return sendEvent((0, utils_1.getOrigin)(req), _event, target, payload); };
        next();
    },
    incoming: function (listeners) { return registerEventListeners(listeners); }
};
/* Establish socket connection with the
  provided WPS server
*/
function getConnect(endpoint) {
    return new Promise(function (resolve, reject) {
        // Socket client config
        var ioConfig = {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'WPS-User-Agent': Globe_WPSConfig.userAgent,
                        'WPS-Event-Provider': Globe_WPSConfig.provider,
                        'WPS-Access-Token': Globe_WPSConfig.accessToken
                    }
                }
            }
        };
        IOClient =
            (0, socket_io_client_1.default)(endpoint, ioConfig)
                .on('connect', function () { return console.log('[WPS-CONNECT]: Connectin Established'); })
                .on('connect_error', function (_a) {
                var message = _a.message;
                // Cannot Push event on when an exception thrown
                TransportReady = false;
                console.log('[WPS-CONNECT]: Connection Error: ', message);
                reject(message);
            })
                .on('TRANSPORT::READY', function () {
                // Ready to push events
                TransportReady = true;
                console.log('[WPS-CONNECT]: Events Transport Ready');
                resolve(Manager);
            })
                .on('TRANSPORT::INCOMING', receiveEvent);
    });
}
/* Send events request to webhook server
  only when the transport channel listeners
  handshaked.

  NOTE: Socket could be connect but for another
        namespace activities
*/
function sendEvent() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    TransportReady && IOClient.emit.apply(IOClient, __spreadArray(['TRANSPORT::OUTGOING'], args, false));
}
/* Receive events request from webhook server
  and fire to registered listeners that
  matches them.
*/
function receiveEvent(origin, payload) {
    // Fire all function listeners registered by this event
    var _event = payload.type || payload.event;
    Listeners.hasOwnProperty(_event)
        && Listeners[_event].map(function (fn) { return fn({ origin: origin, body: payload }); });
}
/* Subscribe routes as listener to incoming requests */
function registerEventListeners(list) {
    Object.entries(list)
        .map(function (_a) {
        var _event = _a[0], fn = _a[1];
        Listeners.hasOwnProperty(_event) ?
            Listeners[_event].push(fn) // Add to existing listener slot
            : Listeners[_event] = [fn]; // New listener slot
    });
}
exports.default = (function () {
    return new Promise(function (resolve, reject) {
        if (!global.Globe_WPSConfig)
            return reject("[WPS-CONNECT]: No Configuration Found");
        (0, request_1.default)("".concat(Globe_WPSConfig.server, "/v1/connect"), { headers: Globe_WPSConfig.headers, method: 'GET', json: true, timeout: 8000 }, function (error, resp, body) {
            if (error || body.error)
                return reject("[WPS-CONNECT]: Failed Requesting connection > ".concat(error || body.message));
            resolve(getConnect(body.endpoint));
        });
    });
});
