function columnChart(data,stylename,media,plotpadding,legAlign,lineSmoothing, logScale, logScaleStart,yHighlight, markers, numTicksy, numTicksx, yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    var seriesNames=[]
    for(i = 0; i< data.length; i++){    
        if(seriesNames.indexOf(data[i].party) === -1){
            seriesNames.push(data[i].party);        
        }        
    }

    //Select the plot space in the frame from which to take measurements
    var chart=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.fillcolours;

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom

    var yScale = d3.scale.linear()
    .range([plotHeight, 0]);

    //var max=d3.max(data, function(d,i) { return +d.value;});
    yScale.domain([0, d3.max(data, function(d,i) { return +d.value;})]);

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
            return d==originValue || d==yHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotWidth], .1);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");


    xScale.domain(data.map(function(d) { return d.cat;}));

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (h-margin.bottom) + ")")
      .call(xAxis);

    plot.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .style("fill", function (d) {
            if (d.highlight) {
                return colours[1]
            }
            else {return colours[0]}
        })
      .attr("x", function(d) { return xScale(d.cat); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return plotHeight - yScale(d.value); })
      .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left)+","+(margin.top)+")"}
        })

    
    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }


    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }





}