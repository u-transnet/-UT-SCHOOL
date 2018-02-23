"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Api = undefined;

var _Account = require("./Account");

var _StudentApi = require("../student/StudentApi");

var _BlockchainApi = require("./BlockchainApi");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by superpchelka on 23.02.18.
                                                                                                                                                           */

var Api = function Api(nodeUrl, accountName, privateKey) {
    _classCallCheck(this, Api);

    this.account = new _Account.Account(accountName, privateKey);

    _BlockchainApi.BlockchainApi.init(nodeUrl);
    this.studentApi = new _StudentApi.StudentApi(this.account);
};

exports.Api = Api;