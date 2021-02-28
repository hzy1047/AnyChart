goog.provide('anychart.waterfallModule.totals.Total');

goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.format.Context');
goog.require('anychart.waterfallModule.totals.TotalStateSettings');

/**
 * Waterfall Total settings.
 *
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.waterfallModule.totals.Total = function(storage) {
  anychart.waterfallModule.totals.Total.base(this, 'constructor');
  this.addThemes('waterfall.totals', 'waterfall.totals.normal');

  this.currentState_ = anychart.SettingsState.NORMAL;

  var stateMetas = [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['hatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
  ];

  var nonStateMetas = [
    ['name', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['width', 0, anychart.Signal.BOUNDS_CHANGED],
    ['x', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ];

  var stateDescriptors = {};
  anychart.core.settings.createDescriptorsMeta(stateDescriptors, stateMetas);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, nonStateMetas);

  this.normal_ = new anychart.waterfallModule.totals.TotalStateSettings(this, stateDescriptors, anychart.SettingsState.NORMAL);
  this.hovered_ = new anychart.waterfallModule.totals.TotalStateSettings(this, stateDescriptors, anychart.SettingsState.HOVERED);

  this.path_ = null;

  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
};
goog.inherits(anychart.waterfallModule.totals.Total, anychart.core.VisualBaseWithBounds);


//region --- Infrastructure
anychart.core.settings.populateAliases(anychart.waterfallModule.totals.Total, [
  'stroke',
  'fill',
  'hatchFill',
  'label'
], 'normal');


anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'x', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'name', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.totals.Total, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.waterfallModule.totals.Total.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.waterfallModule.totals.Total.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.ALL;


/**
 * @typedef {Object}
 *
 * @property {string} x - 'X' value of category need to display total value.
 * @property {string} name - Name of total value. Displayed as category name.
 * @property {Object|string} label - Label config or format value.
 * @property {acgraph.vector.Fill} fill - Fill.
 * @property {acgraph.vector.Stroke} stroke - Stroke.
 * @property {acgraph.vector.HatchFill.HatchFillType} hatchFill - Hatch fill type.
 */
anychart.waterfallModule.totals.Total.Config;


//endregion
//region --- Calculation
/**
 * Calculate and return value for total.
 *
 * @param {Array.<Array.<number>>} values - Values of points that located before total value.
 * @return {number}
 */
anychart.waterfallModule.totals.Total.prototype.calculateTotalValue = function(values) {
  return this.value_ = goog.array.reduce(values, function(totalValue, rows) {
    return totalValue + goog.array.reduce(rows, function(rowSum, pointValue) {
      if (goog.isNumber(pointValue)) {
        return rowSum + pointValue;
      }
      return rowSum;
    }, 0);
  }, 0);
};


/**
 * Return string value that will be displayed in x axis under total value.
 *
 * @return {string}
 */
anychart.waterfallModule.totals.Total.prototype.getTotalX = function() {
  return 'total_' + goog.getUid(this);
};


anychart.waterfallModule.totals.Total.prototype.value = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.value_ = opt_value;
  }
  return this.value_;
};


/**
 * Returns config of state settings.
 *
 * @param {anychart.waterfallModule.totals.TotalStateSettings} state - State settings.
 * @return {Object}
 */
anychart.waterfallModule.totals.Total.prototype.getStateSettings = function(state) {
  var config = {};
  config['label'] = state.label().flatten();

  return config;
};


/**
 * Calculate total value and return it as array of points that must be located after total 'x' value.
 *
 * @param {Array.<Array.<number>>} values - Values of points that located before total value.
 * @return {Array.<Object>}
 */
anychart.waterfallModule.totals.Total.prototype.getResolverCategories = function() {
  var x = this.getTotalX();

  return [x];
};

anychart.waterfallModule.totals.Total.prototype.drawingData = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.drawingData_ = opt_value;
  }
  return this.drawingData_;
};


// endregion


