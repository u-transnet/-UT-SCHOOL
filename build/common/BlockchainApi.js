"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = exports.BlockchainApi = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _bitsharesjs = require("bitsharesjs");

var _bitsharesjsWs = require("bitsharesjs-ws");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function command(target, key, descriptor) {
    var original = descriptor.value;
    if (typeof original === 'function') descriptor.value = function () {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        BlockchainApi.runCommand(function () {
            original.apply(_this, args);
        });
    };
    return descriptor;
}

var BlockchainApi = function () {
    function BlockchainApi() {
        _classCallCheck(this, BlockchainApi);
    }

    _createClass(BlockchainApi, null, [{
        key: "init",
        value: function init(nodeUrl) {
            if (BlockchainApi.inited) return;

            BlockchainApi.inited = true;
            BlockchainApi.pendingApiCalls = [];

            _bitsharesjsWs.Apis.instance(nodeUrl, true).init_promise.then(function (res) {
                console.log("connected to:", res[0].network_name, "network");
                BlockchainApi.apiInitialized = true;

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = BlockchainApi.pendingApiCalls[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var apiCall = _step.value;

                        apiCall();
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

                BlockchainApi.pendingApiCalls = [];
            }, function (error) {
                console.log(error);
            });
        }
    }, {
        key: "runCommand",
        value: function runCommand(callback) {
            if (!BlockchainApi.apiInitialized) {
                BlockchainApi.pendingApiCalls.push(callback);
                return;
            }
            _bitsharesjs.ChainStore.init().then(function () {
                callback();
            }, function (error) {
                console.log(error);
            });
        }
    }]);

    return BlockchainApi;
}();

exports.BlockchainApi = BlockchainApi;
exports.command = command;