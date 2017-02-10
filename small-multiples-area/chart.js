
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

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
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

    

}