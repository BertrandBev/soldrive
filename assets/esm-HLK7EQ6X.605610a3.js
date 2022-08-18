import { _ as __toESM, r as require_eventemitter3, i as init_index_browser_esm, P as PublicKey, a as init_esm_browser, v as v4_default, b as __commonJS, c as require_safe_buffer } from './index.36266316.js';

// node_modules/@solflare-wallet/sdk/node_modules/base-x/src/index.js
var require_src = __commonJS({
  "node_modules/@solflare-wallet/sdk/node_modules/base-x/src/index.js"(exports, module) {
    var _Buffer = require_safe_buffer().Buffer;
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode(source) {
        if (Array.isArray(source) || source instanceof Uint8Array) {
          source = _Buffer.from(source);
        }
        if (!_Buffer.isBuffer(source)) {
          throw new TypeError("Expected Buffer");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return _Buffer.alloc(0);
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (source[psz]) {
          var carry = BASE_MAP[source.charCodeAt(psz)];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
        vch.fill(0, 0, zeroes);
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode,
        decodeUnsafe,
        decode
      };
    }
    module.exports = base;
  }
});

// node_modules/@solflare-wallet/sdk/node_modules/bs58/index.js
var require_bs58 = __commonJS({
  "node_modules/@solflare-wallet/sdk/node_modules/bs58/index.js"(exports, module) {
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module.exports = basex(ALPHABET);
  }
});

// node_modules/@solflare-wallet/sdk/lib/esm/index.js
var import_eventemitter33 = __toESM(require_eventemitter3());

// node_modules/@solflare-wallet/sdk/lib/esm/adapters/base.js
var import_eventemitter3 = __toESM(require_eventemitter3());
var __extends = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var WalletAdapter = function(_super) {
  __extends(WalletAdapter2, _super);
  function WalletAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return WalletAdapter2;
}(import_eventemitter3.default);
var base_default = WalletAdapter;

// node_modules/@solflare-wallet/sdk/node_modules/@project-serum/sol-wallet-adapter/dist/index.modern.js
var import_eventemitter32 = __toESM(require_eventemitter3());
init_index_browser_esm();
var import_bs58 = __toESM(require_bs58());
var Wallet = class extends import_eventemitter32.default {
  constructor(provider, network) {
    var _this;
    super();
    _this = this;
    this._handleMessage = (e) => {
      if (this._injectedProvider && e.source === window || e.origin === this._providerUrl.origin && e.source === this._popup) {
        if (e.data.method === "connected") {
          const newPublicKey = new PublicKey(e.data.params.publicKey);
          if (!this._publicKey || !this._publicKey.equals(newPublicKey)) {
            if (this._publicKey && !this._publicKey.equals(newPublicKey)) {
              this._handleDisconnect();
            }
            this._publicKey = newPublicKey;
            this._autoApprove = !!e.data.params.autoApprove;
            this.emit("connect", this._publicKey);
          }
        } else if (e.data.method === "disconnected") {
          this._handleDisconnect();
        } else if (e.data.result || e.data.error) {
          if (this._responsePromises.has(e.data.id)) {
            const [resolve, reject] = this._responsePromises.get(e.data.id);
            if (e.data.result) {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error));
            }
          }
        }
      }
    };
    this._handleConnect = () => {
      if (!this._handlerAdded) {
        this._handlerAdded = true;
        window.addEventListener("message", this._handleMessage);
        window.addEventListener("beforeunload", this.disconnect);
      }
      if (this._injectedProvider) {
        return new Promise((resolve) => {
          this._sendRequest("connect", {});
          resolve();
        });
      } else {
        window.name = "parent";
        this._popup = window.open(this._providerUrl.toString(), "_blank", "location,resizable,width=460,height=675");
        return new Promise((resolve) => {
          this.once("connect", resolve);
        });
      }
    };
    this._handleDisconnect = () => {
      if (this._handlerAdded) {
        this._handlerAdded = false;
        window.removeEventListener("message", this._handleMessage);
        window.removeEventListener("beforeunload", this.disconnect);
      }
      if (this._publicKey) {
        this._publicKey = null;
        this.emit("disconnect");
      }
      this._responsePromises.forEach(([resolve, reject], id) => {
        this._responsePromises.delete(id);
        reject("Wallet disconnected");
      });
    };
    this._sendRequest = async function(method, params) {
      if (method !== "connect" && !_this.connected) {
        throw new Error("Wallet not connected");
      }
      const requestId = _this._nextRequestId;
      ++_this._nextRequestId;
      return new Promise((resolve, reject) => {
        _this._responsePromises.set(requestId, [resolve, reject]);
        if (_this._injectedProvider) {
          _this._injectedProvider.postMessage({
            jsonrpc: "2.0",
            id: requestId,
            method,
            params: {
              network: _this._network,
              ...params
            }
          });
        } else {
          _this._popup.postMessage({
            jsonrpc: "2.0",
            id: requestId,
            method,
            params
          }, _this._providerUrl.origin);
          if (!_this.autoApprove) {
            _this._popup.focus();
          }
        }
      });
    };
    this.connect = () => {
      if (this._popup) {
        this._popup.close();
      }
      return this._handleConnect();
    };
    this.disconnect = async function() {
      if (_this._injectedProvider) {
        await _this._sendRequest("disconnect", {});
      }
      if (_this._popup) {
        _this._popup.close();
      }
      _this._handleDisconnect();
    };
    this.sign = async function(data, display) {
      if (!(data instanceof Uint8Array)) {
        throw new Error("Data must be an instance of Uint8Array");
      }
      const response = await _this._sendRequest("sign", {
        data,
        display
      });
      const signature = import_bs58.default.decode(response.signature);
      const publicKey = new PublicKey(response.publicKey);
      return {
        signature,
        publicKey
      };
    };
    this.signTransaction = async function(transaction) {
      const response = await _this._sendRequest("signTransaction", {
        message: import_bs58.default.encode(transaction.serializeMessage())
      });
      const signature = import_bs58.default.decode(response.signature);
      const publicKey = new PublicKey(response.publicKey);
      transaction.addSignature(publicKey, signature);
      return transaction;
    };
    this.signAllTransactions = async function(transactions) {
      const response = await _this._sendRequest("signAllTransactions", {
        messages: transactions.map((tx) => import_bs58.default.encode(tx.serializeMessage()))
      });
      const signatures = response.signatures.map((s) => import_bs58.default.decode(s));
      const publicKey = new PublicKey(response.publicKey);
      transactions = transactions.map((tx, idx) => {
        tx.addSignature(publicKey, signatures[idx]);
        return tx;
      });
      return transactions;
    };
    if (isInjectedProvider(provider)) {
      this._injectedProvider = provider;
    } else if (isString(provider)) {
      this._providerUrl = new URL(provider);
      this._providerUrl.hash = new URLSearchParams({
        origin: window.location.origin,
        network
      }).toString();
    } else {
      throw new Error("provider parameter must be an injected provider or a URL string.");
    }
    this._network = network;
    this._publicKey = null;
    this._autoApprove = false;
    this._popup = null;
    this._handlerAdded = false;
    this._nextRequestId = 1;
    this._responsePromises = /* @__PURE__ */ new Map();
  }
  get publicKey() {
    return this._publicKey;
  }
  get connected() {
    return this._publicKey !== null;
  }
  get autoApprove() {
    return this._autoApprove;
  }
};
function isString(a) {
  return typeof a === "string";
}
function isInjectedProvider(a) {
  return isObject(a) && isFunction(a.postMessage);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function isFunction(a) {
  return typeof a === "function";
}
var index_modern_default = Wallet;

// node_modules/@solflare-wallet/sdk/lib/esm/adapters/web.js
var __extends2 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var WebAdapter = function(_super) {
  __extends2(WebAdapter2, _super);
  function WebAdapter2(iframe, network, provider) {
    var _this = _super.call(this) || this;
    _this._instance = null;
    _this.handleMessage = function(data) {
    };
    _this._handleConnect = function() {
      _this.emit("connect");
    };
    _this._handleDisconnect = function() {
      window.clearInterval(_this._pollTimer);
      _this.emit("disconnect");
    };
    _this._network = network;
    _this._provider = provider;
    return _this;
  }
  Object.defineProperty(WebAdapter2.prototype, "publicKey", {
    get: function() {
      return this._instance.publicKey || null;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(WebAdapter2.prototype, "connected", {
    get: function() {
      return this._instance.connected || false;
    },
    enumerable: false,
    configurable: true
  });
  WebAdapter2.prototype.connect = function() {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            this._instance = new index_modern_default(this._provider, this._network);
            this._instance.on("connect", this._handleConnect);
            this._instance.on("disconnect", this._handleDisconnect);
            this._pollTimer = window.setInterval(function() {
              var _a2, _b;
              if (((_b = (_a2 = _this._instance) === null || _a2 === void 0 ? void 0 : _a2._popup) === null || _b === void 0 ? void 0 : _b.closed) !== false) {
                _this._handleDisconnect();
              }
            }, 200);
            return [4, this._instance.connect()];
          case 1:
            _a.sent();
            return [2];
        }
      });
    });
  };
  WebAdapter2.prototype.disconnect = function() {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            this._instance.removeAllListeners("connect");
            this._instance.removeAllListeners("disconnect");
            return [4, this._instance.disconnect()];
          case 1:
            _a.sent();
            return [2];
        }
      });
    });
  };
  WebAdapter2.prototype.signTransaction = function(transaction) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._instance.signTransaction(transaction)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  WebAdapter2.prototype.signAllTransactions = function(transactions) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._instance.signAllTransactions(transactions)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  WebAdapter2.prototype.signMessage = function(data, display) {
    if (display === void 0) {
      display = "hex";
    }
    return __awaiter(this, void 0, void 0, function() {
      var signature;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._instance.sign(data, display)];
          case 1:
            signature = _a.sent().signature;
            return [2, Uint8Array.from(signature)];
        }
      });
    });
  };
  return WebAdapter2;
}(base_default);
var web_default = WebAdapter;

