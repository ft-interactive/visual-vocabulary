
function areaChart(data,stylename,media,plotpadding,legAlign,yAlign, yHighlight){

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
    
    var colours= d3.scale.ordinal()
        .domain(seriesNames)
        .range(stylename.fillcolours);
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered
    //Based on https://bl.ocks.org/mbostock/3885211
    console.log("data", data)

    //calculate range of y axis series data
    var min=6;
    var max=0;
    data.forEach(function(d,i){
        seriesNames.forEach(function(e){
            if (d[e]){
                min=Math.min(min,d[e]);
                max=Math.max(max,d[e]);
            }
        });         
    });
    var yDomain=[min,max];
    //calculate range of time series 
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var yDomain;


    var yScale = d3.scale.linear()
        .range([plotHeight, 0])
        .domain(yDomain);

    var area = d3.svg.area()
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return yScale(d.y0); })
        .y1(function(d) { return yScale(d.y0 + d.y); });

    var stack = d3.layout.stack()
        .values(function(d) { return d.values; });

    var plotData = stack(seriesNames.map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {date: d.date, y: +d[name]};
            })
        };
    }));

    console.log(plotData)

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient(yAlign)

    var yLabel=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxis);

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width
    //redraw the yScale on the page with the ticks on it and position it on the page
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
        })
    .classed(media+"origin",true);

    var xDomain = d3.extent(data, function(d) {return d.date;});
    console.log("xDomain",xDomain)

    var xScale = d3.time.scale()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)])

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabels=plot.append("g")
        .attr("class", media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(h-margin.bottom)+")"
            }
            else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
        })
      .call(xAxis);

    var areas = plot.selectAll(".browser")
        .data(plotData)
        .enter().append("g")

    areas.append("path")
      .attr("class", media+"area")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d) { return colours(d.name)})
      .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
            })







    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}
