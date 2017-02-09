
function makeChart(data, stylename, media, plotpadding, legAlign, yAlign, numberOfColumns, numberOfRows, yMin, yMax, yAxisHighlight, numTicksy, coloursOverride){

  var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
  var subtitleYoffset = d3.select("#"+media+"Subtitle").node().getBBox().height;

  // return the series names from the first row of the spreadsheet
  var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'cat'; });

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
  var colours= d3.scale.ordinal()
      .domain([0,0])
  
  if (coloursOverride.length === 0) {
    colours.range(stylename.fillcolours);
  } else {
    colours.range(coloursOverride);
  }
    


  //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
  var plotWidth = ((w - (yOffset * numberOfColumns))/numberOfColumns);
  var plotHeight = (h/numberOfRows)-(margin.top + margin.bottom);

  var plotCats=data.map(function(d) {
    return {
        cat:d.cat,
    }
  });
  // calculate maximum and minimum for the y-axis
    console.log(yMin,yMax)
  if(yMin === null || yMax === null){
    data.forEach(function(d,i){
      seriesNames.forEach(function(e){
        if(i==0) yMin = yMax = Number(d[e]);
        yMin = Math.min(yMin, Number(d[e]));
        yMax = Math.max(yMax, Number(d[e]));
      });     
    });
  }

  // override min value if > 0
  if (yMin > 0) yMin = 0;

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

 var smallMultiple = plot.selectAll('g')
    .data(seriesNames)
    .enter()
    .append('g')
      .attr({
        'transform': function(d, i) { 
          var yPos = yOffset + Number((Math.floor( i / numberOfColumns) * (plotHeight + margin.top + margin.bottom + 4) + margin.top));
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
        'dy': function() {return -yOffset/numberOfColumns;},
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

  var x0 = d3.scale.ordinal()
    .rangeBands([0, plotWidth-yLabelOffset], 0.1, 0.2);

  var x1 = d3.scale.ordinal();

  var xAxis = d3.svg.axis()
      .scale(x0)
      .tickSize(0)
      .orient("bottom")

  x0.domain(data.map(function(d) { return d.cat; }));
  x1.domain(data.map(function(d) { return d.cat; }))
    .rangeBands([0, x0.rangeBand()]);    

    smallMultiple.append('g')
    .each(function(seriesNames){
      var bars = d3.select(this).selectAll('rect');
      bars.data(data)
          .enter()
          .append('rect')
            .style("fill", function (d, i) {
                return colours(i)
            })
            .attr("id",function(d) { return d.date+"-"+d[seriesNames]; })
            .attr("class",media+"fill")
            .attr("width", x0.rangeBand())
            .attr("x", function(d) { return x0(d.cat) -2; })
            .attr("y", function(d) { return yScale(Math.max(0, d[seriesNames]))})
            .attr("height", function(d) {return (Math.abs(yScale(d[seriesNames]) - yScale(0))); })
            .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate(2,"+(margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
            })
    })
  var xLabel=smallMultiple.append("g")
    .attr("class",media+"xAxis")
    .attr("transform",function(){
        if(yAlign=="right") {
            return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
        }
         else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
        })
    .call(xAxis);
  //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

   // //create a legend first
  var legendyOffset=0
    var legend = plot.append("g")
        .attr("id",media+"legend")
        .on("mouseover",pointer)
        .selectAll("g")
        .data(plotCats)
        .enter()
        .append("g")
        .attr ("id",function(d,i){
            return media+"l"+i
        })

    var drag = d3.behavior.drag().on("drag", moveLegend);
    d3.select("#"+media+"legend").call(drag);
        
    legend.append("text")

        .attr("id",function(d,i){
            return media+"t"+i
        })
        .attr("x",yOffset+yOffset/2)
        .attr("y",-1)
        .attr("class",media+"subtitle")
        .text(function(d){
            return d.cat;
        })

    legend.append("rect")
        .attr("x",0)
        .attr("y",-yOffset+yOffset/3)
        .attr("width",(yOffset/100)*120)
        .attr("height",(yOffset/100)*60)
        .style("fill", function(d,i){return colours(i)})

    legend.attr("transform",function(d,i){
        if (legAlign=='hori') {
            var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
            if (i>0) {
                var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
            }
            else {gWidth=0};
            legendyOffset=legendyOffset+gWidth;
            return "translate("+(legendyOffset)+","+(gHeigt)+")";  
        }
        else {
            var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
            return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
    })

  function pointer() {
    this.style.cursor='pointer'
  }

  function moveLegend() {
    var dX = d3.event.x; // subtract cx
    var dY = d3.event.y; // subtract cy
    d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

  }
  function colculateTicksize(align, offset) {
      if (align=="right") {
          return plotWidth-margin.left - offset + 2
      }
      else {return plotWidth-margin.right - offset}
  }

}