'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StudentApi = undefined;

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

var StudentApi = (_class = function () {
    function StudentApi(account) {
        _classCallCheck(this, StudentApi);

        this.account = account;
        this.feeAsset = 'BTS';
    }

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
    }, {
        key: 'getLectureState',
        value: function getLectureState(lectureAccount) {
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
                                'received': false,
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
                                    assetsMap[transferData.amount.asset_id].received = true;
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
                                        lectureStatePromiseList.push(_this3.getLectureState(lecture.name));
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
                                        lecturesList[i].states = lecturesStates[i];
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
}(), (_applyDecoratedDescriptor(_class.prototype, 'applyForLecture', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'applyForLecture'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectureState', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectureState'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectures', [_BlockchainApi.apiCall], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectures'), _class.prototype)), _class);
exports.StudentApi = StudentApi;