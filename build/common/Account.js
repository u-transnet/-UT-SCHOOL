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