goog.provide('anychart.circlePackingModule.Chart');

goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.format.Context');
goog.require('anychart.treeChartBase.ArrayIterator');
goog.require('anychart.treeChartBase.Chart');
goog.require('anychart.treeChartBase.Point');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.utils');


/**
 * AnyChart Circle Packing chart.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.treeChartBase.Chart}
 * @implements {anychart.core.IShapeManagerUser}
 * @constructor
 */
anychart.circlePackingModule.Chart = function(opt_data, opt_fillMethod) {
  anychart.circlePackingModule.Chart.base(this, 'constructor', opt_data, opt_fillMethod);

  this.addThemes('circlePacking');

  /**
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   * @private
   */
  this.rootNode_ = null;

  /**
   * Array of node values.
   * Need to calculate color scale.
   * @type {Array.<number>}
   * @private
   */
  this.nodeValues_ = [];

  /**
   * Array of hint node values.
   * Need to calculate color scale.
   * @type {Array.<number>}
   * @private
   */
  this.hintNodeValues_ = [];

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.labelToPointIndex_ = {};
  this.markerToPointIndex_ = {};

  this.data(opt_data, opt_fillMethod);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  var hoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredSelectedDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', 0, 0]
  ]);

  this.selected_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  function factoryEnabledNull(factory) {
    factory.enabled(null);
  }
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, factoryEnabledNull);

  this.hovered_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setMeta('headers', [0, 0]);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, factoryEnabledNull);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['maxDepth',
      anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE],
    ['hintDepth',
      anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['hintOpacity', anychart.ConsistencyState.TREEMAP_HINT_OPACITY, anychart.Signal.NEEDS_REDRAW],
    ['headersDisplayMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['labelsDisplayMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.circlePackingModule.Chart, anychart.treeChartBase.Chart);
anychart.core.settings.populateAliases(anychart.circlePackingModule.Chart, ['fill', 'stroke', 'hatchFill', 'labels', 'headers'], 'normal');
