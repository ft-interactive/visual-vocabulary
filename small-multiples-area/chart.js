
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign, numberOfColumns, numberOfRows, yMin, yMax, yAxisHighlight, numTicksy, xAxisTickFormat){

  var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
  var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

  // return the series names from the first row of the spreadsheet
  var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
  //Select the plot space in the frame from which to take measurements
  var frame=d3.select("#"+media+"chart")
  var plot=d3.select("#"+media+"plot")

  var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
  yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
  
  //Get the width,height and the marginins unique to this chart
  var w=plot.node().getBBox().width;
  var h=plot.node().getBBox().height - yOffset;
  var margin=plotpadding.filter(function(d){
      return (d.name === media);
    });
  margin=margin[0].margin[0]

  var colours= d3.scale.ordinal()
      .domain([0,0])
      .range(stylename.fillcolours);

  //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
  var plotWidth = ((w - (yOffset * numberOfColumns))/numberOfColumns);
  var plotHeight = (h/numberOfRows)-(margin.top + margin.bottom);
  
  if(yMin === null || yMax === null){
    data.forEach(function(d,i){
      seriesNames.forEach(function(e){
        if(i==0) yMin = yMax = Number(d[e]);
        yMin = Math.min(yMin, Number(d[e]));
        yMax = Math.max(yMax, Number(d[e]));
      });     
    });
  }
  console.log(yMin, yMax)
  // override min value if > 0
  if (yMin > 0) yMin = 0;
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

  var xDomain = d3.extent(data, function(d) {return d.date;});


  var yScale = d3.scale.linear()
      .range([plotHeight, 0])
      .domain([yMin,yMax])

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .ticks(numTicksy)
      .orient("right")
      .tickFormat(function(d){
        return d/divisor;
      });   

  // set the first and last date ticks for the x-axis
  var minDate = data[0].date,
      maxDate = data[data.length - 1].date;

  var smallMultiple = plot.selectAll('g')
    .data(seriesNames)
    .enter()
    .append('g')
      .attr({
        'transform': function(d, i) { 
          var yPos = (yOffset * 1.8) + Number((Math.floor( i / numberOfColumns) * (plotHeight + margin.top + margin.bottom + 4) + margin.top));
          var xPos = i % numberOfColumns;
          return 'translate(' + ((plotWidth + yOffset *1.3) * xPos) + ',' + yPos + ')';
        },
        'id':function(d){ return d; },
        'xPosition': function (d,i) {
          xPos = i%numberOfColumns;
          return xPos;
        }
      });

  smallMultiple.append('text')
    .attr({
      'class':media + 'item-title',
        'dx': function() {return (plotWidth-((yOffset/2) * numberOfColumns))/2;},
        'dy': function() {return -yOffset/1.5;},
    })
    .text(function(d) {return d.toUpperCase(); });

  var yLabel = smallMultiple.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)
  // calculate what the ticksize should be now that the text for the labels has been drawn
  var yLabelOffset=yLabel.node().getBBox().width
  var yticksize=colculateTicksize(yAlign,yLabelOffset);

  yLabel.call(yAxis.tickSize(yticksize))

  yLabel
      .attr("transform",function(){
          if (yAlign=="right"){
              return "translate(0,"+margin.top+")"
          }
          else return "translate("+(plotWidth-margin.right)+","+margin.top+")"
          })

  yLabel.selectAll('text')
      .attr("style", null)
      .attr("x",yticksize+(yLabelOffset*.8))

  //identify 0 line if there is one
  var originValue = 0;
  var origin = plot.selectAll(".tick").filter(function(d, i) {
          return d==originValue || d==yAxisHighlight;
      }).classed(media+"origin",true);

  var xScale = d3.time.scale()
      .domain(xDomain)
      .range([0, (plotWidth - (yLabelOffset * 1.6))]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickSize(yOffset/2)
      .orient("bottom")
      .tickFormat(xAxisTickFormat)
      .tickValues([minDate,maxDate]);

  smallMultiple.append('path')
    .attr('class', media + 'area')
    .each(function(seriesNames){
      var area = d3.svg.area()
          .x(function(d) { return xScale(d.date); })
          .y0(yScale(0))
          .y1(function(d) { return yScale( d[seriesNames] );; });

      d3.select(this)
        .datum(data)
        .attr('d', function(d){ return area(d); })
         .style("fill", function (d) {
              return colours(0)
         })
        .attr("transform",function(){
        if(yAlign=="right") {
            return "translate(" + (yLabelOffset*0.1) + ",0)"
        }
         else {return "translate("+(margin.left+yLabelOffset)+",0)"}
        });
  });

  var xLabel=smallMultiple.append("g")
    .attr("class",media+"xAxis")
    .attr("transform",function(){
        if(yAlign=="right") {
            return "translate(" + (yLabelOffset*0.1) + ","+(plotHeight+margin.top)+")"
        }
         else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
        })
    .call(xAxis);

  function colculateTicksize(align, offset) {
    if (align=="right") {
        return plotWidth-margin.left - offset + 2
    }
    else {return plotWidth-margin.right - offset}
  }
}