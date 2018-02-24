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