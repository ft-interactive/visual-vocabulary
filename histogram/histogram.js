
function makeHistogram(data,stylename,media,yMax,plotpadding,legAlign,yAlign,numTicksy,numTicksx,yHighlight){

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
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.fillcolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered
    // based on https://bl.ocks.org/mbostock/1624660

    var plotData=data.map(function(d,i) { return {
        category: +d.category,
        value: +d.value
        }
    });

    // Normalize each bin to so that height = quantity/width;
    // see http://en.wikipedia.org/wiki/Histogram#Examples
    for (var i = 1, n = plotData.length, plotData; i < n; i++) {
        bin = plotData[i];
        bin.offset = plotData[i - 1].category;
        bin.width = bin.category - bin.offset;
        bin.height = bin.value / bin.width;
    }

    plotData.shift();

    console.log(plotData);

    var yScale = d3.scale.linear()
        .range([plotHeight, 0]);

    // Set the scale domain.
    var xDomain=[0, d3.max(plotData.map(function(d) { return d.offset + d.width; }))];
    yMax=Math.max(yMax,d3.max(plotData.map(function(d) { return d.height; })))

    yScale.domain([0, yMax]);


    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient(yAlign)

    var yLabel=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxis);

    var yLabelOffset=yLabel.node().getBBox().width
    //console.log("offset= ",yLabelOffset)
    var yticksize=colculateTicksize(yAlign, yLabelOffset);
    //console.log(yticksize);

    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
            if (yAlign=="right"){
                return "translate("+(margin.left)+","+margin.top+")"
            }
            else return "translate("+(w-margin.right)+","+margin.top+")"
            })

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.scale.linear()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)])

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(numTicksx)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(h-margin.bottom)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
            })
        .call(xAxis);

    plot.selectAll("."+media+"fill")
        .data(plotData)
        .enter().append("rect")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
        })
        .attr("class", media+"bin")
        .attr("x", function(d) { return xScale(d.offset); })
        .attr("width", function(d) { return xScale(d.width) - 1; })
        .attr("y", function(d) { return yScale(d.height); })
        .attr("height", function(d) { return plotHeight - yScale(d.height); })
        .style("fill",colours[0])

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }
}