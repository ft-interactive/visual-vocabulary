
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign, numTicksy){

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

    console.log("loaded data",data)
    var yMin=d3.min(d3.values(data[0]));
    var yMax=d3.max(d3.values(data[0]));

    var values = {};
    for (i = 0; i < seriesNames.length; i++) {
        values[seriesNames[i]]=data.map(function(d){return +d[seriesNames[i]]})
    }

    var dataset=seriesNames.map(function(d){
        yMin=Math.min(yMin,d3.min(values[d]))
        yMax=Math.min(yMax,d3.max(values[d]))
        return {
            cat: d,
            values: values[d],
            q1: d3.quantile(values[d], .25),
            median: d3.quantile(values[d], .5),
            q3: d3.quantile(values[d], .5),
            min: d3.min(values[d]),
            max: d3.max(values[d]),
        }
    })

    console.log("dataset",dataset)

    var yScale = d3.scale.linear()
        .range([plotHeight, 0])
        .domain([yMin, yMax]);

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient(yAlign)
    .ticks(numTicksy);

    var yLabel=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width
    var yticksize=colculateTicksize(yAlign, yLabelOffset);

    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
            if (yAlign=="right"){
                return "translate("+(margin.left)+","+margin.top+")"
            }
            else return "translate("+(w-margin.right)+","+margin.top+")"
            })





    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }


    

}