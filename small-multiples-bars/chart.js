
function makeChart(data, stylename, media, plotpadding, frames, legAlign, yAlign, numberOfColumns, numberOfRows, xMin, xMax, yAxisHighlight, numTicksy, coloursOverride){

  var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
  var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;
  // return the series names from the first row of the spreadsheet
  var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'cat'; });
  //Select the plot space in the frame from which to take measurements
  var frame=d3.select("#"+media+"chart")
  var plot=d3.select("#"+media+"plot")

  var headerTitle = d3.select("#"+media+"Title");
  var headerSubtitle = d3.select("#"+media+"Subtitle");

  var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
  yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
  
  //Get the width,height and the marginins unique to this chart
  var w=plot.node().getBBox().width;
  var h=plot.node().getBBox().height;
  var margin=plotpadding.filter(function(d){
      return (d.name === media);
    });
  margin=margin[0].margin[0]

  var labelPadding = frames.filter(function(d){
      return (d.name === media);
    });
  labelPadding=labelPadding[0].margins[0]
  console.log(labelPadding)

  // reposition header
  headerTitle.attr('transform', 'translate(' + (-labelPadding.left + margin.left) +',' + 0 + ')')
  headerSubtitle.attr('transform', 'translate(' + (-labelPadding.left + margin.left) +',' + 0 + ')')
  
  var colours= d3.scale.ordinal()
    .domain([0,0])

  if (coloursOverride.length === 0) {
    colours.range(stylename.fillcolours);
  } else {
    colours.range(coloursOverride);
  }
    


  //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
  var plotWidth = ((w - labelPadding.left - labelPadding.right)/numberOfColumns);
  var plotHeight = (h/numberOfRows)-(margin.top + margin.bottom);
  
  // console.log(plotWidth,colours,plotHeight,data)
  // console.log(margin)
  //you now have a chart area, inner margin data and colour palette - with titles pre-rendered
  // calculate maximum and minimum for the y-axis
  console.log(xMin,xMax)
  if(xMin === null || xMax === null){
    data.forEach(function(d,i){
      seriesNames.forEach(function(e){
        if(i==0) xMin = xMax = Number(d[e]);
        xMin = Math.min(xMin, Number(d[e]));
        xMax = Math.max(xMax, Number(d[e]));
      });     
    });
  }

  // override min value if > 0
  if (xMin > 0) xMin = 0;
  
  // var yScale = d3.scale.linear()
  //   .range([plotHeight, 0])
  //   .domain([yMin,yMax])

  var yScale = d3.scale.ordinal()
      .rangeRoundBands([0, plotHeight], .1);

  var yDomain = data.map(function(d) { return d.cat; });
      yScale.domain(yDomain);

      console.log(yScale.domain(yDomain));

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickSize(0)

  var smallMultiple = plot.selectAll('g')
  .data(seriesNames)
  .enter()
  .append('g')
    .attr({
      'transform': function(d, i) { 
        var yPos = yOffset + Number((Math.floor( i / numberOfColumns) * (plotHeight + margin.top + margin.bottom + 4) + margin.top));
        var xPos = i % numberOfColumns;
        return 'translate(' + ((plotWidth + margin.right + yOffset *1.5) * xPos) + ',' + yPos + ')';
      },
      'id':function(d){ return d; },
      'xPosition': function (d,i) {
        xPos = i%numberOfColumns;
        return xPos;
      }
    });

  smallMultiple.append('g')
    .each(function(d,i){
      if ( d3.select(this.parentNode).attr('xPosition') === '0' && xMin < 0) {
        var tints = d3.select(this).selectAll('rect');
        tints.data(data)
          .enter()
          .append('rect')
          .attr({
            'class' : media + 'tint',           
            'y': function(d) { 
              return yScale(d.cat);
            },
            'x' : -labelPadding.left,
            'width' : frame.node().getBBox().width,
            'height': yScale.rangeBand()
          });
      }
   });
  smallMultiple.append('text')
    .attr({
      'class':media + 'item-title',
        'dx': function() {return (plotWidth)/2 ;},
        'dy': function() {return -(yOffset * 1.4);},
    })
    .text(function(d) {return d.toUpperCase(); });

  smallMultiple.each(function (d, i) { 
      if ( d3.select(this).attr('xPosition') === '0') {
        d3.select(this).append('g')
          .attr("class", media+"yAxis")
          .attr('transform', 'translate(-5,0)')
          .call(yAxis);
      }
    })

  var yAxisOffset=d3.select("."+media+"yAxis").node().getBBox().width;
  d3.select("#"+media+"plot").attr('transform', 'translate(' + (yAxisOffset + 8) + ',' + (yOffset * 2) + ')')

  var xScale = d3.scale.linear()
      .range([0, plotWidth])
      .domain([xMin,xMax]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickSize(-plotHeight)
    .orient('top')
    .ticks(numTicksy)
    .tickFormat(function(d){
      return d/divisor;
    });
  
  smallMultiple.append('g')
  .attr({
    'class': function() { return xMin < 0 ?  media+"xAxisTint" :  media+"xAxis";},
      'transform': 'translate(0,0)'
  })
  .call(xAxis);

   //identify 0 line if there is one
  var originValue = 0;
  var origin = plot.selectAll(".tick").filter(function(d, i) {
          return d==originValue || d==yAxisHighlight;
      }).classed(media+"origin",true);

  smallMultiple.append('g')
    .each(function(seriesNames){
      var bars = d3.select(this).selectAll('rect');
      bars.data(data)
        .enter()
        .append('rect')
        .style("fill", function (d, i) {
            return colours(i)
        })
        .attr({
          'class': function(d){
            return d[seriesNames] < 0 ? 'negative' : 'positive';
          },
          'y': function(d) { 
            return yScale(d.cat);
          },
          'x': function(d) { 
            return xScale(Math.min(0, d[seriesNames]) );
          },
          'width': function(d) { 
            return Math.abs(xScale( d[seriesNames] ) - xScale(0) ); 
          },
          'id':function(d){
            return seriesNames + ' ' + d.cat + ' value: ' + d[seriesNames];
          },
          'height': yScale.rangeBand()
        });
    });
}