function columnChart(data, stylename, media,yMin,yMax, yMin1,yMax1, chartpadding,legAlign,labels,lineSmoothing, numTicksy, yAlign,interval,minAxis, ticks){
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'barDate'&& d != 'lineDate' && d != 'highlight' ; });
    console.log("seriesNames", seriesNames)
    //Select the plot space in the frame from which to take measurements
    var chart=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=chartpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0];

    var colours=stylename.fillcolours

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom;

    var barData=data.map(function(d) {
        var e=seriesNames[0]
        return{
            date:d.barDate,
            value:+d[e]
        }
    })

    barData=barData.filter(function(d){
        if (d.date !== null){
            return{
                date:d.date,
                value:d.value
            }
            return false
        }
    })

    var lineData=data.map(function(d) {
        var e=seriesNames[1]
        return{
            date:d.lineDate,
            value:+d[e]
        }
    })
    lineData=lineData.filter(function(d){
        if (d.date !== null){
            return{
                date:d.date,
                value:d.value
            }
            return false
        }
    })
    var yDomain = d3.extent(barData, function(d) {return d.value;});
    var yDomain1 = d3.extent(lineData, function(d) {return d.value;});

    yDomain[0]=Math.min(yMin,yDomain[0])
    yDomain[1]=Math.max(yMax,yDomain[1])
    yDomain1[0]=Math.min(yMin1,yDomain1[0])
    yDomain1[1]=Math.max(yMax1,yDomain1[1])

    var yScaleL = d3.scale.linear()
        .range([plotHeight, 0])
        .domain(yDomain);

    var yScaleR = d3.scale.linear()
        .range([plotHeight, 0])
        .domain(yDomain1);

    var yAxisL = d3.svg.axis()
        .scale(yScaleL)
        .ticks(numTicksy)
        .tickSize(yOffset)
        .orient("left")

    var yAxisR = d3.svg.axis()
        .scale(yScaleR)
        .ticks(numTicksy)
        .tickSize(yOffset)
        .orient("right")

    var yLabelL=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxisL)

    var yLabelR=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxisR)

    yLabelL.selectAll('text')
        .attr("style", null);
    yLabelR.selectAll('text')
        .attr("style", null)
        .attr("x", yOffset*2)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelLOffsetL=yLabelL.node().getBBox().width
    yLabelL
        .attr("transform",function(){
            return "translate("+(yLabelLOffsetL)+","+margin.top+")"
            })

    var yLabelLOffsetR=yLabelR.node().getBBox().width
    yLabelR
        .attr("transform",function(){
            return "translate("+(plotWidth-yLabelLOffsetR)+","+margin.top+")"
            })


    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue;
        }).classed(media+"origin",true);

    var xDomain = d3.extent(data, function(d) {return d.barDate;});

    var xScale = d3.time.scale()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelLOffsetL-yLabelLOffsetR-margin.right)]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            return "translate("+(margin.left+yLabelLOffsetL)+","+(plotHeight+margin.top)+")"})
        .call(xAxis);

    xLabel.selectAll('text')
        .attr("style", null)

    if(minAxis) {
        var xAxisMinor = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.minor)
        .tickSize(yOffset/4)
        .orient("bottom");

        var xLabelMinor=plot.append("g")
            .attr("class",media+"minorAxis")
            .attr("transform",function(){
                return "translate("+(margin.left+yLabelLOffsetL)+","+(plotHeight+margin.top)+")"})
        .call(xAxisMinor);
    }

    var bar=plot.append("g")
        .attr("id","bar")
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"})  
    bar.selectAll("."+media+"bar")
        .data(barData)
        .enter()
        .call(function(parent){
            parent.append('rect')
                .style("fill",colours[1])
                .attr("id",function(d) { return d.date+"-"+d.value; })
                .attr("class",media+"fill")
                .attr("x", function(d) { return xScale(d.date) - (plotWidth/barData.length)/2; })
                .attr("width", plotWidth/barData.length*.8)
                .attr("y", function(d) { return yScaleL(Math.max(0, d.value))})
                .attr("height", function(d) {return (Math.abs(yScaleL(d.value) - yScaleL(0))); })
    })

    var lines= []
    lines.push(lineData)
    console.log (lineData)


    var getLine = d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.date); 
        })
        .y(function(d) { 
            return yScaleR(d.value); 
        })
        .interpolate(lineSmoothing)

    var line = plot.append("g")
        .attr("id","line")
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"})
        line.selectAll("."+media+"line")
        .data(lines)
        .enter()
        .call(function(parent){
            parent.append("path")
            .attr("class",media+"lines")
            .style("stroke", colours[0])
            .attr('d', function(d,i){
                //console.log(d)
                return getLine(d); })

        })

    //Add labels so that the preflight script in illustrator will work
    d3.selectAll(".printxAxis text")
    .attr("id","xAxisLabel")
    d3.selectAll(".printyAxis text")
    .attr("id","yAxisLabel")
    d3.selectAll(".printyAxis line")
    .attr("id","yAxisTick")
    d3.selectAll(".printxAxis line")
    .attr("id","xAxisTick")
    d3.selectAll(".printminorAxis line")
    .attr("id","minorTick")

    d3.selectAll(".domain").remove()

    //create a legend first
    var legend = plot.append("g")
        .attr("id",media+"legend")
        .on("mouseover",pointer)
    var drag = d3.behavior.drag().on("drag", moveLegend);
        d3.select("#"+media+"legend").call(drag);
    
    var barTextL=legend.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("class",media+"subtitle")
        .text(seriesNames[0])

    var legOffset=barTextL.node().getBBox().width

    legend.append("rect")
        .attr("x",legOffset+(yOffset/2))
        .attr("y",-yOffset+yOffset/3)
        .attr("width",(yOffset/100)*85)
        .attr("height",(yOffset/100)*70)
        .style("fill", colours[1])

    var barTextR=legend.append("text")
        .attr("x",plotWidth)
        .attr("y",0)
        .attr("class",media+"subtitle")
        .style("text-anchor","end")
        .text(seriesNames[1])

    var legOffset=barTextR.node().getBBox().width

    legend.append("line")
        .attr("stroke",function(d,i){
            return colours[i];  
        })
        .attr("x1",plotWidth-legOffset-(yOffset/2))
        .attr("x2",plotWidth-legOffset-(yOffset/2)-yOffset)
        .attr("y1",-5)
        .attr("y2",-5)
        .attr("class",media+"lines")





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