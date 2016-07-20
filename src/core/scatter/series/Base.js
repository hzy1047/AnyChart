goog.provide('anychart.core.scatter.series.Base');
goog.require('acgraph');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.utils');


/**
 * Namespace anychart.core.scatter
 * @namespace
 * @name anychart.core.scatter
 */



/**
 * Base class for all scatter series.<br/>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 * @implements {anychart.core.utils.ISeriesWithError}
 */
anychart.core.scatter.series.Base = function(opt_data, opt_csvSettings) {
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * Error paths dictionary by stroke object hash.
   * @type {Object.<string, !acgraph.vector.Path>}
   * @private
   */
  this.errorPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsPool_ = null;
};
goog.inherits(anychart.core.scatter.series.Base, anychart.core.SeriesBase);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.scatter.series.Base.SeriesTypesMap = {};


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.core.scatter.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 * @param {number|string} minSize
 * @param {number|string} maxSize
 */
anychart.core.scatter.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.pixelBoundsCache;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.scatter.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.scatter.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Error path z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_ERROR_PATH = 3;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.core.scatter.series.Base.prototype.clip_ = false;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.rootLayer;


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.scatter.series.Base.prototype.axesLinesSpace_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.pointDrawn = false;


/**
 * @type {anychart.scales.ScatterBase}
 * @private
 */
anychart.core.scatter.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.ScatterBase}
 * @private
 */
anychart.core.scatter.series.Base.prototype.xScale_ = null;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.zeroY = 0;


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series mapping.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.scatter.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.scatter.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose);
      this.dataInternal = this.parentView.derive();
      this.dataInternal.listenSignals(this.onDataSignal_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dataInternal;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.scatter.series.Base.prototype.onDataSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are 'x', 'value'.
 * If there are several values return array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<number>|null} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.scatter.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.ScatterBase} */(this.yScale());
  var xScale = /** @type {anychart.scales.ScatterBase} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;

  var valX = iterator.get('x');
  var valY = iterator.get('value');

  if (!goog.isDef(valX) || !goog.isDef(valY)) {
    return null;
  }

  var pixX = xScale.isMissing(valX) ? NaN : this.applyRatioToBounds(xScale.transform(valX), true);
  if (yScale.isMissing(valY))
    valY = NaN;
  var pixY = this.applyRatioToBounds(yScale.transform(valY), false);

  if (isNaN(pixX) || isNaN(pixY)) fail = true;

  res.push(pixX, pixY);

  return fail ? null : res;
};


/**
 * Transforms x to pix coords.
 * @param {*} xValue X value.
 * @return {number} Pix value.
 */
anychart.core.scatter.series.Base.prototype.transformX = function(xValue) {
  return this.applyRatioToBounds(this.xScale().transform(xValue), true);
};


/**
 * Transforms y to pix coords.
 * @param {*} yValue Y value.
 * @return {number} Pix value.
 */
anychart.core.scatter.series.Base.prototype.transformY = function(yValue) {
  return this.applyRatioToBounds(this.yScale().transform(yValue), false);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.isDiscreteBased = function() {
  return false;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.supportsMarkers = function() {
  return false;
};


/**
 * Tester if the series can have an error. (line, marker).
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.supportsError = function() {
  return true;
};


/**
 * Getter/setter for clip.
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.scatter.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.scatter.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.clip_;
  }
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.scatter.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.scatter.series.Base.prototype.drawPoint = function(pointState) {
  if (this.enabled()) {
    if (this.pointDrawn = this.drawSeriesPoint(pointState | this.state.getSeriesState())) {
      this.drawLabel(pointState);
      if (this.supportsError() && this.error().hasAnyErrorValues())
        this.drawError();
    }
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.scatter.series.Base.prototype.startDrawing = function() {
  this.pointDrawn = false;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  this.pixelBoundsCache = /** @type {anychart.math.Rect} */(this.getPixelBounds());

  this.checkDrawingNeeded();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.resetErrorPaths();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(this.pixelBoundsCache);
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - +this.axesLinesSpace().bottom();
  var min = bounds.getTop() + +this.axesLinesSpace().top();

  return goog.math.clamp(value, min, max);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.scatter.series.Base.prototype.finalizeDrawing = function() {
  this.labels().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBoundsCache : this.clip());
    var labelDOM = this.labels().getDomElement();
    if (labelDOM) labelDOM.clip(/** @type {anychart.math.Rect} */(bounds));
  }

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.selectLabels().resumeSignalsDispatching(false);

  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);
  // This check need to prevent finalizeDrawing to mark CONTAINER consistency state in case when series was disabled by
  // series.enabled(false).
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.markConsistent(anychart.ConsistencyState.ALL & !anychart.ConsistencyState.CONTAINER);
  } else {
    this.markConsistent(anychart.ConsistencyState.ALL);
  }
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force) {
    var referenceValueNames = this.isSizeBased() ? ['x', 'value', 'size'] : ['x', 'value'];
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, referenceValueNames,
        this.supportsError() && anychart.core.utils.Error.supportsErrorForScale(this.xScale_));
  }
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
  }
};


