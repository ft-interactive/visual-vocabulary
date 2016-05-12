
function makeChart(data, stylename, media, chartpadding,legend, yAlign,yHighlight){

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
    var margin=chartpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=d3.scale.ordinal()
        .range(stylename.linecolours);

    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, plotWidth], .3);

    var y = d3.scale.linear()
        .range([plotHeight, 0]); 

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient(yAlign)

    //function to find all the positive values
    var positive_val = data.filter(function(d) { return d.value > 0; });
    console.log(JSON.stringify(positive_val));

    //function to calculate the sum of all the positive values
    var maxSum = positive_val.reduce(function(sum, d) {
       return sum + d.value;}, 0);
    console.log("The maximum sum is "+maxSum);

    //to calculate the new Domain by adding 120 
    var yaxisRange=maxSum+120;
    console.log("The y axis sum is "+yaxisRange);




    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}