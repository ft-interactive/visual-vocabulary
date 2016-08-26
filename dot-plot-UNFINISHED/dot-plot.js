
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign,xMin,xMax, xAxisHighlight, numTicksx){
    console.log(data)
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]);
    console.log("seriesNames",seriesNames)
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    var plotData=d3.nest()
        .key(function(d) { return d.group; })
        .entries(data);

    console.log(plotData)
    xMin=Math.min(xMin,d3.min(plotData, function(d) { return d3.min(d.values, function(d) { return d.value; })})); 
    xMax=Math.max(xMax,d3.max(plotData, function(d) { return d3.max(d.values, function(d) { return d.value; })})); 
    //console.log(xMin,xMax)

    var xScale = d3.scale.linear()
        .range([0, plotWidth])
        .domain([xMin,xMax]);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==xAxisHighlight;
        }).classed(media+"origin",true);

    var yScale = d3.scale.ordinal()
        .rangeBands([plotHeight, margin.bottom], .1)
        .domain(plotData.map(function(d) { return d.key; }));;
    
    console.log(yScale.domain())

    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter()
        .append("g")
        .attr("transform", function (d) {return "translate(0," + yScale(d.key) + ")"; })
        .attr("class", media+"category")
        .call(function(parent){

        parent.append('text')
            .attr("class", media+"Subtitle")
            .attr("y",0)
            .text(function(d){return d.key})

        parent.selectAll('circles')
        .data(function(d) {return d.values})
        .enter()
        .append('circle')
        .attr("class",media+"fill")
        .attr("cx",function(d){return xScale(d.value)})
        .attr("cy",yScale.rangeBand()*.4)
        .attr("r",10)
        .attr("transform", function (d) {return "translate("+(margin.left)+","+(0)+")"})
        .style("fill",colours[0])

        })







}