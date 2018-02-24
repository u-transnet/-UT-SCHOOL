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