
function areaChart(data, stylename ,media, yMin, yMax ,yAxisHighlight, numTicksy, plotpadding,legAlign,yAlign, ticks,minAxis){

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

    //calculate range of y axis series data
    data.forEach(function(d,i){
        seriesNames.forEach(function(e){
            if (d[e]){
                yMin=Math.min(yMin,d[e]);
                yMax=Math.max(yMax,d[e]);
            }
        });         
    });
    var yDomain=[yMin,yMax];
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
                return {date: d.date,
                    y: +d[name]};
            })
        };
    }));

    //work out max value for yScale.domain
    plotData.map(function(d){
        d.values.forEach(function(d,i){
            yMax=Math.max(yMax,(d.y0 + d.y))
        })
    })
    //defines the yScale.domain with new max value
    yScale.domain([0,yMax])
    //Define the yScale
    var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(numTicksy)
    .orient(yAlign)//Note that yAlign is passed rom the index to determine which side the scale is plotted
    //Roughly plot the yScale on the page without positioning it correctly
    var yLabel=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxis);

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width
    //redraw the yScale on the page with the ticks on it and position it on the page
    var yticksize=colculateTicksize(yAlign, yLabelOffset);


    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
            if (yAlign=="right"){
                return "translate("+(margin.left)+","+margin.top+")"
            }
            else return "translate("+(w-margin.right)+","+margin.top+")"
            })

    //identify 0 line if there is one or an index line like 100 to make bodler or solid
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        })
    .classed(media+"origin",true);
    //Now that the yAxis is on the page we can draw the xAxis in the remaining space
    var xDomain = d3.extent(data, function(d) {return d.date;});
    //Define xScale
    var xScale = d3.time.scale()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)])
    //Define xAxis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)//Half the size of the Subtitle text
        .orient("bottom");
    //Plot and position on the page
    var xLabels=plot.append("g")
        .attr("class", media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(h-margin.bottom)+")"
            }
            else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
        })
      .call(xAxis);

    if(minAxis) {
        var xAxisMinor = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.minor)
        .tickSize(yOffset/4)
        .orient("bottom");

        var xLabelMinor=plot.append("g")
            .attr("class",media+"minorAxis")
            .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(h-margin.bottom)+")"
                }
                else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
            })
            .call(xAxisMinor);
    }
    
    //Add group to plot the areas
    var areas = plot.selectAll(".browser")
        .data(plotData)
        .enter().append("g")
    //Add the svg path of the graph area and fill with colour
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
    //below here draws the legend
    if (seriesNames[0]!="x"){var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(seriesNames   )
            .enter()
            .append("g")
            .attr ("id",function(d,i){
                return media+"l"+i
            })

        var drag = d3.behavior.drag().on("drag", moveLegend);
        d3.select("#"+media+"legend").call(drag);
            
        legend.append("text")

            .attr("id",function(d,i){
                return media+"t"+i
            })
            .attr("x",yOffset+yOffset/5)
            .attr("y",0)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })

        legend.append("rect")
            .attr("x",0)
            .attr("y",-yOffset+yOffset/3)
            .attr("width",(yOffset/100)*85)
            .attr("height",(yOffset/100)*70)
            .style("fill", function(d,i){return colours(d)})

        legend.attr("transform",function(d,i){
            if (legAlign=='hori') {
                var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
                if (i>0) {
                    var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
                }
                else {gWidth=0};
                legendyOffset=legendyOffset+gWidth;
                return "translate("+(legendyOffset)+","+(gHeigt)+")";  
            }
            else {
                var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
                return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
        })

    }

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