// node_modules/@solflare-wallet/sdk/lib/esm/adapters/iframe.js
init_index_browser_esm();
init_esm_browser();
var import_bs582 = __toESM(require_bs58());
var __extends3 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator2 = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var IframeAdapter = function(_super) {
  __extends3(IframeAdapter2, _super);
  function IframeAdapter2(iframe, publicKey) {
    var _this = this;
    var _a;
    _this = _super.call(this) || this;
    _this._publicKey = null;
    _this._messageHandlers = {};
    _this.handleMessage = function(data) {
      if (_this._messageHandlers[data.id]) {
        var _a2 = _this._messageHandlers[data.id], resolve = _a2.resolve, reject = _a2.reject;
        delete _this._messageHandlers[data.id];
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.result);
        }
      }
    };
    _this._sendMessage = function(data) {
      if (!_this.connected) {
        throw new Error("Wallet not connected");
      }
      return new Promise(function(resolve, reject) {
        var _a2, _b;
        var messageId = v4_default();
        _this._messageHandlers[messageId] = { resolve, reject };
        (_b = (_a2 = _this._iframe) === null || _a2 === void 0 ? void 0 : _a2.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage({
          channel: "solflareWalletAdapterToIframe",
          data: __assign({ id: messageId }, data)
        }, "*");
      });
    };
    _this._iframe = iframe;
    _this._publicKey = new PublicKey((_a = publicKey === null || publicKey === void 0 ? void 0 : publicKey.toString) === null || _a === void 0 ? void 0 : _a.call(publicKey));
    return _this;
  }
  Object.defineProperty(IframeAdapter2.prototype, "publicKey", {
    get: function() {
      return this._publicKey || null;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(IframeAdapter2.prototype, "connected", {
    get: function() {
      return true;
    },
    enumerable: false,
    configurable: true
  });
  IframeAdapter2.prototype.connect = function() {
    return __awaiter2(this, void 0, void 0, function() {
      return __generator2(this, function(_a) {
        return [2];
      });
    });
  };
  IframeAdapter2.prototype.disconnect = function() {
    return __awaiter2(this, void 0, void 0, function() {
      return __generator2(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this._sendMessage({
              method: "disconnect"
            })];
          case 1:
            _a.sent();
            return [2];
        }
      });
    });
  };
  IframeAdapter2.prototype.signTransaction = function(transaction) {
    return __awaiter2(this, void 0, void 0, function() {
      var _a, publicKey, signature, e_1;
      return __generator2(this, function(_b) {
        switch (_b.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4, this._sendMessage({
              method: "signTransaction",
              params: {
                message: import_bs582.default.encode(transaction.serializeMessage())
              }
            })];
          case 2:
            _a = _b.sent(), publicKey = _a.publicKey, signature = _a.signature;
            transaction.addSignature(new PublicKey(publicKey), import_bs582.default.decode(signature));
            return [2, transaction];
          case 3:
            e_1 = _b.sent();
            console.log(e_1);
            throw new Error("Failed to sign transaction");
          case 4:
            return [2];
        }
      });
    });
  };
  IframeAdapter2.prototype.signAllTransactions = function(transactions) {
    return __awaiter2(this, void 0, void 0, function() {
      var _a, publicKey_1, signatures_1, e_2;
      return __generator2(this, function(_b) {
        switch (_b.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4, this._sendMessage({
              method: "signAllTransactions",
              params: {
                messages: transactions.map(function(transaction) {
                  return import_bs582.default.encode(transaction.serializeMessage());
                })
              }
            })];
          case 2:
            _a = _b.sent(), publicKey_1 = _a.publicKey, signatures_1 = _a.signatures;
            return [2, transactions.map(function(tx, id) {
              tx.addSignature(new PublicKey(publicKey_1), import_bs582.default.decode(signatures_1[id]));
              return tx;
            })];
          case 3:
            e_2 = _b.sent();
            console.log(e_2);
            throw new Error("Failed to sign transactions");
          case 4:
            return [2];
        }
      });
    });
  };
  IframeAdapter2.prototype.signMessage = function(data, display) {
    if (display === void 0) {
      display = "hex";
    }
    return __awaiter2(this, void 0, void 0, function() {
      var result, e_3;
      return __generator2(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4, this._sendMessage({
              method: "signMessage",
              params: {
                data,
                display
              }
            })];
          case 2:
            result = _a.sent();
            return [2, Uint8Array.from(import_bs582.default.decode(result))];
          case 3:
            e_3 = _a.sent();
            console.log(e_3);
            throw new Error("Failed to sign message");
          case 4:
            return [2];
        }
      });
    });
  };
  return IframeAdapter2;
}(base_default);
var iframe_default = IframeAdapter;

