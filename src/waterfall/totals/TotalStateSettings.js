goog.provide('anychart.waterfallModule.totals.TotalStateSettings');

goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.LabelsSettings');

/**
 * Class that represent total state settings.
 *
 * @param {anychart.waterfallModule.totals.Total} stateHolder - Instance of total.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta - Descriptors meta.
 * @param {anychart.SettingsState} stateType - Instance of total.
 *
 * @constructor
 */
anychart.waterfallModule.totals.TotalStateSettings = function(stateHolder, descriptorsMeta, stateType) {
  anychart.waterfallModule.totals.TotalStateSettings.base(this, 'constructor', stateHolder, descriptorsMeta, stateType);
};
goog.inherits(anychart.waterfallModule.totals.TotalStateSettings, anychart.core.StateSettings);


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.totals.TotalStateSettings.prototype.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.STROKE,
    anychart.core.settings.descriptors.FILL,
    anychart.core.settings.descriptors.HATCH_FILL
  ]);

  return map;
})();


anychart.core.settings.populate(
  anychart.waterfallModule.totals.TotalStateSettings,
  anychart.waterfallModule.totals.TotalStateSettings.prototype.PROPERTY_DESCRIPTORS
);

/**
 * Label invalidate handler.
 */
anychart.waterfallModule.totals.TotalStateSettings.prototype.labelInvalidated = function() {
  this.invalidate(anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
};

/**
 * Getter and setter for the label.
 *
 * @param {(Object|boolean|null)=} opt_config Tooltip settings.
 * @return {!(anychart.waterfallModule.totals.TotalStateSettings|anychart.core.ui.LabelsSettings)} LabelsSettings instance or itself for chaining call.
 */
anychart.waterfallModule.totals.TotalStateSettings.prototype.label = function(opt_config) {
  if (!this.labelSettings_) {
    this.labelSettings_ = new anychart.core.ui.LabelsSettings(true);
    this.labelSettings_.addThemes('defaultLabelFactory');
    this.setupCreated('label', this.labelSettings_);

    this.labelSettings_.listenSignals(this.labelInvalidated, this);
  }

  if (goog.isDef(opt_config)) {
    this.labelSettings_.setup(opt_config);
    return this;
  }

  return this.labelSettings_;
};


//region --- Serialization / Deserialization
/** @inheritDoc */
anychart.waterfallModule.totals.TotalStateSettings.prototype.serialize = function() {
  var json = {};
  anychart.core.settings.serialize(this, this.PROPERTY_DESCRIPTORS, json, 'State settings', this.descriptorsMeta);
  json['label'] = this.label().serialize();

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.totals.TotalStateSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, this.PROPERTY_DESCRIPTORS, config, opt_default);

  var labelConfig = config['label'];
  if (labelConfig) {
    this.label(labelConfig);
  }
};
//endregion
