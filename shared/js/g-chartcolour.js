(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.gChartcolour = global.gChartcolour || {})));
}(this, function (exports) { 'use strict';

  var backgrounds = {
  	web:'#FFF1e0',
  	social:'#333',
  	video:'#335',
  	print:'#FEE',
  	clean:'#FFF',
  };

  var basic = ['#00000080','#045787'];

  var categorical = [
  	'#045787',
  	'#00a9b8',
  	'#0090ff',
  	'#ed588d',
  	'#94ddff',
  	'#ed588d',
  	'#fab316',
  	'#d5ccbf'
  ];

  var diverging = [
  	'#5F3C41',
  	'#805F70',
  	'#9389A2',
  	'#9AB8CE',
  	'#9EEAEC',
  	'#63412D',
  	'#7A6A3A',
  	'#81975E',
  	'#80C49E',
  	'#9EEAEC'
  ];

  var sequentialMulti = [
    	'#F78874',
    	'#D87584',
    	'#AB6B8C',
    	'#776486',
    	'#465A72',
    	'#1F4C56'
  ];

  var sequentialSingle = [
  	'#5A0105',
  	'#851F1A',
  	'#AB4333',
  	'#C96A54',
  	'#DC977C',
  	'#E0C7AC'
  ];

  var sequentialSingle__teal = [
  	'#B1F2F2',
  	'#91D5D7',
  	'#73B8BC',
  	'#589BA1',
  	'#3F7F86',
  	'#29646B',
  	'#164A50'
  ];

  var categoricalUkPolitics = {
  	conservative:'#6fa7da',
  	labour:'#e45151',
  	'liberal democrats':'#f2a432',
  	ukip:'#c16fad',
  	green:'#65a68c',
  	independent:'#cdc6b9',
  	other:'#aea9a2',
  };

  exports.background = backgrounds;
  exports.basic = basic;
  exports.categorical = categorical;
  exports.diverging = diverging;
  exports.sequentialMulti = sequentialMulti;
  exports.sequentialSingle = sequentialSingle;
  exports.sequentialSingle_teal = sequentialSingle__teal;
  exports.ukPoliticalParties = categoricalUkPolitics;

  Object.defineProperty(exports, '__esModule', { value: true });

}));