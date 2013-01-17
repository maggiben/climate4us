///////////////////////////////////////////////////////////////////////////////
;(function($) {
    "use strict";

  var dauge = function (method) {
      if (methods[method]) {
          return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || !method) {
          return methods.init.apply(this, arguments);
      } else {
          $.error('Method ' + method + ' does not exists.');
      }
  };
  /*
  var that = this;
  var range = undefined;
  var r = undefined;
  var pointerHeadLength = undefined;
  var value = 0;

  var svg = undefined;
  var arc = undefined;
  var scale = undefined;
  var ticks = undefined;
  var tickData = undefined;
  var pointer = undefined;

  var donut = d3.layout.pie();

  var defaults = {
    size: 200,
    clipWidth: 200,
    clipHeight: 110,
    ringInset: 20,
    ringWidth: 20,

    pointerWidth: 10,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.9,

    minValue: 0,
    maxValue: 10,

    minAngle: -90,
    maxAngle: 90,

    transitionMs: 750,

    majorTicks: 10,
    labelFormat: d3.format(',g'),
    labelInset: 10,

    arcColorFn: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#Fe6c0a'))
  };

  var methods = {}

    //Public methods 
  methods.init = function(options)
  {
    var options = $.extend({}, that.defaults, options);

    svg = d3.select(options.container);

    that.range = options.maxAngle - options.minAngle;
    r = options.size / 2;
    that.pointerHeadLength = Math.round(r * options.pointerHeadLengthPercent);

    // a linear scale that maps domain values to a percent from 0..1
    that.scale = d3.scale.linear()
      .range([0, 1])
      .domain([options.minValue, options.maxValue]);

    that.ticks = scale.ticks(options.majorTicks);
    that.tickData = d3.range(options.majorTicks).map(function () {
      return 1 / options.majorTicks;
    });

    arc = makeArc(options);
  };

  function makeArc(options)
  {
    return d3.svg.arc()
        .innerRadius(r - options.ringWidth - options.ringInset)
        .outerRadius(r - options.ringInset)
        .startAngle(function (d, i) {
          var ratio = d * i;
          return deg2rad(options.minAngle + (ratio * range));
        })
        .endAngle(function (d, i) {
          var ratio = d * (i + 1);
          return deg2rad(options.minAngle + (ratio * range));
        });
  };
  */
  dauge = dauge || {};

  ///////////////////////////////////////////////////////////////////////////
  // Use CommonJS if applicable                                            //
  ///////////////////////////////////////////////////////////////////////////
  console.log("using commons")
  if (typeof require !== 'undefined') {
  } else {
      window.dauge = dauge;
  }
  if (typeof document !== 'undefined') {
      if (dauge.$) {
          dauge.$(function () {
              dauge.domready();
          });
      } else {
          document.addEventListener('DOMContentLoaded', function () {
              dauge.domready();
          }, true);
      }
  }
})(window.jQuery || window.Zepto);

$(document).ready(function () {
  var powerGauge = gauge('#power-gauge', {
    size: 300,
    clipWidth: 300,
    clipHeight: 300,
    ringWidth: 60,
    maxValue: 10,
    transitionMs: 4000,
  });
  powerGauge.render();

  function updateReadings() {
    // just pump in random data here...
    powerGauge.update(Math.random() * 10);
  }

  // every few seconds update reading values
  updateReadings();
  setInterval(function () {
    updateReadings();
  }, 5 * 1000);

});