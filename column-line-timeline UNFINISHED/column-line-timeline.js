function columnChart(data, stylename, media,yMin,yMax, yMin1,yMax1, chartpadding,legAlign,labels, numTicksy, yAlign,interval,minAxis, ticks){
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
        .range([0,(plotWidth-yLabelLOffsetL-yLabelLOffsetR)]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            return "translate("+(margin.left+yLabelLOffsetL+yLabelLOffsetR)+","+(plotHeight+margin.top)+")"})
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
                return "translate("+(margin.left+yLabelLOffsetL+yLabelLOffsetR)+","+(plotHeight+margin.top)+")"})
            .call(xAxisMinor);
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