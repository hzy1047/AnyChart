anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 297, 243, 235, -223],
    ['P2', 184, 255, 156, -249],
    ['P3', 136, 199, -177, -276],
    ['P4', 142, 186, -242, -249],
    ['P5', 228, 145, -267, -297]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create column chart
  var chart = anychart.columnChart();

  //force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Bar Chart');

  //helper function to setup label settings for all series
  var setupSeriesLabels = function(series) {
    var seriesLabels = series.labels();
    seriesLabels.enabled(true);
    seriesLabels.position('center');
    seriesLabels.anchor('center');
    seriesLabels.fontColor('white');
    seriesLabels.fontWeight('bold');
  };

  //temp variable to store series instance
  var series;

  //create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeriesLabels(series);

  //create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeriesLabels(series);

  //create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeriesLabels(series);

  //create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeriesLabels(series);

  //initiate chart drawing
  chart.draw();
});