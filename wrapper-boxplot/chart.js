
function makeChart(data,stylename,media,yMin,yMax,yAxisHighlight,plotpadding,legAlign,yAlign, numTicksy){

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

    yMin=Math.min(yMin,d3.min(d3.values(data[0])));
    yMax=Math.max(yMax,d3.max(d3.values(data[0])));

    var values = {};
    for (i = 0; i < seriesNames.length; i++) {
        values[seriesNames[i]]=data.map(function(d){return +d[seriesNames[i]]})
    }

    var plotData=seriesNames.map(function(d){
        values[d] = values[d].sort(function(a, b) { 
            return parseFloat(a) - parseFloat(b); 
        });
        yMin=Math.min(yMin,d3.min(values[d]));
        yMax=Math.max(yMax,d3.max(values[d]));

        return {
            cat: d,
            values: values[d],
            q1: d3.quantile(values[d], .25),
            median: d3.quantile(values[d], .5),
            q3: d3.quantile(values[d], .75),
            min: d3.min(values[d]),
            max: d3.max(values[d]),
        }
    })

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

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        })
    .classed(media+"origin",true);

    var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotWidth],.6);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickSize(yOffset/2)
    .orient("bottom");

    xScale.domain(plotData.map(function(d) { return d.cat;}));
    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (h-margin.bottom) + ")")
      .call(xAxis);

    plot.selectAll("."+media+"bar")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) { return d.cat+"-"+d.value; })
        .attr("transform",function(){
                return "translate("+(margin.left)+","+margin.top+")"
            })
        .call(function(parent){

        ///Put on the whiskers
        parent.append("line")
            .attr("class", media+"whiskers")
            .attr("x1", function(d,i) {return xScale(d.cat)})
            .attr("y1", function(d) { return yScale(d.min)})
            .attr("x2", function(d,i) {return xScale(d.cat)+(xScale.rangeBand())})
            .attr("y2", function(d) { return yScale(d.min)})
        parent.append("line")
            .attr("class", media+"whiskers")
            .attr("x1", function(d,i) {return xScale(d.cat)})
            .attr("y1", function(d) { return yScale(d.max)})
            .attr("x2", function(d,i) {return xScale(d.cat)+(xScale.rangeBand())})
            .attr("y2", function(d) { return yScale(d.max)})
        parent.append("line")
            .attr("class", media+"whiskers")
            .attr("x1", function(d,i) {return xScale(d.cat)+(xScale.rangeBand()/2)})
            .attr("y1", function(d) { return yScale(d.min)})
            .attr("x2", function(d,i) {return xScale(d.cat)+(xScale.rangeBand()/2)})
            .attr("y2", function(d) { return yScale(d.max)})
        parent.append('rect')
                .style("fill", function (d) {return colours[0]})
                .attr("id",function(d) { return d.cat;})
                .attr("class",media+"bars")
                .attr("x", function(d) { return xScale(d.cat); })
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(d.q1)-(yScale(d.q1)-yScale(d.q3))})
                .attr("height", function(d){return yScale(d.q1)-yScale(d.q3); })
        parent.append("line")
            .attr("class", media+"whiskers")
            .attr("x1", function(d,i) {return xScale(d.cat)})
            .attr("y1", function(d) { return yScale(d.median)})
            .attr("x2", function(d,i) {return xScale(d.cat)+(xScale.rangeBand())})
            .attr("y2", function(d) { return yScale(d.median)})




        })
        







    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }


    

}