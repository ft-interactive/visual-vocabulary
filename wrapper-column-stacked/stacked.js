
function stackedChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'group'; });
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
    //Basecd on https://bl.ocks.org/mbostock/3886208
    console.log("data",data)
    //Makes copy of daa so that all calculations don't overwrite
    //the loaded data when more that one fram is needed
    var plotData=data.map(function(d){
        return {
            group:d.group
        };
    })
    plotData.forEach(function(d) {
        seriesNames.map(function(name) {
            var groupName=[name]
            return {groupName: +d[name]
            };
        });
    });

    plotData.forEach(function(d) {
        var y0 = 0;
        d.categories = seriesNames.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.categories[d.categories.length - 1].y1;
    });

    console.log("plotData",plotData)


    var yScale = d3.scale.linear()
        .rangeRound([plotHeight, 0]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient(yAlign);

    var yLabel=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)
    

}