"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Api = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by superpchelka on 23.02.18.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _Account = require("../common/Account");

var _StudentApi = require("./StudentApi");

var _TeacherApi = require("./TeacherApi");

var _BlockchainApi = require("./BlockchainApi");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Api = function () {
    function Api() {
        _classCallCheck(this, Api);
    }

    _createClass(Api, null, [{
        key: "init",
        value: function init(nodeUrl, accountName, privateKey) {
            var _this = this;

            this.account = new _Account.Account(accountName, privateKey);

            this.studentApi = new _StudentApi.StudentApi(this.account);
            this.teacherApi = new _TeacherApi.TeacherApi(this.account);

            return new Promise(function (resolved, rejected) {
                _BlockchainApi.BlockchainApi.init(nodeUrl).then(function () {
                    resolved(_this);
                });
            });
        }
    }]);

    return Api;
}();

exports.Api = Api;