
function scatterplot(data,stylename,media,plotpadding,legAlign,yAlign, yMin,yMax,xMin,yMax,numTicksx,numTicksx, yAxisHighlight,axisLabel,xaxisLabel,yaxisLabel,lineSmoothing){
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'name'; });
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

    //determine categories
    var categories = d3.nest()
        .key(function(d){return d.cat})
        .entries(data)
        .map(function(d){return d.key});

    
    //calculate range of time series 
    var xDomain = d3.extent(data, function(d) {return +d.x;});
    var yDomain = d3.extent(data, function(d) {return +d.y;});

    xDomain[0]=Math.min(xMin,xDomain[0]);
    xDomain[1]=Math.max(xMax,xDomain[1]);
    yDomain[0]=Math.min(yMin,yDomain[0]);
    yDomain[1]=Math.max(yMax,yDomain[1]);

    var plotData = d3.nest()
        .key(function(d) { return d.cat;})
        .sortValues(function(a,b) { return a.x - b.x})
        .entries(data)

    var lineData=plotData.map(function(d){
            let seriesKey=d.key
            let filtered=d.values.filter(function(d){
                return d.cat==seriesKey
            })
            return filtered
        })

    plotData=plotData.map(function(d,i){
        return{
            key:d.key,
            values:d.values,
            lineValues:lineData[i]
        }
    })

    //console.log(plotData)

    var yScale=d3.scale.linear()
        .domain(yDomain)
        .range([plotHeight,0])

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient("left")

    var yLabel=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxis);

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width;
    var yticksize=colculateTicksize(yAlign, yLabelOffset);

    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
                return "translate("+(w-margin.right)+","+margin.top+")"
            });

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.scale.linear()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(numTicksx)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"
        })
        .call(xAxis);

    if (axisLabel) {
        plot.append("text")
            .attr("class",media+"subtitle")
            .attr("text-anchor", "end")
            .attr("x", plotWidth+margin.left)
            .attr("y", plotHeight+margin.top-(yOffset/4))
            .text(xaxisLabel);
        plot.append("text")
            .attr("class",media+"subtitle")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", margin.top-yOffset/2)
            .text(yaxisLabel);
        }

    var getLine = d3.svg.line()
        .x(function(d,i) { 
            return xScale(+d.x); 
        })
        .y(function(d) { 
            return yScale(+d.y); 
        })
        .interpolate(lineSmoothing)

    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter()
        .append("g")
        .attr("id", media+(function(d) {return d.key}))
        .attr("transform", function(d) {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"; })
        .attr("class", media+"category")
        .call(addLines)
        .call(addDots)

    function addDots(parent) {
        //console.log(parent)
        parent.selectAll('circles')
        .data(function(d) {
            return d.values
        })
        .enter()
        .append('circle')
        .attr("cx",function(d){return xScale(d.x)})
        .attr("cy",function(d){return yScale(d.y)})
        .attr("r",yOffset/4)
        .attr("fill",function(d) {
            return colours[categories.indexOf(d.cat)]})

    }

    function addLines(parent) {
        var line=parent.append("g")
        line.selectAll("."+media+"line")
        .data(function(d) {
            let values=[d.lineValues]
            return values
        })
        .enter()
        .call(function(parent){
            parent.append("path")
            .attr("class",media+"lines")
            .style("stroke", function(d,i){
                return colours[categories.indexOf(d[i].cat)]
            })
            .attr('d', function(d,i){
                return getLine(d); })

        })


    }


    //Legend
    if (categories[0]!="") {
        var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(categories)
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
            .attr("x",yOffset/2-yOffset/5+5)
            .attr("y",yOffset/5)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })

        legend.append("circle")
            .attr("cx",0)
            .attr("cy",0)
            .attr("r",yOffset/2-yOffset/5)
            .style("fill", function(d,i){return colours[i]})

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
                return "translate(0,"+((i*yOffset+margin.top)+yOffset/2)+")"};
        })

    }


    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        console.log(this.getBBox().width)
        var dX = d3.event.x-(this.getBBox().width/2);// subtract cx
        var dY = d3.event.y-(this.getBBox().height);// subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}