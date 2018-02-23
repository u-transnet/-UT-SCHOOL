'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _class, _temp, _class2, _temp2, _class3, _temp3, _class4, _temp4;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by superpchelka on 23.02.18.
 */

var UTSchool = (_temp = _class = function UTSchool() {
    _classCallCheck(this, UTSchool);
}, _class.tokenName = 'UTSCHOOL', _temp);
var UTSchoolTicket = (_temp2 = _class2 = function UTSchoolTicket() {
    _classCallCheck(this, UTSchoolTicket);
}, _class2.tokenName = UTSchool.tokenName + '.TICKET', _temp2);
var UTSchoolAppreciate = (_temp3 = _class3 = function UTSchoolAppreciate() {
    _classCallCheck(this, UTSchoolAppreciate);
}, _class3.tokenName = UTSchool.name + '.APPRECIATE', _temp3);
var UTSchoolGraduate = (_temp4 = _class4 = function UTSchoolGraduate() {
    _classCallCheck(this, UTSchoolGraduate);
}, _class4.tokenName = UTSchool.name + '.GRADUATE', _temp4);
exports.UTSchool = UTSchool;
exports.UTSchoolTicket = UTSchoolTicket;
exports.UTSchoolAppreciate = UTSchoolAppreciate;
exports.UTSchoolGraduate = UTSchoolGraduate;