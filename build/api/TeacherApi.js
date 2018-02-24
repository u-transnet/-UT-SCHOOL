'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TeacherApi = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; /**
                            * Created by superpchelka on 23.02.18.
                            */


var _bitsharesjs = require('bitsharesjs');

var _BlockchainApi = require('./BlockchainApi');

var _BitsharesApiExtends = require('./BitsharesApiExtends');

var _Configs = require('../common/Configs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var TeacherApi = (_class = function () {
    function TeacherApi(account) {
        _classCallCheck(this, TeacherApi);

        this.account = account;
        this.feeAsset = 'bts';
    }

    _createClass(TeacherApi, [{
        key: '_sendToken',
        value: function _sendToken(lectureAccount, studentAccount, token) {
            var _this = this;

            return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", studentAccount), (0, _bitsharesjs.FetchChain)("getAsset", token), (0, _bitsharesjs.FetchChain)("getAsset", this.feeAsset)]).then(function (res) {
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
                    console.log("serialized transaction:", tr.serialize());
                    tr.broadcast();
                });
            });
        }
    }, {
        key: 'sendSessionToken',
        value: function sendSessionToken(lectureAccount, studentAccount) {
            return this._sendToken(lectureAccount, studentAccount, _Configs.utSchoolTokenSession);
        }
    }, {
        key: 'sendGradeToken',
        value: function sendGradeToken(lectureAccount, studentAccount) {
            return this._sendToken(lectureAccount, studentAccount, _Configs.utSchoolTokenGrade);
        }
    }, {
        key: 'requestTeacherRole',
        value: function requestTeacherRole() {
            var _this2 = this;

            return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", _Configs.utSchoolAccount), (0, _bitsharesjs.FetchChain)("getAccount", this.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Configs.utSchoolToken), (0, _bitsharesjs.FetchChain)("getAsset", this.feeAsset)]).then(function (res) {
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
                    amount: { asset_id: sendAsset.get("id"), amount: 0.00001 }
                });

                tr.propose({
                    fee_paying_account: teacherAccount.get("id")
                });

                tr.set_required_fees().then(function () {
                    tr.add_signer(_this2.account.privateKey, _this2.account.privateKey.toPublicKey().toPublicKeyString());
                    console.log("serialized transaction:", tr.serialize());
                    tr.broadcast();
                });
            });
        }
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
                        var studentApplications = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var operation = _step.value;

                                var transferData = operation.op[1];
                                if (transferData.from == lectureAccount && transferData.amount.asset_id == ticketAsset) {
                                    studentApplications.push(transferData.to);
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

                        resolve(studentApplications);
                    });
                });
            });
        }
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
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = proposals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var proposal = _step2.value;

                                var operations = proposal.proposed_transaction.operations;
                                var acceptedOperation = void 0;
                                var _iteratorNormalCompletion5 = true;
                                var _didIteratorError5 = false;
                                var _iteratorError5 = undefined;

                                try {
                                    for (var _iterator5 = operations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                        var operation = _step5.value;

                                        var operationData = operation[1];
                                        if (operationData.amount.asset_id == ticketAsset && operationData.from == lectureAccountId) {
                                            acceptedOperation = operationData;
                                            break;
                                        }
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

                                if (!acceptedOperation) continue;

                                accountIds.push(acceptedOperation.to);
                                applications.push({
                                    'id': proposal.id,
                                    'operation': acceptedOperation
                                });
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

                        if (applications.length == 0) {
                            resolve([]);
                            return;
                        }
                        (0, _bitsharesjs.FetchChain)('getAccount', accountIds).then(function (accounts) {
                            accounts = accounts.toJS();
                            var accountsMap = {};

                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = accounts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var account = _step3.value;

                                    if (account) accountsMap[account.id] = account;
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

                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = applications[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var application = _step4.value;

                                    var accountData = accountsMap[application.operation.to];
                                    delete application.operation;
                                    application.account = {
                                        'id': accountData.id,
                                        'name': accountData.name
                                    };
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

                            resolve(applications);
                        });
                    });
                });
            });
        }
    }, {
        key: 'acceptApplication',
        value: function acceptApplication(lectureApplicationId) {
            var _this3 = this;

            return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", this.account.name), (0, _bitsharesjs.FetchChain)("getAsset", this.feeAsset)]).then(function (res) {
                var _res5 = _slicedToArray(res, 2),
                    teacherAccount = _res5[0],
                    feeAsset = _res5[1];

                var tr = new _bitsharesjs.TransactionBuilder();

                tr.add_type_operation("proposal_update_operation", {
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
                    console.log("serialized transaction:", tr.serialize());
                    tr.broadcast();
                });
            });
        }
    }, {
        key: 'getLectureStats',
        value: function getLectureStats(lectureAccount) {
            return Promise.all([this.getLectureParticipants(lectureAccount), this.getLectureApplications(lectureAccount)]);
        }
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
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = operations[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var operation = _step6.value;

                                var transferData = operation.op[1];
                                if (transferData.from == utSchoolAccount && transferData.amount.asset_id == utSchoolAsset) lecturesIdsList.push(transferData.to);
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

                        if (lecturesIdsList.length == 0) {
                            resolve([]);
                            return;
                        }

                        (0, _bitsharesjs.FetchChain)("getAccount", lecturesIdsList).then(function (lectures) {
                            lectures = lectures.toJS();

                            var teachersLecturesList = [];

                            var _iteratorNormalCompletion7 = true;
                            var _didIteratorError7 = false;
                            var _iteratorError7 = undefined;

                            try {
                                for (var _iterator7 = lectures[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    var lecture = _step7.value;

                                    var currentTeacherId = lecture.active.account_auths[0][0];
                                    if (currentTeacherId == teacherAccount) {
                                        teachersLecturesList.push({
                                            'id': lecture.id,
                                            'name': lecture.name
                                        });
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

                            if (teachersLecturesList.length == 0) {
                                resolve([]);
                                return;
                            }

                            _this5.__processLectureQueue(teachersLecturesList, 0, resolve);
                        });
                    });
                });
            });
        }
    }]);

    return TeacherApi;
}(), (_applyDecoratedDescriptor(_class.prototype, '_sendToken', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, '_sendToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'requestTeacherRole', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'requestTeacherRole'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectureParticipants', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectureParticipants'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectureApplications', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectureApplications'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'acceptApplication', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'acceptApplication'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectureStats', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectureStats'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectures', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectures'), _class.prototype)), _class);
exports.TeacherApi = TeacherApi;