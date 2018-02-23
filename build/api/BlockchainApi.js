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

        return BlockchainApi.runCommand().then(function () {
            return original.apply(_this, args);
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
            return new Promise(function (resolved, rejected) {
                _bitsharesjsWs.Apis.instance(nodeUrl, true).init_promise.then(function (res) {
                    console.log("connected to:", res[0].network_name, "network");
                    resolved();
                });
            });
        }
    }, {
        key: "runCommand",
        value: function runCommand() {
            return _bitsharesjs.ChainStore.init();
        }
    }]);

    return BlockchainApi;
}();

exports.BlockchainApi = BlockchainApi;
exports.command = command;