/**
 * Draws series point.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.drawSeriesPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {anychart.math.Rect} */
  var bounds = this.pixelBoundsCache;
  var min, range;
  if (horizontal) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for xScale.
 * @return {anychart.scales.ScatterBase} Series X Scale or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.getXScale = function() {
  return this.xScale_;
};


/**
 * Getter/setter for xScale.
 * @param {anychart.scales.ScatterBase=} opt_value Value to set.
 * @return {(anychart.scales.ScatterBase|!anychart.core.scatter.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales']);
      return this;
    }
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.onScaleSignal_, this);
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.onScaleSignal_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.ScatterBase|anychart.core.scatter.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales']);
      return this;
    }
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.onScaleSignal_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.onScaleSignal_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.scatter.series.Base.prototype.onScaleSignal_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.scatter.series.Base.prototype.calculateStatistics = function() {
  var seriesXMax = -Infinity;
  var seriesYMax = -Infinity;
  var seriesXMin = Infinity;
  var seriesYMin = Infinity;
  var seriesXSum = 0;
  var seriesYSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  var isBubble = this.getType() == anychart.enums.ScatterSeriesType.BUBBLE;
  var size;
  var sizeMin = Infinity;
  var sizeMax = -Infinity;
  var sizeSum = 0;
  var sizes = [];

  var xValues = [];
  var yValues = [];

  while (iterator.advance()) {
    var value = iterator.get('value');
    var x = iterator.get('x');
    if (goog.isDef(value)) {
      var y = anychart.utils.toNumber(value);
      if (!isNaN(y)) {
        seriesYMax = Math.max(seriesYMax, y);
        seriesYMin = Math.min(seriesYMin, y);
        seriesYSum += y;
        yValues.push(y);
      }
    }
    if (goog.isDef(x)) {
      x = anychart.utils.toNumber(x);
      if (!isNaN(x)) {
        seriesXMax = Math.max(seriesXMax, x);
        seriesXMin = Math.min(seriesXMin, x);
        seriesXSum += x;
        xValues.push(x);
      }
    }

    if (isBubble) {
      size = iterator.get('size');
      if (goog.isDef(size)) {
        size = anychart.utils.toNumber(size);
        if (!isNaN(size)) {
          sizeMax = Math.max(sizeMax, size);
          sizeMin = Math.min(sizeMin, size);
          sizeSum += size;
          sizes.push(size);
        }
      }
    }

    seriesPointsCount++;
  }
  var seriesYAverage = seriesYSum / seriesPointsCount;
  var seriesXAverage = seriesXSum / seriesPointsCount;

  this.statistics(anychart.enums.Statistics.SERIES_MAX, seriesYMax);
  this.statistics(anychart.enums.Statistics.SERIES_MIN, seriesYMin);
  this.statistics(anychart.enums.Statistics.SERIES_SUM, seriesYSum);
  this.statistics(anychart.enums.Statistics.SERIES_AVERAGE, seriesYAverage);
  this.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT, seriesPointsCount);
  this.statistics(anychart.enums.Statistics.SERIES_POINT_COUNT, seriesPointsCount);

  this.statistics(anychart.enums.Statistics.SERIES_FIRST_X_VALUE, xValues[0]);
  this.statistics(anychart.enums.Statistics.SERIES_FIRST_Y_VALUE, yValues[0]);
  this.statistics(anychart.enums.Statistics.SERIES_LAST_X_VALUE, xValues[xValues.length - 1]);
  this.statistics(anychart.enums.Statistics.SERIES_LAST_Y_VALUE, yValues[yValues.length - 1]);

  this.statistics(anychart.enums.Statistics.SERIES_Y_SUM, seriesYSum);
  this.statistics(anychart.enums.Statistics.SERIES_X_SUM, seriesXSum);
  this.statistics(anychart.enums.Statistics.SERIES_X_MIN, seriesXMin);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MIN, seriesYMin);
  this.statistics(anychart.enums.Statistics.SERIES_X_MAX, seriesXMax);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MAX, seriesYMax);

  this.statistics(anychart.enums.Statistics.SERIES_Y_AVERAGE, seriesYAverage);
  this.statistics(anychart.enums.Statistics.SERIES_X_AVERAGE, seriesXAverage);

  this.statistics(anychart.enums.Statistics.SERIES_X_MEDIAN, anychart.math.median(xValues));
  this.statistics(anychart.enums.Statistics.SERIES_Y_MEDIAN, anychart.math.median(yValues));

  this.statistics(anychart.enums.Statistics.SERIES_X_MODE, anychart.math.mode(xValues));
  this.statistics(anychart.enums.Statistics.SERIES_Y_MODE, anychart.math.mode(yValues));

  if (isBubble) {
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM, sizeSum);
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_AVERAGE, sizeSum / seriesPointsCount);
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MIN_SIZE, sizeMin);
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MAX_SIZE, sizeMax);
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MEDIAN, anychart.math.median(sizes));
    this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MODE, anychart.math.mode(sizes));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Error
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/Setter for an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error or self for chaining.
 * @return {(anychart.core.utils.Error|anychart.core.scatter.series.Base)}
 */
