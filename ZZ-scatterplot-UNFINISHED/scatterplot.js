
function scatterplot(data,stylename,media,plotpadding,legAlign,yAlign){

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
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    //calculate range of time series 
    var xDomain = d3.extent(data, function(d) {return +d.x;});
    var yDomain = d3.extent(data, function(d) {return +d.y;});

    xDomain[0]=Math.min(xMin,xDomain[0])
    xDomain[1]=Math.max(xMax,xDomain[1])
    yDomain[0]=Math.min(xMin,yDomain[0])
    yDomain[1]=Math.max(xMax,yDomain[1])

    var plotData = d3.nest()
        .key(function(d) { return d.cat; })
        .entries(data);

    console.log(plotData)
    

}