anychart.waterfallModule.totals.Total.prototype.initPath_ = function() {
  this.path_ = this.container().path();
  this.hatchFill_ = this.container().path();
};

anychart.waterfallModule.totals.Total.prototype.mouseMoveHandler = function(event) {
  var x = event['clientX'];
  var y = event['clientY'];

  this.applyHoveredState_();

  this.showTooltip(x, y);

  this.draw();
};

anychart.waterfallModule.totals.Total.prototype.mouseOutHandler = function(event) {
  this.applyNormalState_();
  this.hideTooltip();
  this.draw();
};

anychart.waterfallModule.totals.Total.prototype.initEventHandlers_ = function() {
  this.path_.listen(goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
  this.path_.listen(goog.events.EventType.MOUSEOUT, this.mouseOutHandler, true, this);
};

anychart.waterfallModule.totals.Total.prototype.clearPath_ = function() {
  this.path_.clear();
};

anychart.waterfallModule.totals.Total.prototype.getDrawingCoordinates = function() {
  var drawingData = this.drawingData();

  var bounds = this.bounds();
  var boundWidth = bounds.width();
  var boundsLeft = bounds.left();
  var boundsTop = bounds.top();
  var boundsHeight = bounds.height();

  var totalWidth = Math.floor(
    anychart.utils.normalizeSize(/** @type {(number|string)} */(this.getOption('width')), boundWidth));

  var widthDiff = boundWidth - totalWidth;
  var halfOfWidthDiff = widthDiff / 2;

  var leftX = boundsLeft + halfOfWidthDiff;
  var rightX = boundsLeft + boundWidth - halfOfWidthDiff;

  var topY = drawingData.value * boundsHeight + boundsTop;
  var bottomY = drawingData.zero * boundsHeight + boundsTop;

  var rv = {};
  rv.leftTop = {
    x: leftX,
    y: topY,
  };

  rv.rightTop = {
    x: rightX,
    y: topY,
  };

  rv.leftBottom = {
    x: leftX,
    y: bottomY,
  };

  rv.rightBottom = {
    x: rightX,
    y: bottomY,
  };

  return rv;
};

anychart.waterfallModule.totals.Total.prototype.drawShape = function() {
  var drawingCoordinates = this.getDrawingCoordinates();


  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.path_.stroke()));

  // aligning column to ticks
  // if (this.crispEdges) {
  //   leftX = anychart.utils.applyPixelShift(leftX, thickness);
  //   rightX = anychart.utils.applyPixelShift(rightX, thickness);
  //   y = anychart.utils.applyPixelShift(y, thickness);
  //
  //   if (this.isVertical) {
  //     zero = anychart.utils.applyPixelShift(zero, 1);
  //     zero = zero < y ? Math.floor(zero) : Math.ceil(zero);
  //   } else {
  //     zero = anychart.utils.applyPixelShift(zero, thickness);
  //   }
  // }

  anychart.core.drawers.move(this.path_, false, drawingCoordinates.leftTop.x, drawingCoordinates.leftTop.y);
  anychart.core.drawers.line(this.path_, false, drawingCoordinates.rightTop.x, drawingCoordinates.rightTop.y);
  anychart.core.drawers.line(this.path_, false, drawingCoordinates.rightBottom.x, drawingCoordinates.rightBottom.y);
  anychart.core.drawers.line(this.path_, false, drawingCoordinates.leftBottom.x, drawingCoordinates.leftBottom.y);

  this.path_.close();
};

anychart.waterfallModule.totals.Total.prototype.resolveStateOption = function(option) {
  return this.currentState_ === anychart.SettingsState.HOVERED ?
    this.hovered_.getOption(option) :
    this.normal_.getOption(option);
};

anychart.waterfallModule.totals.Total.prototype.resolveColor = function(color, resolver) {
  if (goog.isFunction(color)) {
    var ctx = resolver.call(this);
    return color.call(ctx, ctx);
  }
  return color;
};

anychart.waterfallModule.totals.Total.prototype.getFill = function() {
  var fill = this.resolveStateOption('fill');
  return this.resolveColor(fill, this.getFillResolutionContext);
};