// node_modules/@solflare-wallet/sdk/lib/esm/index.js
var __extends4 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __awaiter3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator3 = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var __values = function(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var Solflare = function(_super) {
  __extends4(Solflare2, _super);
  function Solflare2(config) {
    var _this = _super.call(this) || this;
    _this._network = "mainnet-beta";
    _this._provider = null;
    _this._adapterInstance = null;
    _this._element = null;
    _this._iframe = null;
    _this._connectHandler = null;
    _this._flutterHandlerInterval = null;
    _this._handleEvent = function(event) {
      var _a, _b, _c;
      switch (event.type) {
        case "connect_native_web": {
          _this._collapseIframe();
          _this._adapterInstance = new web_default(_this._iframe, _this._network, ((_a = event.data) === null || _a === void 0 ? void 0 : _a.provider) || _this._provider || "https://solflare.com/provider");
          _this._adapterInstance.on("connect", _this._webConnected);
          _this._adapterInstance.on("disconnect", _this._webDisconnected);
          _this._adapterInstance.connect();
          _this._setPreferredAdapter("native_web");
          return;
        }
        case "connect": {
          _this._collapseIframe();
          _this._adapterInstance = new iframe_default(_this._iframe, ((_b = event.data) === null || _b === void 0 ? void 0 : _b.publicKey) || "");
          _this._adapterInstance.connect();
          _this._setPreferredAdapter((_c = event.data) === null || _c === void 0 ? void 0 : _c.adapter);
          if (_this._connectHandler) {
            _this._connectHandler.resolve();
            _this._connectHandler = null;
          }
          _this.emit("connect", _this.publicKey);
          return;
        }
        case "disconnect": {
          if (_this._connectHandler) {
            _this._connectHandler.reject();
            _this._connectHandler = null;
          }
          _this._disconnected();
          _this.emit("disconnect");
          return;
        }
        case "collapse": {
          _this._collapseIframe();
          return;
        }
        default: {
          return;
        }
      }
    };
    _this._handleMessage = function(event) {
      var _a;
      if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.channel) !== "solflareIframeToWalletAdapter") {
        return;
      }
      var data = event.data.data || {};
      if (data.type === "event") {
        _this._handleEvent(data.event);
      } else if (_this._adapterInstance) {
        _this._adapterInstance.handleMessage(data);
      }
    };
    _this._removeElement = function() {
      if (_this._flutterHandlerInterval !== null) {
        clearInterval(_this._flutterHandlerInterval);
        _this._flutterHandlerInterval = null;
      }
      if (_this._element) {
        _this._element.remove();
        _this._element = null;
      }
    };
    _this._removeDanglingElements = function() {
      var e_1, _a;
      var elements = document.getElementsByClassName("solflare-wallet-adapter-iframe");
      try {
        for (var elements_1 = __values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
          var element = elements_1_1.value;
          if (element.parentElement) {
            element.remove();
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return))
            _a.call(elements_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    _this._injectElement = function() {
      _this._removeElement();
      _this._removeDanglingElements();
      var iframeUrl = "".concat(Solflare2.IFRAME_URL, "?cluster=").concat(encodeURIComponent(_this._network), "&origin=").concat(encodeURIComponent(window.location.origin));
      var preferredAdapter = _this._getPreferredAdapter();
      if (preferredAdapter) {
        iframeUrl += "&adapter=".concat(encodeURIComponent(preferredAdapter));
      }
      _this._element = document.createElement("div");
      _this._element.className = "solflare-wallet-adapter-iframe";
      _this._element.innerHTML = "\n      <iframe src='".concat(iframeUrl, "' style='position: fixed; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; border: none; border-radius: 0; z-index: 99999; color-scheme: auto;' allowtransparency='true'></iframe>\n    ");
      document.body.appendChild(_this._element);
      _this._iframe = _this._element.querySelector("iframe");
      window.fromFlutter = _this._handleMobileMessage;
      _this._flutterHandlerInterval = setInterval(function() {
        window.fromFlutter = _this._handleMobileMessage;
      }, 100);
      window.addEventListener("message", _this._handleMessage, false);
    };
    _this._collapseIframe = function() {
      if (_this._iframe) {
        _this._iframe.style.top = "";
        _this._iframe.style.right = "";
        _this._iframe.style.height = "2px";
        _this._iframe.style.width = "2px";
      }
    };
    _this._getPreferredAdapter = function() {
      if (localStorage) {
        return localStorage.getItem("solflarePreferredWalletAdapter") || null;
      }
      return null;
    };
    _this._setPreferredAdapter = function(adapter) {
      if (localStorage && adapter) {
        localStorage.setItem("solflarePreferredWalletAdapter", adapter);
      }
    };
    _this._clearPreferredAdapter = function() {
      if (localStorage) {
        localStorage.removeItem("solflarePreferredWalletAdapter");
      }
    };
    _this._webConnected = function() {
      if (_this._connectHandler) {
        _this._connectHandler.resolve();
        _this._connectHandler = null;
      }
      _this.emit("connect", _this.publicKey);
    };
    _this._webDisconnected = function() {
      if (_this._connectHandler) {
        _this._connectHandler.reject();
        _this._connectHandler = null;
      }
      _this._disconnected();
      _this.emit("disconnect");
    };
    _this._disconnected = function() {
      window.removeEventListener("message", _this._handleMessage, false);
      _this._removeElement();
      _this._clearPreferredAdapter();
      _this._adapterInstance = null;
    };
    _this._handleMobileMessage = function(data) {
      var _a, _b;
      (_b = (_a = _this._iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage({
        channel: "solflareMobileToIframe",
        data
      }, "*");
    };
    if (config === null || config === void 0 ? void 0 : config.network) {
      _this._network = config === null || config === void 0 ? void 0 : config.network;
    }
    if (config === null || config === void 0 ? void 0 : config.provider) {
      _this._provider = config === null || config === void 0 ? void 0 : config.provider;
    }
    return _this;
  }
  Object.defineProperty(Solflare2.prototype, "publicKey", {
    get: function() {
      var _a;
      return ((_a = this._adapterInstance) === null || _a === void 0 ? void 0 : _a.publicKey) || null;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Solflare2.prototype, "isConnected", {
    get: function() {
      var _a;
      return !!((_a = this._adapterInstance) === null || _a === void 0 ? void 0 : _a.connected);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Solflare2.prototype, "connected", {
    get: function() {
      return this.isConnected;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Solflare2.prototype, "autoApprove", {
    get: function() {
      return false;
    },
    enumerable: false,
    configurable: true
  });
  Solflare2.prototype.connect = function() {
    return __awaiter3(this, void 0, void 0, function() {
      var _this = this;
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (this.connected) {
              return [2];
            }
            this._injectElement();
            return [4, new Promise(function(resolve, reject) {
              _this._connectHandler = { resolve, reject };
            })];
          case 1:
            _a.sent();
            return [2];
        }
      });
    });
  };
  Solflare2.prototype.disconnect = function() {
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this._adapterInstance) {
              return [2];
            }
            return [4, this._adapterInstance.disconnect()];
          case 1:
            _a.sent();
            this._disconnected();
            this.emit("disconnect");
            return [2];
        }
      });
    });
  };
  Solflare2.prototype.signTransaction = function(transaction) {
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._adapterInstance.signTransaction(transaction)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  Solflare2.prototype.signAllTransactions = function(transactions) {
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._adapterInstance.signAllTransactions(transactions)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  Solflare2.prototype.signMessage = function(data, display) {
    if (display === void 0) {
      display = "utf8";
    }
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this.connected) {
              throw new Error("Wallet not connected");
            }
            return [4, this._adapterInstance.signMessage(data, display)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  Solflare2.prototype.sign = function(data, display) {
    if (display === void 0) {
      display = "utf8";
    }
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this.signMessage(data, display)];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  Solflare2.prototype.detectWallet = function(timeout) {
    if (timeout === void 0) {
      timeout = 10;
    }
    return __awaiter3(this, void 0, void 0, function() {
      return __generator3(this, function(_a) {
        return [2, new Promise(function(resolve) {
          var element = null;
          function handleDetected(detected) {
            cleanUp();
            resolve(detected);
          }
          var timeoutHandler = setTimeout(function() {
            handleDetected(false);
          }, timeout * 1e3);
          function cleanUp() {
            window.removeEventListener("message", handleMessage, false);
            if (element) {
              document.body.removeChild(element);
              element = null;
            }
            if (timeoutHandler) {
              clearTimeout(timeoutHandler);
              timeoutHandler = null;
            }
          }
          function handleMessage(event) {
            var _a2, _b, _c;
            if (((_a2 = event.data) === null || _a2 === void 0 ? void 0 : _a2.channel) !== "solflareDetectorToAdapter") {
              return;
            }
            handleDetected(!!((_c = (_b = event.data) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detected));
          }
          window.addEventListener("message", handleMessage, false);
          element = document.createElement("div");
          element.className = "solflare-wallet-detect-iframe";
          element.innerHTML = "\n        <iframe src='".concat(Solflare2.DETECT_IFRAME_URL, "?timeout=").concat(timeout, "' style='position: fixed; top: -9999px; left: -9999px; width: 0; height: 0; pointer-events: none; border: none;'></iframe>\n      ");
          document.body.appendChild(element);
        })];
      });
    });
  };
  Solflare2.IFRAME_URL = "https://connect.solflare.com/";
  Solflare2.DETECT_IFRAME_URL = "https://connect.solflare.com/detect";
  return Solflare2;
}(import_eventemitter33.default);
var esm_default = Solflare;

export { esm_default as default };
