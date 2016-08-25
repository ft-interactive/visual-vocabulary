
function stackedChart(data,stylename,media,plotpadding,legAlign,yAlign, yMin, yMax,yAxisHighlight, numTicksy){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'cat'; });
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

    var plotData=data.map(function(d) {
        return {
            cat:d.cat,
            bands:getBands(d),
        }
    });

    function getBands(el) {
        console.log(el)
        let posCumulative=0;
        let negCumulative=0;
        let baseY=0
        let basey1=0
        var bands=seriesNames.map(function(name,i) {
            if(el[name]>0){
                console.log("pos",posCumulative)
                baseY1=posCumulative
                posCumulative = posCumulative+(+el[name]);
                baseY=posCumulative;
            }
            if(el[name]<0){
                console.log("neg",negCumulative);
                baseY1=negCumulative
                negCumulative = negCumulative+(+el[name]);
                baseY=negCumulative;
                if (i<1){baseY=0;baseY1=negCumulative}
            }
            return {
                name: name,
                y: baseY,
                y1:baseY1,
                height:+el[name]
            }
        });
        yMin=Math.min(yMin,negCumulative)
        yMax=Math.max(yMax,posCumulative)
       return bands
    }

    console.log("plotData",plotData)
    console.log(yMin,yMax)

    var yScale = d3.scale.linear()
        .range([plotHeight, 0])
        .domain([yMin,yMax]);

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
        .rangeBands([0, plotWidth-yLabelOffset],.3);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    xScale.domain(data.map(function(d) { return d.cat;}));

    var xLabels=plot.append("g")
        .attr("class", media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(h-margin.bottom)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
        })
        .call(xAxis);

    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter().append("g")
        .attr("class", media+"category")
        .attr("transform", function(d) { return "translate(" + (xScale(d.cat)+(0)) + ",0)"; });

    category.selectAll("rect")
        .data(function(d) { return d.bands; })
        .enter().append("rect")
        .attr("width", xScale.rangeBand())
        .attr("x", function(d) { return xScale(d.name)})
        .attr("y", function(d) {
            console.log(d.name,d.y, d.y1,"y=",Math.max(d.y, d.y1))
            { return yScale(Math.max(d.y, d.y1))}
        })
        .attr("height", function(d) {
            console.log("height",d.height)
            console.log("xx",Math.abs(d.y-d.y1))
            return Math.abs(yScale(0)-yScale(d.height))
        })
        .style("fill", function(d,i) { return colours[i] })
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
        });



    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}