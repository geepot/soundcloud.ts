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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
var undici_1 = require("undici");
var apiURL = "https://api.soundcloud.com";
var apiV2URL = "https://api-v2.soundcloud.com";
var webURL = "https://soundcloud.com";
var API = /** @class */ (function () {
    function API(clientId, oauthToken, proxy) {
        var _this = this;
        this.clientId = clientId;
        this.oauthToken = oauthToken;
        this.api = new undici_1.Pool(apiURL);
        this.apiV2 = new undici_1.Pool(apiV2URL);
        this.web = new undici_1.Pool(webURL);
        /**
         * Gets an endpoint from the Soundcloud API.
         */
        this.get = function (endpoint, params) {
            return _this.getRequest(_this.api, apiURL, endpoint, params);
        };
        /**
         * Gets an endpoint from the Soundcloud V2 API.
         */
        this.getV2 = function (endpoint, params) {
            return _this.getRequest(_this.apiV2, apiV2URL, endpoint, params);
        };
        /**
         * Some endpoints use the main website as the URL.
         */
        this.getWebsite = function (endpoint, params) {
            return _this.getRequest(_this.web, webURL, endpoint, params);
        };
        /**
         * Gets a URL, such as download, stream, attachment, etc.
         */
        this.getURL = function (URI, params) {
            if (_this.proxy)
                return _this.requestWithRetry(URI, _this.buildOptions(URI, "GET", params));
            var options = {
                path: URI,
                method: "GET",
                query: params || {},
                headers: API.headers,
                maxRedirections: 5,
            };
            if (_this.clientId)
                options.query.client_id = _this.clientId;
            if (_this.oauthToken)
                options.query.oauth_token = _this.oauthToken;
            return _this.requestWithRetry(URI, options);
        };
        this.buildOptions = function (path, method, params) {
            if (method === void 0) { method = "GET"; }
            var options = {
                query: (method === "GET" && params) || {},
                headers: API.headers,
                method: method,
                path: path,
                maxRedirections: 5,
            };
            if (method === "POST" && params)
                options.body = JSON.stringify(params);
            if (_this.clientId)
                options.query.client_id = _this.clientId;
            if (_this.oauthToken)
                options.query.oauth_token = _this.oauthToken;
            return options;
        };
        this.requestWithRetry = function (URI, options) { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, (0, undici_1.request)(URI, options).then(function (r) { return _this.handleResponse(r); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        if (!this.shouldRetry(error_1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getClientId(true)];
                    case 3:
                        _a.sent();
                        options.query.client_id = this.clientId; // Update client_id in options
                        return [2 /*return*/, (0, undici_1.request)(URI, options).then(function (r) { return _this.handleResponse(r); })];
                    case 4: throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.request = function (pool, options) { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, pool.request(options).then(function (r) { return _this.handleResponse(r); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        if (!this.shouldRetry(error_2)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getClientId(true)];
                    case 3:
                        _a.sent();
                        options.query.client_id = this.clientId; // Update client_id in options
                        return [2 /*return*/, pool.request(options).then(function (r) { return _this.handleResponse(r); })];
                    case 4: throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.getRequest = function (pool, origin, endpoint, params) { return __awaiter(_this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.clientId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getClientId()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (endpoint.startsWith("/"))
                            endpoint = endpoint.slice(1);
                        options = this.buildOptions("".concat(this.proxy ? origin : "", "/").concat(endpoint), "GET", params);
                        return [2 /*return*/, this.request(pool, options)];
                }
            });
        }); };
        this.post = function (endpoint, params) { return __awaiter(_this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.clientId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getClientId()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (endpoint.startsWith("/"))
                            endpoint = endpoint.slice(1);
                        options = this.buildOptions("".concat(this.proxy ? origin : "", "/").concat(endpoint), "POST", params);
                        return [2 /*return*/, this.request(this.proxy || this.api, options)];
                }
            });
        }); };
        this.handleResponse = function (response) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                if (response.statusCode.toString().startsWith("2")) {
                    if ((_a = response.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.includes("application/json")) {
                        return [2 /*return*/, response.body.json()];
                    }
                    return [2 /*return*/, response.body.text()];
                }
                throw new Error("Status code ".concat(response.statusCode));
            });
        }); };
        this.shouldRetry = function (error) {
            return ["401", "403"].some(function (code) { return error.message.includes("Status code ".concat(code)); });
        };
        this.getClientIdWeb = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, urls, script, clientId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.request(this.proxy || this.web, this.buildOptions(this.proxy ? webURL : "/"))];
                    case 1:
                        response = _b.sent();
                        if (!response || typeof response !== "string")
                            throw new Error("Could not find client ID");
                        urls = response.match(/(?!<script.*?src=")https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*\.js)(?=.*?>)/g);
                        if (!urls || urls.length === 0)
                            throw new Error("Could not find script URLs");
                        _b.label = 2;
                    case 2: return [4 /*yield*/, (this.proxy
                            ? this.request(this.proxy, this.buildOptions(urls.pop()))
                            : (0, undici_1.request)(urls.pop()).then(function (r) { return r.body.text(); }))];
                    case 3:
                        script = _b.sent();
                        if (!script || typeof script !== "string")
                            return [3 /*break*/, 4];
                        clientId = (_a = script.match(/[{,]client_id:"(\w+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                        if (typeof clientId === "string")
                            return [2 /*return*/, clientId];
                        _b.label = 4;
                    case 4:
                        if (urls.length > 0) return [3 /*break*/, 2];
                        _b.label = 5;
                    case 5: throw new Error("Could not find client ID in script URLs");
                }
            });
        }); };
        this.getClientIdMobile = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, clientId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, undici_1.request)("https://m.soundcloud.com/", {
                            headers: {
                                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5_1 like Mac OS X) " +
                                    "AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.47 Mobile/15E148 Safari/604.1",
                            },
                        }).then(function (r) { return r.body.text(); })];
                    case 1:
                        response = _b.sent();
                        clientId = (_a = response.match(/"clientId":"(\w+?)"/)) === null || _a === void 0 ? void 0 : _a[1];
                        if (typeof clientId === "string")
                            return [2 /*return*/, clientId];
                        throw new Error("Could not find client ID");
                }
            });
        }); };
        this.getClientId = function (reset) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!this.oauthToken && (!this.clientId || reset))) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.getClientIdWeb().catch(function (webError) {
                                return _this.getClientIdMobile().catch(function (mobileError) {
                                    throw new Error("Could not find client ID. Please provide one in the constructor. (Guide: https://github.com/Tenpi/soundcloud.ts#getting-started)" +
                                        "\nWeb error: ".concat(webError) +
                                        "\nMobile error: ".concat(mobileError));
                                });
                            })];
                    case 1:
                        _a.clientId = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.clientId];
                }
            });
        }); };
        if (oauthToken)
            API.headers.Authorization = "OAuth ".concat(oauthToken);
        if (proxy)
            this.proxy = new undici_1.Pool(proxy);
    }
    Object.defineProperty(API.prototype, "headers", {
        get: function () {
            return API.headers;
        },
        enumerable: false,
        configurable: true
    });
    API.headers = {
        Origin: "https://soundcloud.com",
        Referer: "https://soundcloud.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
    };
    return API;
}());
exports.API = API;