anychart.core.scatter.series.Base.prototype.error = function(opt_value) {
  if (!this.supportsError())
    anychart.core.reporting.warning(anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR, undefined, [this.getType()]);
  if (!this.error_) {
    this.error_ = new anychart.core.utils.Error(this);
    this.registerDisposable(this.error_);
    this.error_.listenSignals(this.onErrorSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.error_.setup(opt_value);
    return this;
  }

  return this.error_;
};


/**
 * Listener for error invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.scatter.series.Base.prototype.onErrorSignal_ = function(event) {
  var state = anychart.ConsistencyState.APPEARANCE;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.scatter.series.Base.prototype.resetErrorPaths = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.errorPaths_) {
    for (var hash in this.errorPaths_) {
      var path = this.errorPaths_[hash];
      path.clear();
      path.parent(null);
      delete this.errorPaths_[hash];
    }
  } else
    this.errorPaths_ = {};
};


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.getErrorPath = function(stroke) {
  var hash = '' + this.getIterator().getIndex() + anychart.utils.hash(stroke);
  if (hash in this.errorPaths_)
    return this.errorPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.scatter.series.Base.ZINDEX_ERROR_PATH));

    this.rootLayer.addChild(path);
    this.makeInteractive(path);
    path.stroke(stroke);
    path.fill(null);
    this.errorPaths_[hash] = path;
    return path;
  }
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.scatter.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Returns proper error stroke in current point.
 * @param {boolean} horizontal
 * @return {acgraph.vector.Stroke}
 */
anychart.core.scatter.series.Base.prototype.getErrorStroke = function(horizontal) {
  var iterator = this.getIterator();
  var errorStroke = horizontal ? this.error().xErrorStroke() : this.error().valueErrorStroke();
  var pointStroke = horizontal ? iterator.get('xErrorStroke') : iterator.get('valueErrorStroke');

  var result = /** @type {!acgraph.vector.Stroke} */ (this.normalizeColor(/** @type {acgraph.vector.Stroke|Function} */ (pointStroke || errorStroke)));
  return acgraph.vector.normalizeStroke(result);
};


/**
 * Draws an error.
 */
anychart.core.scatter.series.Base.prototype.drawError = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var error = this.error();
    var errorMode = error.mode();
    var isBarBased = false;

    switch (errorMode) {
      case anychart.enums.ErrorMode.NONE:
        break;
      case anychart.enums.ErrorMode.X:
        error.draw(true, isBarBased);
        break;
      case anychart.enums.ErrorMode.VALUE:
        error.draw(false, isBarBased);
        break;
      case anychart.enums.ErrorMode.BOTH:
        error.draw(true, isBarBased);
        error.draw(false, isBarBased);
        break;
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns type of current series.
 * @return {anychart.enums.ScatterSeriesType} Series type.
 */
anychart.core.scatter.series.Base.prototype.getType = goog.abstractMethod;


/** @inheritDoc */
anychart.core.scatter.series.Base.prototype.getEnableChangeSignals = function() {
  return goog.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.scatter.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  if (this.supportsError())
    json['error'] = this.error().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  if (this.supportsError())
    this.error(config['error']);
  this.clip(config['clip']);
};


//anychart.core.scatter.series.Base.prototype['drawPoint'] = anychart.core.scatter.series.Base.prototype.drawPoint;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['startDrawing'] = anychart.core.scatter.series.Base.prototype.startDrawing;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['finalizeDrawing'] = anychart.core.scatter.series.Base.prototype.finalizeDrawing;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['getIterator'] = anychart.core.scatter.series.Base.prototype.getIterator;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['getResetIterator'] = anychart.core.scatter.series.Base.prototype.getResetIterator;//doc|need-ex
//exports
anychart.core.scatter.series.Base.prototype['clip'] = anychart.core.scatter.series.Base.prototype.clip;//doc|ex
anychart.core.scatter.series.Base.prototype['data'] = anychart.core.scatter.series.Base.prototype.data;//doc
anychart.core.scatter.series.Base.prototype['xScale'] = anychart.core.scatter.series.Base.prototype.xScale;//doc|ex
anychart.core.scatter.series.Base.prototype['yScale'] = anychart.core.scatter.series.Base.prototype.yScale;//doc|ex
anychart.core.scatter.series.Base.prototype['error'] = anychart.core.scatter.series.Base.prototype.error;
anychart.core.scatter.series.Base.prototype['transformX'] = anychart.core.scatter.series.Base.prototype.transformX;
anychart.core.scatter.series.Base.prototype['transformY'] = anychart.core.scatter.series.Base.prototype.transformY;
