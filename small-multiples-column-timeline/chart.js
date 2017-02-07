
function makeChart(data, stylename, media, plotpadding, legAlign, yAlign, numberOfColumns, numberOfRows, yMin, yMax, numTicksy, xAxisTickFormat){

  var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
  var subtitleYoffset = d3.select("#"+media+"Subtitle").node().getBBox().height;

  // return the series names from the first row of the spreadsheet
  var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

  //Select the plot space in the frame from which to take measurements
  var frame = d3.select("#" + media + "chart");
  var plot = d3.select("#" + media + "plot");

  var yOffset = d3.select("#" + media + "Subtitle").style("font-size");
  yOffset = Number(yOffset.replace(/[^\d.-]/g, ''));

  // console.log(yOffset)
  
  //Get the width,height and the marginins unique to this chart
  var w = plot.node().getBBox().width;
  var h = plot.node().getBBox().height - yOffset;
  var margin = plotpadding.filter(function(d){
      return (d.name === media);
    });
  margin = margin[0].margin[0]
  var colours = stylename.linecolours;


  //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
  var plotWidth = (w/numberOfColumns)-(margin.left + margin.right);
  var plotHeight = (h/numberOfRows)-(margin.top + margin.bottom);
  
  console.log(w,plotWidth, w/plotWidth);
  // calculate maximum and minimum for the y-axis
  if(!yMin || !yMax){
    data.forEach(function(d,i){
      seriesNames.forEach(function(e){
        if(i==0) yMin = yMax = Number(d[e]);
        yMin = Math.min(yMin, Number(d[e]));
        yMax = Math.max(yMax, Number(d[e]));
      });     
    });
  }

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
          var yPos = yOffset + Number((Math.floor( i / numberOfColumns) * (plotHeight + margin.top + margin.bottom) + margin.top));
          var xPos = i % numberOfColumns;
          return 'translate(' + ((plotWidth +10) * xPos) + ',' + yPos + ')';
        },
        'id':function(d){ return d; }
      });

  smallMultiple.append('text')
    .attr({
      'class':media + 'item-title',
        'dx': function() {return ((plotWidth)/2)-margin.left;},
        'dy': function() {return yOffset/2;},
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

  var xScale = d3.time.scale()
      .domain(xDomain)
      .range([0, plotWidth-yLabelOffset]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickSize(yOffset/2)
      .orient("bottom")
      .tickFormat(xAxisTickFormat)
      .tickValues([minDate,maxDate]);

  var xLabel=smallMultiple.append("g")
      .attr("class",media+"xAxis")
      .attr("transform",function(){
          if(yAlign=="right") {
              return "translate(0,"+(plotHeight+margin.top)+")"
          }
           else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
          })
      .call(xAxis);
  
  //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

 function colculateTicksize(align, offset) {
      if (align=="right") {
          return plotWidth-margin.left - offset
      }
      else {return plotWidth-margin.right - offset}
  }

}