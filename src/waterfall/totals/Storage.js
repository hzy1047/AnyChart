goog.provide('anychart.waterfallModule.totals.Storage');

goog.require('anychart.core.VisualBase');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.waterfallModule.totals.Series');
goog.require('anychart.waterfallModule.totals.Total');


/**
 * Class that creates, removes and store created totals.
 *
 * @param {!anychart.waterfallModule.Chart} chart - Instance of watefall chart.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.waterfallModule.totals.Storage = function(chart) {
  anychart.waterfallModule.totals.Storage.base(this, 'constructor');

  /**
   * Instance of watefall chart.
   *
   * @private
   */
  this.chart_ = chart;

  /**
   * Array with created totals.
   *
   * @type {Array.<anychart.waterfallModule.totals.Total>}
   * @private
   */
  this.totals_ = [];
};
goog.inherits(anychart.waterfallModule.totals.Storage, anychart.core.VisualBase);

/**
 * Supported signals.
 * @type {anychart.Signal|number}
 */
anychart.waterfallModule.totals.Storage.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW_APPEARANCE;

/**
 * States that totals storage supports.
 *
 * @enum {string}
 */
anychart.waterfallModule.totals.Storage.SUPPORTED_STATES = {
  APPEARANCE: 'appearance',
  VALUES: 'values'
};

anychart.waterfallModule.totals.Storage.CONSISTENCY_STORAGE_NAME = 'waterfallTotalsStorage';

anychart.consistency.supportStates(
  anychart.waterfallModule.totals.Storage,
  anychart.waterfallModule.totals.Storage.CONSISTENCY_STORAGE_NAME,
  [
    anychart.waterfallModule.totals.Storage.SUPPORTED_STATES.TOTALS
  ]
);


anychart.waterfallModule.totals.Storage.prototype.populateByTotals = function(data) {
  var rv = goog.array.clone(data);
  var visibleTotals = goog.array.filter(this.totals_, function(total) {
    return goog.array.contains(rv, total.getOption('x'));
  });

  goog.array.forEach(visibleTotals, function(total) {
    var index = goog.array.findIndex(rv, function(xValue) {
      return xValue === total.getOption('x');
    });
    var categories = total.getResolverCategories();
    goog.array.insertArrayAt(rv, categories, index + 1);
  });

  return rv;
};


anychart.waterfallModule.totals.Storage.prototype.getTotalBounds = function(total) {
  var xScale = this.chart_.xScale();

  var parentBounds = this.parentBounds();

  var totalX = total.getTotalX();
  var totalXRatio = xScale.transform(totalX);

  var left = totalXRatio * parentBounds.width + parentBounds.left;
  var top = parentBounds.top;
  var width = xScale.getPointWidthRatio() * parentBounds.width;
  var height = parentBounds.height;

  return anychart.math.rect(left, top, width, height);
};

anychart.waterfallModule.totals.Storage.prototype.getDrawingData = function(total) {
  var yScale = this.chart_.yScale();

  var value = yScale.transform(total.value());
  var zero = yScale.transform(0);

  return {
    zero: 1 - zero,
    value: 1 - value
  };
};

anychart.waterfallModule.totals.Storage.prototype.setupTotalTooltip = function(total) {
  var tooltip = total.tooltip();

  tooltip.chart(this.chart_);
  tooltip.parent(this.chart_.tooltip());
};

anychart.waterfallModule.totals.Storage.prototype.draw = function() {
  if (!this.layer_) {
    this.layer_ = this.container().layer().zIndex(40);

    console.log(this.layer_);
  }

  goog.array.forEach(this.totals_, function(total) {
    this.setupTotalTooltip(total);
  }, this);


  goog.array.forEach(this.totals_, function(total) {
    var totalValue = this.chart_.getTotalValue(total.getTotalX());
    total.value(totalValue);
  }, this);

  goog.array.forEach(this.totals_, function(total) {
    total.bounds(this.getTotalBounds(total));
    total.drawingData(this.getDrawingData(total));
  }, this);

  goog.array.forEach(this.totals_, function(total) {
    total.container(this.layer_);

    total.draw();
  }, this);
};


anychart.waterfallModule.totals.Storage.prototype.totalInvalidated = function() {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
};

/**
 * Create, setup and return instance of total.
 * @param {anychart.waterfallModule.totals.Total.Config} config - Configuration object for total.
 *
 * @return {anychart.waterfallModule.totals.Total}
 */
anychart.waterfallModule.totals.Storage.prototype.createTotal = function(config) {
  var total = new anychart.waterfallModule.totals.Total();
  total.suspendSignalsDispatching();
  total.setup(config);
  total.listenSignals(this.totalInvalidated, this);
  total.resumeSignalsDispatching(false);

  return total;
};


//region --- Public API
/**
 * Create instance of Total class, setup it by passed config and return it.
 *
 * @param {anychart.waterfallModule.totals.Total.Config} totalConfig - Configuration object for total.
 *
 * @return {anychart.waterfallModule.totals.Total} - Total instance.
 */
anychart.waterfallModule.totals.Storage.prototype.addTotal = function(totalConfig) {
  var total = this.createTotal(totalConfig);

  this.totals_.push(total);

  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);

  return total;
};


/**
 * Remove total instance.
 *
 * @param {anychart.waterfallModule.totals.Total} totalToRemove - Instance of total to remove.
 */
anychart.waterfallModule.totals.Storage.prototype.removeTotal = function(totalToRemove) {
  var indexOfTotalToRemove = goog.array.findIndex(this.totals_, function(currentTotal) {
    return currentTotal == totalToRemove;
  });

  return this.removeTotalAt(indexOfTotalToRemove);
};


/**
 * Remove total by index.
 *
 * @param {number} indexToRemove - Index of total to remove.
 */
anychart.waterfallModule.totals.Storage.prototype.removeTotalAt = function(indexToRemove) {
  goog.array.slice(this.totals_, indexToRemove, 1);

  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
};


/**
 * Return total by index.
 *
 * @param {number} index - Index of total.
 * @return {anychart.waterfallModule.totals.Total} - Total instance or null if has no total.
 */
anychart.waterfallModule.totals.Storage.prototype.getTotalAt = function(index) {
  return this.totals_[index] || null;
};


/**
 * Return array of totals.
 *
 * @return {Array.<anychart.waterfallModule.totals.Total>} - Array of all totals.
 */
anychart.waterfallModule.totals.Storage.prototype.getAllTotals = function() {
  return goog.array.clone(this.totals_);
};


// endregion
anychart.waterfallModule.totals.Storage.prototype.getLegendItem = function() {
  var resolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
  var fill = resolver(this.series_, anychart.PointState.NORMAL, true, true);
  return {
    'text': 'Total',
    'categoryType': 'total',
    'iconEnabled': true,
    'iconFill': /** @type {acgraph.vector.Fill} */ (fill),
    'sourceUid': goog.getUid(this),
    'sourceKey': 'totalStorage'
  };
};


// region --- Serialize/Deserialize
/** @inheritDoc */
anychart.waterfallModule.totals.Storage.prototype.serialize = function() {
  var json = anychart.waterfallModule.totals.Storage.base(this, 'serialize');

  json['items'] = goog.array.map(this.totals_, function(total) {
    return total.serialize();
  });

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Storage.setupByJSON = function(json, opt_default) {
  var items = json['items'];
  goog.array.forEach(items, function(config) {
    this.addTotal(config);
  }, this);
};
//endregion
