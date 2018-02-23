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

var _BlockchainApi = require('../common/BlockchainApi');

var _BitsharesApiExtends = require('../common/BitsharesApiExtends');

var _Tokens = require('../common/Tokens');

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
        this.feeAsset = 'bts';
    }

    _createClass(StudentApi, [{
        key: 'applyForLecture',
        value: function applyForLecture(lectureAccount) {
            var _this = this;

            return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", this.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Tokens.UTSchoolTicket.name), (0, _bitsharesjs.FetchChain)("getAsset", this.feeAsset)]).then(function (res) {
                var _res = _slicedToArray(res, 4),
                    teacherAccount = _res[0],
                    studentAccount = _res[1],
                    sendAsset = _res[2],
                    feeAsset = _res[3];

                var tr = new _bitsharesjs.TransactionBuilder();

                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    from: teacherAccount.get("id"),
                    to: studentAccount.get("id"),
                    amount: { asset_id: sendAsset.get("id"), amount: 1 }
                });

                tr.propose({
                    fee_paying_account: studentAccount.get("id")
                });

                tr.set_required_fees().then(function () {
                    tr.add_signer(_this.account.privateKey, _this.account.privateKey.toPublicKey().toPublicKeyString());
                    console.log("serialized transaction:", tr.serialize());
                    tr.broadcast();
                });
            });
        }
    }, {
        key: 'getLectureTicketStatus',
        value: function getLectureApplicationStatus(lectureAccount) {
            return Promise.all([(0, _bitsharesjs.FetchChain)("getAccount", lectureAccount), (0, _bitsharesjs.FetchChain)("getAccount", this.account.name), (0, _bitsharesjs.FetchChain)("getAsset", _Tokens.UTSchoolTicket.tokenName)]).then(function (res) {
                var _res2 = _slicedToArray(res, 3),
                    lectureAccount = _res2[0],
                    studentAccount = _res2[1],
                    sendAsset = _res2[2];

                _BitsharesApiExtends.BitsharesApiExtends.fetchHistory(lectureAccount, 100, 'transfer').then(function (operations) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var operation = _step.value;

                            console.log(operation.op[1]);
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

                    console.log('\n                        Lecture: ' + lectureAccount.get('id') + ',\n                        Account: ' + studentAccount.get('id') + ',\n                        Asset: ' + sendAsset.get('id') + '\n                    ');
                });
            });
        }
    }]);

    return StudentApi;
}(), (_applyDecoratedDescriptor(_class.prototype, 'applyForLecture', [_BlockchainApi.command], Object.getOwnPropertyDescriptor(_class.prototype, 'applyForLecture'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLectureTicketStatus', [_BlockchainApi.command], Object.getOwnPropertyDescriptor(_class.prototype, 'getLectureTicketStatus'), _class.prototype)), _class);
exports.StudentApi = StudentApi;