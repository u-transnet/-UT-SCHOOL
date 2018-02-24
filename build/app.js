//// THIS FILE IS CONCATENATED WITH gulp-obfuscator-js
(function (native_require, this_module) {

    // Blatantly stolen from the fantastic node-obfuscator project by Stephen Mathieson
    //     https://github.com/stephenmathieson/node-obfuscator/blob/master/lib/require.js

    // based on TJ Holowaychuk's commonjs require binding

    function require(p, root) {
        // third-party module?  use native require
        if ('.' != p[0] && '/' != p[0]) {
            return native_require(p);
        }

        root = root || 'root';

        var path = require.resolve(p);

        // if it's a non-registered json file, it
        // must be at the root of the project
        if (!path && /\.json$/i.test(p)) {
            return native_require('./' + require.basename(p));
        }

        var module = require.cache[path];

        if (!module) {
            try {
                return native_require(p);
            } catch (err) {
                throw new Error('failed to require "' + p + '" from ' + root +'\n' +
                                                err.message + '\n' + err.stack);
            }
        }

        if (!module.exports) {
            module.exports = {};
            module.call(module.exports, module, module.exports,
                require.relative(path));
        }

        return module.exports;
    }

    // same as node's `require`
    require.cache = {};

    // node's native `path.basename`
    require.basename = native_require('path').basename;

    require.resolve = function (path) {
        // GH-12
        if ('.' != path[0]) {
            return native_require.resolve(path);
        }

        var pathWithSlash = path.slice(-1) === '/' ? path : path + '/';
        var paths = [
            path,
            path + '.js',
            pathWithSlash + 'index.js',
            path + '.json',
            pathWithSlash + 'index.json'
        ];

        for (var i in paths) {
            var p = paths[i];
            if (require.cache[p]) {
                return p;
            }
        }
    };

    require.register = function (path, fn) {
        require.cache[path] = fn;
    };

    require.relative = function (parent) {
        function relative(p) {
            if ('.' != p[0]) {
                return require(p);
            }

            var path = parent.split('/');
            var segs = p.split('/');
            path.pop();

            for (var i in segs) {
                var seg = segs[i];
                if ('..' == seg) {
                    path.pop();
                } else if ('.' != seg) {
                    path.push(seg);
                }
            }

            return require(path.join('/'), parent);
        }

        relative.resolve = require.resolve;
        relative.cache = require.cache;
        return relative;
    };

    //// BEGIN ORIGINAL SOURCE

    // BEGIN FILE ./main.js
    require.register("./main.js", function (module, exports, require) {

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Api = require('./api/Api.js');

exports.default = _Api.Api; /**
                             * Created by superpchelka on 22.02.18.
                             */
    });
    // END FILE

    // BEGIN FILE ./api/Api.js
    require.register("./api/Api.js", function (module, exports, require) {

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Api = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _Account = require("../common/Account");

var _StudentApi = require("./StudentApi");

var _TeacherApi = require("./TeacherApi");

var _BlockchainApi = require("./BlockchainApi");

var _bitsharesjs = require("bitsharesjs");

var _Configs = require("../common/Configs");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Api = function () {
    _createClass(Api, null, [{
        key: "init",
        value: function init(nodeUrl, accountName, privateKey) {
            var api = new Api(accountName, privateKey);
            return new Promise(function (resolved, rejected) {
                _BlockchainApi.BlockchainApi.init(nodeUrl).then(function () {
                    return resolved(api);
                }).catch(rejected);
            });
        }
    }]);

    function Api(accountName, privateKey) {
        _classCallCheck(this, Api);

        this.account = new _Account.Account(accountName, privateKey);
        this.studentApi = new _StudentApi.StudentApi(this.account);
        this.teacherApi = new _TeacherApi.TeacherApi(this.account);
    }

    _createClass(Api, [{
        key: "generateKeys",
        value: function generateKeys(login, password) {
            return _bitsharesjs.Login.generateKeys(login, password);
        }

        /**
         * @desc register user by login, password
         * @param login - name of the new bitshares account
         * @param password
         * @return serialized transaction
         */

    }, {
        key: "register",
        value: function register(login, password) {

            _bitsharesjs.ChainValidation.required(_Configs.utSchoolFaucet, "registrar_id");

            var keys = this.generateKeys(login, password);

            return new Promise(function (resolve, reject) {
                return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _Configs.utSchoolFaucet)]).then(function (res) {
                    var _res = _slicedToArray(res, 1),
                        chain_registrar = _res[0];

                    var tr = new _bitsharesjs.TransactionBuilder();
                    tr.add_type_operation("account_create", {
                        fee: {
                            amount: 0,
                            asset_id: 0
                        },
                        "registrar": chain_registrar.get("id"),
                        "referrer": chain_registrar.get("id"),
                        "name": login,
                        "owner": {
                            "weight_threshold": 1,
                            "account_auths": [],
                            "key_auths": [[keys.pubKeys.owner, 1]],
                            "address_auths": []
                        },
                        "active": {
                            "weight_threshold": 1,
                            "account_auths": [],
                            "key_auths": [[keys.pubKeys.active, 1]],
                            "address_auths": []
                        },
                        "options": {
                            "memo_key": keys.pubKeys.memo,
                            "voting_account": "1.2.5",
                            "num_witness": 0,
                            "num_committee": 0,
                            "votes": []
                        }
                    });
                    tr.set_required_fees().then(function () {
                        console.log("serialized transaction:", tr.serialize());
                        tr.broadcast();
                        resolve(tr.serialize());
                    });
                });
            });
        }
    }]);

    return Api;
}();

exports.Api = Api;
    });
    // END FILE

    // BEGIN FILE ./api/BitsharesApiExtends.js
    require.register("./api/BitsharesApiExtends.js", function (module, exports, require) {

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BitsharesApiExtends = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _bitsharesjsWs = require("bitsharesjs-ws");

var _bitsharesjs = require("bitsharesjs");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var object_type = _bitsharesjs.ChainTypes.object_type;

var op_history = parseInt(object_type.operation_history, 10);

var BitsharesApiExtends = function () {
    function BitsharesApiExtends() {
        _classCallCheck(this, BitsharesApiExtends);
    }

    _createClass(BitsharesApiExtends, null, [{
        key: "_fetchHistory",


        /**
         * @desc internal method for iterating through all operations history
         * @param account - id of the bitshares account
         * @param limit - results per butch (max 100)
         * @param opType - operation type id for filtering
         * @param stop - recent operation id
         * @param start - first operation id
         * @param operationsList - list of already fetched operations
         * @return list of operations like FetchRecentHistory from bitsharesjs
         * @private
         */
        value: function _fetchHistory(account) {
            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
            var opType = arguments[2];
            var stop = arguments[3];

            var _this = this;

            var start = arguments[4];
            var operationsList = arguments[5];

            if (typeof stop === 'undefined') stop = "1." + op_history + ".0";
            if (typeof start === 'undefined') start = "1." + op_history + ".0";

            return new Promise(function (resolve, reject) {
                _bitsharesjsWs.Apis.instance().history_api().exec("get_account_history", [account.get("id"), stop, limit, start]).then(function (operations) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var operation = _step.value;

                            if (operation.op[0] == opType || typeof opType == 'undefined') operationsList.push(operation);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    if (operations.length == limit) _this._fetchHistory(account, limit, opType, undefined, operations[0].id, operationsList).then(resolve, reject);else resolve(operationsList);
                });
            });
        }

        /**
         * @desc collect all history of the account
         * @param account - id of the bitshares account
         * @param limit - results per butch (max 100)
         * @param opTypeName - operation type for filtering
         * @param stop - recent operation id
         * @param start - first operation id
         * @return list of operations like FetchRecentHistory from bitsharesjs
         */

    }, {
        key: "fetchHistory",
        value: function fetchHistory(account) {
            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
            var opTypeName = arguments[2];
            var stop = arguments[3];
            var start = arguments[4];

            // console.log( "get account history: ", account )
            /// TODO: make sure we do not submit a query if there is already one
            /// in flight...
            var account_id = account;
            if (!_bitsharesjs.ChainValidation.is_object_id(account_id) && account.toJS) account_id = account.get("id");

            if (!_bitsharesjs.ChainValidation.is_object_id(account_id)) return;

            account = _bitsharesjs.ChainStore.objects_by_id.get(account_id);
            if (!account) return;

            var opTypeId = _bitsharesjs.ChainTypes.operations[opTypeName];
            if (typeof opTypeName != 'undefined' && opTypeId === undefined) throw new Error("unknown operation: " + opTypeName);

            return this._fetchHistory(account, limit, opTypeId, stop, start, []);
        }
    }]);

    return BitsharesApiExtends;
}();

exports.BitsharesApiExtends = BitsharesApiExtends;
    });
    // END FILE

    // BEGIN FILE ./api/BlockchainApi.js
    require.register("./api/BlockchainApi.js", function (module, exports, require) {

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BlockchainApi = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _bitsharesjs = require("bitsharesjs");

var _bitsharesjsWs = require("bitsharesjs-ws");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlockchainApi = function () {
    function BlockchainApi() {
        _classCallCheck(this, BlockchainApi);
    }

    _createClass(BlockchainApi, null, [{
        key: "init",
        value: function init(nodeUrl) {
            return new Promise(function (resolved, rejected) {
                _bitsharesjsWs.Apis.instance(nodeUrl, true).init_promise.then(function (res) {
                    Promise.all([new _bitsharesjs.TransactionBuilder().update_head_block(), _bitsharesjs.ChainStore.init()]).then(function () {
                        console.log("connected to:", res[0].network_name, "network");
                        resolved();
                    }).catch(rejected);
                }).catch(rejected);
            });
        }
    }]);

    return BlockchainApi;
}();

exports.BlockchainApi = BlockchainApi;
    });
    // END FILE

    // BEGIN FILE ./api/StudentApi.js
    require.register("./api/StudentApi.js", function (module, exports, require) {

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StudentApi = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _bitsharesjs = require('bitsharesjs');

var _BitsharesApiExtends = require('./BitsharesApiExtends');

var _Configs = require('../common/Configs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentApi = function () {
    function StudentApi(account) {
        _classCallCheck(this, StudentApi);

        this.account = account;
        this.feeAsset = 'BTS';
    }

    /**
     * @desc apply current user for the lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return serialized transaction
     */


    _createClass(StudentApi, [{
        key: 'applyForLecture',
        value: function applyForLecture(lectureAccount) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", _this.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolTokenTicket), (0, _bitsharesjs.FetchChain)("getAsset", _this.feeAsset)]).then(function (res) {
                    var _res = _slicedToArray(res, 4),
                        lectureAccount = _res[0],
                        studentAccount = _res[1],
                        sendAsset = _res[2],
                        feeAsset = _res[3];

                    var tr = new _bitsharesjs.TransactionBuilder();

                    tr.add_type_operation("transfer", {
                        fee: {
                            amount: 0,
                            asset_id: feeAsset.get("id")
                        },
                        from: lectureAccount.get("id"),
                        to: studentAccount.get("id"),
                        amount: { asset_id: sendAsset.get("id"), amount: 1 }
                    });

                    tr.propose({
                        fee_paying_account: studentAccount.get("id")
                    });

                    tr.set_required_fees().then(function () {
                        tr.add_signer(_this.account.privateKey, _this.account.privateKey.toPublicKey().toPublicKeyString());
                        tr.broadcast().catch(reject);
                        resolve(tr.serialize());
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc collect information about lecture
         * @param lectureAccount - name of the bitshares lecture account
         * @return return map of stats by tokens UTSchoolTokenTicket, UTSchoolTokenSession, UTSchoolTokenGrade
         * stat: {
         *      id - id of the token,
         *      symbol - name of the token
         *      accepted - use was accepted to lecture
         *      balance - balance of the particular token on the account
         * }
         */

    }, {
        key: 'getLectureStats',
        value: function getLectureStats(lectureAccount) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", _this2.account.name), (0, _bitsharesjs.FetchChain)("getAsset", [_Configs.utSchoolTokenTicket, _Configs.utSchoolTokenSession, _Configs.utSchoolTokenGrade])]).then(function (res) {
                    var _res2 = _slicedToArray(res, 3),
                        lectureAccount = _res2[0],
                        studentAccount = _res2[1],
                        assets = _res2[2];

                    var lectureAccountId = lectureAccount.get('id');
                    var studentAccountId = studentAccount.get('id');

                    var assetsMap = {};
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = assets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var asset = _step.value;

                            assetsMap[asset.get('id')] = {
                                'id': asset.get('id'),
                                'symbol': asset.get('symbol'),
                                'accepted': false,
                                'balance': _bitsharesjs.ChainStore.getAccountBalance(lectureAccount, asset.get('id'))
                            };
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    _BitsharesApiExtends.BitsharesApiExtends.fetchHistory(lectureAccountId, 100, 'transfer').then(function (operations) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = operations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var operation = _step2.value;

                                var transferData = operation.op[1];
                                if (transferData.from == lectureAccountId && transferData.to == studentAccountId && assetsMap[transferData.amount.asset_id]) {
                                    assetsMap[transferData.amount.asset_id].accepted = true;
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        resolve(assetsMap);
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc return all available lectures for current user
         * @return list of lectures
         * lecture: {
         *      id - id of the bitshares lecture account
         *      name - name of the bitshares lecture account
         *      teacher: {
         *          id - id of the bitshares teacher account
         *          name - id of the bitshares teacher account
         *      }
         *      stats - result from getLectureStats
         * }
         */

    }, {
        key: 'getLectures',
        value: function getLectures() {
            var _this3 = this;

            var lecturesList = [];
            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _Configs.utSchoolAccount), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolToken)]).then(function (res) {
                    var _res3 = _slicedToArray(res, 2),
                        utSchoolAccount = _res3[0],
                        utSchoolAsset = _res3[1];

                    utSchoolAccount = utSchoolAccount.get('id');
                    utSchoolAsset = utSchoolAsset.get('id');
                    _BitsharesApiExtends.BitsharesApiExtends.fetchHistory(utSchoolAccount, 100, 'transfer').then(function (operations) {
                        var lecturesAccountsList = [];
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = operations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var operation = _step3.value;

                                var transferData = operation.op[1];

                                if (transferData.from == utSchoolAccount && transferData.amount.asset_id == utSchoolAsset) {
                                    lecturesAccountsList.push(transferData.to);
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        if (lecturesAccountsList.length == 0) {
                            resolve(lecturesList);
                            return;
                        }

                        (0, _bitsharesjs.FetchChain)("getAccount", lecturesAccountsList).then(function (lectures) {
                            lectures = lectures.toJS();
                            var teachersIds = [];
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = lectures[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var lectureData = _step4.value;

                                    lecturesList.push({
                                        'id': lectureData.id,
                                        'name': lectureData.name,
                                        'teacher': {
                                            'id': lectureData.active.account_auths[0][0]
                                        }
                                    });

                                    teachersIds.push(lectureData.active.account_auths[0][0]);
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }

                            (0, _bitsharesjs.FetchChain)("getAccount", teachersIds).then(function (teachers) {
                                var teachersMap = {};
                                teachers = teachers.toJS();
                                var _iteratorNormalCompletion5 = true;
                                var _didIteratorError5 = false;
                                var _iteratorError5 = undefined;

                                try {
                                    for (var _iterator5 = teachers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                        var teacher = _step5.value;

                                        teachersMap[teacher.id] = teacher;
                                    }
                                } catch (err) {
                                    _didIteratorError5 = true;
                                    _iteratorError5 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                            _iterator5.return();
                                        }
                                    } finally {
                                        if (_didIteratorError5) {
                                            throw _iteratorError5;
                                        }
                                    }
                                }

                                var lectureStatePromiseList = [];
                                var _iteratorNormalCompletion6 = true;
                                var _didIteratorError6 = false;
                                var _iteratorError6 = undefined;

                                try {
                                    for (var _iterator6 = lecturesList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                        var lecture = _step6.value;

                                        lecture.teacher.name = teachersMap[lecture.teacher.id].name;
                                        lectureStatePromiseList.push(_this3.getLectureStats(lecture.name));
                                    }
                                } catch (err) {
                                    _didIteratorError6 = true;
                                    _iteratorError6 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                            _iterator6.return();
                                        }
                                    } finally {
                                        if (_didIteratorError6) {
                                            throw _iteratorError6;
                                        }
                                    }
                                }

                                Promise.all(lectureStatePromiseList).then(function (lecturesStates) {
                                    for (var i = 0; i < lecturesList.length; i++) {
                                        lecturesList[i].stats = lecturesStates[i];
                                    }resolve(lecturesList);
                                }).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        }
    }]);

    return StudentApi;
}();

exports.StudentApi = StudentApi;
    });
    // END FILE

    // BEGIN FILE ./api/TeacherApi.js
    require.register("./api/TeacherApi.js", function (module, exports, require) {

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TeacherApi = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _bitsharesjs = require('bitsharesjs');

var _BitsharesApiExtends = require('./BitsharesApiExtends');

var _Configs = require('../common/Configs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherApi = function () {
    function TeacherApi(account) {
        _classCallCheck(this, TeacherApi);

        this.account = account;
        this.feeAsset = 'BTS';
    }

    /**
     * @desc send education token from lecture account to particular student
     * @param lectureAccount - name of the bitshares lecture account
     * @param studentAccount - name of the bitshares student account
     * @param educationToken - name of the bitshares education token
     * @return serialized transaction
     */


    _createClass(TeacherApi, [{
        key: '_sendToken',
        value: function _sendToken(lectureAccount, studentAccount, educationToken) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", studentAccount), (0, _bitsharesjs.FetchChain)("getAsset", educationToken), (0, _bitsharesjs.FetchChain)("getAsset", _this.feeAsset)]).then(function (res) {
                    var _res = _slicedToArray(res, 4),
                        lectureAccount = _res[0],
                        studentAccount = _res[1],
                        sendAsset = _res[2],
                        feeAsset = _res[3];

                    var tr = new _bitsharesjs.TransactionBuilder();

                    tr.add_type_operation("transfer", {
                        fee: {
                            amount: 0,
                            asset_id: feeAsset.get("id")
                        },
                        from: lectureAccount.get("id"),
                        to: studentAccount.get("id"),
                        amount: { asset_id: sendAsset.get("id"), amount: 1 }
                    });

                    tr.set_required_fees().then(function () {
                        tr.add_signer(_this.account.privateKey, _this.account.privateKey.toPublicKey().toPublicKeyString());
                        tr.broadcast().catch(reject);
                        resolve(tr.serialize());
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc send session token from lecture account to particular student
         * @param lectureAccount - name of the bitshares lecture account
         * @param studentAccount - name of the bitshares student account
         * @return serialized transaction
         */

    }, {
        key: 'sendSessionToken',
        value: function sendSessionToken(lectureAccount, studentAccount) {
            return this._sendToken(lectureAccount, studentAccount, _Configs.utSchoolTokenSession);
        }

        /**
         * @desc send grade token from lecture account to particular student
         * @param lectureAccount - name of the bitshares lecture account
         * @param studentAccount - name of the bitshares student account
         * @return serialized transaction
         */

    }, {
        key: 'sendGradeToken',
        value: function sendGradeToken(lectureAccount, studentAccount) {
            return this._sendToken(lectureAccount, studentAccount, _Configs.utSchoolTokenGrade);
        }

        /**
         * @desc request teacher role for current bitshares account
         * @return serialized proposal transaction
         */

    }, {
        key: 'requestTeacherRole',
        value: function requestTeacherRole() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _Configs.utSchoolAccount), (0, _bitsharesjs.FetchChain)("getAccount", _this2.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolToken), (0, _bitsharesjs.FetchChain)("getAsset", _this2.feeAsset)]).then(function (res) {
                    var _res2 = _slicedToArray(res, 4),
                        utSchoolAccount = _res2[0],
                        teacherAccount = _res2[1],
                        sendAsset = _res2[2],
                        feeAsset = _res2[3];

                    var tr = new _bitsharesjs.TransactionBuilder();

                    tr.add_type_operation("transfer", {
                        fee: {
                            amount: 0,
                            asset_id: feeAsset.get("id")
                        },
                        from: utSchoolAccount.get("id"),
                        to: teacherAccount.get("id"),
                        amount: { asset_id: sendAsset.get("id"), amount: 1 }
                    });

                    tr.propose({
                        fee_paying_account: teacherAccount.get("id")
                    });

                    tr.set_required_fees().then(function () {
                        tr.add_signer(_this2.account.privateKey, _this2.account.privateKey.toPublicKey().toPublicKeyString());
                        tr.broadcast().catch(reject);
                        resolve(tr.serialize());
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc fetch from blockchain information about participants of the lecture
         * @param lectureAccount - name of the bitshares lecture account
         * @return list of participants
         * participant: {
         *      id,
         *      name
         * }
         */

    }, {
        key: 'getLectureParticipants',
        value: function getLectureParticipants(lectureAccount) {
            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolTokenTicket)]).then(function (res) {
                    var _res3 = _slicedToArray(res, 2),
                        lectureAccount = _res3[0],
                        ticketAsset = _res3[1];

                    lectureAccount = lectureAccount.get('id');
                    ticketAsset = ticketAsset.get('id');

                    _BitsharesApiExtends.BitsharesApiExtends.fetchHistory(lectureAccount, 100, 'transfer').then(function (operations) {
                        var lectureParticipantsIds = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var operation = _step.value;

                                var transferData = operation.op[1];
                                if (transferData.from == lectureAccount && transferData.amount.asset_id == ticketAsset) {
                                    lectureParticipantsIds.push(transferData.to);
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        (0, _bitsharesjs.FetchChain)('getAccount', lectureParticipantsIds).then(function (accounts) {
                            accounts = accounts.toJS();
                            var accountsMap = {};

                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var account = _step2.value;

                                    if (account) accountsMap[account.id] = account;
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }

                            var lectureParticipants = [];
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = lectureParticipantsIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var participant = _step3.value;

                                    var accountData = accountsMap[participant];
                                    lectureParticipants.push({
                                        'id': accountData.id,
                                        'name': accountData.name
                                    });
                                }
                            } catch (err) {
                                _didIteratorError3 = true;
                                _iteratorError3 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }
                                } finally {
                                    if (_didIteratorError3) {
                                        throw _iteratorError3;
                                    }
                                }
                            }

                            resolve(lectureParticipants);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc fetch from blockchain information about applications for the lecture
         * @param lectureAccount - name of the bitshares lecture account
         * @return list of applications
         * application: {
         *      id, - id of proposal
         *      account: { - information about student account requested application
         *          id,
         *          name
         *      }
         * }
         */

    }, {
        key: 'getLectureApplications',
        value: function getLectureApplications(lectureAccount) {
            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolTokenTicket)]).then(function (res) {
                    var _res4 = _slicedToArray(res, 2),
                        lectureAccount = _res4[0],
                        ticketAsset = _res4[1];

                    var lectureAccountId = lectureAccount.get('id');
                    ticketAsset = ticketAsset.get('id');

                    var proposals = lectureAccount.toJS().proposals;
                    if (proposals.length == 0) {
                        resolve([]);
                        return;
                    }

                    var applications = [];
                    (0, _bitsharesjs.FetchChain)("getObject", proposals).then(function (proposals) {
                        proposals = proposals.toJS();

                        var accountIds = [];
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = proposals[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var proposal = _step4.value;

                                if (Date.parse(proposal.proposed_transaction.expiration) < new Date() / 1000) continue;
                                var operations = proposal.proposed_transaction.operations;
                                var acceptedOperation = void 0;
                                var _iteratorNormalCompletion7 = true;
                                var _didIteratorError7 = false;
                                var _iteratorError7 = undefined;

                                try {
                                    for (var _iterator7 = operations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                        var operation = _step7.value;

                                        var operationData = operation[1];
                                        if (operationData.amount.asset_id == ticketAsset && operationData.from == lectureAccountId) {
                                            acceptedOperation = operationData;
                                            break;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError7 = true;
                                    _iteratorError7 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                            _iterator7.return();
                                        }
                                    } finally {
                                        if (_didIteratorError7) {
                                            throw _iteratorError7;
                                        }
                                    }
                                }

                                if (!acceptedOperation) continue;

                                accountIds.push(acceptedOperation.to);
                                applications.push({
                                    'id': proposal.id,
                                    'operation': acceptedOperation
                                });
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }

                        if (applications.length == 0) {
                            resolve([]);
                            return;
                        }
                        (0, _bitsharesjs.FetchChain)('getAccount', accountIds).then(function (accounts) {
                            accounts = accounts.toJS();
                            var accountsMap = {};

                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = accounts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var account = _step5.value;

                                    if (account) accountsMap[account.id] = account;
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            var _iteratorNormalCompletion6 = true;
                            var _didIteratorError6 = false;
                            var _iteratorError6 = undefined;

                            try {
                                for (var _iterator6 = applications[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    var application = _step6.value;

                                    var accountData = accountsMap[application.operation.to];
                                    delete application.operation;
                                    application.account = {
                                        'id': accountData.id,
                                        'name': accountData.name
                                    };
                                }
                            } catch (err) {
                                _didIteratorError6 = true;
                                _iteratorError6 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                        _iterator6.return();
                                    }
                                } finally {
                                    if (_didIteratorError6) {
                                        throw _iteratorError6;
                                    }
                                }
                            }

                            resolve(applications);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc accept proposal for application for the lecture
         * @param lectureApplicationId - id of the proposal for application for the lecture
         * @return serialized transaction
         */

    }, {
        key: 'acceptApplication',
        value: function acceptApplication(lectureApplicationId) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _this3.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _this3.feeAsset)]).then(function (res) {
                    var _res5 = _slicedToArray(res, 2),
                        teacherAccount = _res5[0],
                        feeAsset = _res5[1];

                    var tr = new _bitsharesjs.TransactionBuilder();
                    teacherAccount = teacherAccount.get('id');

                    tr.add_type_operation("proposal_update", {
                        fee: {
                            amount: 0,
                            asset_id: feeAsset.get("id")
                        },
                        fee_paying_account: teacherAccount,
                        proposal: lectureApplicationId,
                        active_approvals_to_add: [teacherAccount]
                    });

                    tr.set_required_fees().then(function () {
                        tr.add_signer(_this3.account.privateKey, _this3.account.privateKey.toPublicKey().toPublicKeyString());
                        tr.broadcast().catch(reject);
                        resolve(tr.serialize());
                    }).catch(reject);
                }).catch(reject);
            });
        }

        /**
         * @desc return statistics about particular lecture
         * @param lectureAccount - name of the bitshares lecture accout
         * @return pair of results from getLectureParticipants and getLectureApplications
         */

    }, {
        key: 'getLectureStats',
        value: function getLectureStats(lectureAccount) {
            return Promise.all([this.getLectureParticipants(lectureAccount), this.getLectureApplications(lectureAccount)]);
        }

        /**
         * @desc internal method for iterating through lectures and gathering stats
         * @param lectures - list of account objects fetched from blockchain with bitsharesjs
         * @param index - current index in list
         * @param onFinish - finish callback
         * @private
         */

    }, {
        key: '__processLectureQueue',
        value: function __processLectureQueue(lectures, index, onFinish) {
            var _this4 = this;

            if (index >= lectures.length) {
                onFinish(lectures);
                return;
            }
            this.getLectureStats(lectures[index].name).then(function (res) {
                var _res6 = _slicedToArray(res, 2),
                    participants = _res6[0],
                    applications = _res6[1];

                lectures[index].participants = participants;
                lectures[index].applications = applications;

                _this4.__processLectureQueue(lectures, index + 1, onFinish);
            });
        }

        /**
         * @desc collect all lectures of the current user
         * @return list of lectures
         * lecture: {
         *      id,
         *      name,
         *      participants - result of getLectureParticipants
         *      applications - result of getLectureApplications
         * }
         */

    }, {
        key: 'getLectures',
        value: function getLectures() {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _Configs.utSchoolAccount), (0, _bitsharesjs.FetchChain)("getAccount", _this5.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolToken)]).then(function (res) {
                    var _res7 = _slicedToArray(res, 3),
                        utSchoolAccount = _res7[0],
                        teacherAccount = _res7[1],
                        utSchoolAsset = _res7[2];

                    utSchoolAccount = utSchoolAccount.get('id');
                    teacherAccount = teacherAccount.get('id');
                    utSchoolAsset = utSchoolAsset.get('id');

                    _BitsharesApiExtends.BitsharesApiExtends.fetchHistory(utSchoolAccount, 100, 'transfer').then(function (operations) {
                        var lecturesIdsList = [];
                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = operations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var operation = _step8.value;

                                var transferData = operation.op[1];
                                if (transferData.from == utSchoolAccount && transferData.amount.asset_id == utSchoolAsset) lecturesIdsList.push(transferData.to);
                            }
                        } catch (err) {
                            _didIteratorError8 = true;
                            _iteratorError8 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                    _iterator8.return();
                                }
                            } finally {
                                if (_didIteratorError8) {
                                    throw _iteratorError8;
                                }
                            }
                        }

                        if (lecturesIdsList.length == 0) {
                            resolve([]);
                            return;
                        }

                        (0, _bitsharesjs.FetchChain)("getAccount", lecturesIdsList).then(function (lectures) {
                            lectures = lectures.toJS();

                            var teachersLecturesList = [];

                            var _iteratorNormalCompletion9 = true;
                            var _didIteratorError9 = false;
                            var _iteratorError9 = undefined;

                            try {
                                for (var _iterator9 = lectures[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                    var lecture = _step9.value;

                                    var currentTeacherId = lecture.active.account_auths[0][0];
                                    if (currentTeacherId == teacherAccount) {
                                        teachersLecturesList.push({
                                            'id': lecture.id,
                                            'name': lecture.name
                                        });
                                    }
                                }
                            } catch (err) {
                                _didIteratorError9 = true;
                                _iteratorError9 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                        _iterator9.return();
                                    }
                                } finally {
                                    if (_didIteratorError9) {
                                        throw _iteratorError9;
                                    }
                                }
                            }

                            if (teachersLecturesList.length == 0) {
                                resolve([]);
                                return;
                            }

                            _this5.__processLectureQueue(teachersLecturesList, 0, resolve);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        }
    }]);

    return TeacherApi;
}();

exports.TeacherApi = TeacherApi;
    });
    // END FILE

    // BEGIN FILE ./common/Account.js
    require.register("./common/Account.js", function (module, exports, require) {

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Account = undefined;

var _bitsharesjs = require("bitsharesjs");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by superpchelka on 23.02.18.
                                                                                                                                                           */

var Account = function Account(account, privateKey) {
    _classCallCheck(this, Account);

    this.name = account;
    this.privateKey = privateKey ? _bitsharesjs.PrivateKey.fromWif(privateKey) : '';
};

exports.Account = Account;
    });
    // END FILE

    // BEGIN FILE ./common/Configs.js
    require.register("./common/Configs.js", function (module, exports, require) {

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by superpchelka on 23.02.18.
 */

var utSchoolToken = 'UTSCHOOL';
var utSchoolTokenTicket = utSchoolToken + '.TICKET';
var utSchoolTokenSession = utSchoolToken + '.SESSION';
var utSchoolTokenGrade = utSchoolToken + '.GRADE';

var utSchoolAccount = 'ut-school';
var utSchoolFaucet = 'u-tech-faucet';

exports.utSchoolToken = utSchoolToken;
exports.utSchoolTokenTicket = utSchoolTokenTicket;
exports.utSchoolTokenSession = utSchoolTokenSession;
exports.utSchoolTokenGrade = utSchoolTokenGrade;
exports.utSchoolAccount = utSchoolAccount;
exports.utSchoolFaucet = utSchoolFaucet;
    });
    // END FILE

    //// END OF ORIGINAL SOURCE
    this_module.exports = require("./main.js");
} (require, module));