anychart.waterfallModule.totals.Total.prototype.getStroke = function() {
  var stroke = this.resolveStateOption('stroke');
  return this.resolveColor(stroke, this.getStrokeResolutionContext);
};

anychart.waterfallModule.totals.Total.prototype.applyAppearance = function() {
  this.path_.fill(this.getFill());
  this.path_.stroke(this.getStroke());
};

anychart.waterfallModule.totals.Total.prototype.getBaseContext = function() {

};

anychart.waterfallModule.totals.Total.prototype.getFillResolutionContext = function() {
  return {
    'sourceColor': this.getThemeOption('fill')
  };
};

anychart.waterfallModule.totals.Total.prototype.getStrokeResolutionContext = function() {
  return {
    'sourceColor': this.getThemeOption('stroke')
  };
};

// region --- Drawing
anychart.waterfallModule.totals.Total.prototype.draw = function() {
  if (!this.path_) {
    this.initPath_();
    this.initEventHandlers_();
  }

  this.clearPath_();
  this.drawShape();


  this.applyAppearance();

  // anychart.core.drawers.move(hatchFill, this.isVertical, leftX, y);
  // anychart.core.drawers.line(hatchFill, this.isVertical, rightX, y, rightX, zero, leftX, zero);
  // hatchFill.close();
};
// endregion
// region --- States
/**
 * Normal state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.waterfallModule.totals.Total|anychart.waterfallModule.totals.TotalStateSettings}
 */
anychart.waterfallModule.totals.Total.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    this.normal_.addThemes('waterfall.totals.normal');
    return this;
  }
  return this.normal_;
};


anychart.waterfallModule.totals.Total.prototype.applyNormalState_ = function() {
  this.currentState_ = anychart.SettingsState.NORMAL;
};
anychart.waterfallModule.totals.Total.prototype.applyHoveredState_ = function() {
  this.currentState_ = anychart.SettingsState.HOVERED;
};

/**
 * Hovered state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.waterfallModule.totals.Total|anychart.waterfallModule.totals.TotalStateSettings}
 */
anychart.waterfallModule.totals.Total.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    this.normal_.addThemes('waterfall.totals.hovered');
    return this;
  }
  return this.hovered_;
};


//endregion
//region --- Labels
/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.waterfallModule.totals.Total.prototype.createFormatProvider = function() {
  if (!this.formatProvider_) {
    this.formatProvider_ = new anychart.format.Context();
  }

  var context = {
    'x': {
      value: this.getOption('x'),
      type: anychart.enums.TokenType.STRING
    },
    'value': {
      value: this.value(),
      type: anychart.enums.TokenType.NUMBER
    },
    'name': {
      value: this.getOption('name'),
      type: anychart.enums.TokenType.STRING
    },
    'total': {
      value: this,
      type: anychart.enums.TokenType.UNKNOWN
    }
  };

  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(context));
};


//endregion
//region --- Tooltip
anychart.waterfallModule.totals.Total.prototype.showTooltip = function(x, y) {
  this.tooltip().showFloat(x, y, this.createFormatProvider());
};


/**
 * Hide tooltip.
 */
anychart.waterfallModule.totals.Total.prototype.hideTooltip = function() {
  this.tooltip().hide();
};


/**
 * Getter and setter for the tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.waterfallModule.totals.Total|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.waterfallModule.totals.Total.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//endregion
//region --- Serialization / Deserialization
/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.serialize = function() {
  var json = anychart.waterfallModule.totals.Total.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS, json);

  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();

  return json;
};

/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.settings.deserialize(this, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS, json, opt_default);

  var normalConfig = json['normal'];
  if (normalConfig) {
    this.normal().setupByJSON(normalConfig, opt_default);
  }

  var hoveredConfig = json['hovered'];
  if (hoveredConfig) {
    this.hovered().setupByJSON(hoveredConfig, opt_default);
  }
};
//endregion
