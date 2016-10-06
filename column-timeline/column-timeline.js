function columnChart(data, stylename, media,yMin,yMax,yAxisHighlight, chartpadding,legAlign,labels, numTicksy, yAlign,interval,minAxis, ticks){
    console.log(ticks)
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    var groupNames=[]
    for(i = 0; i< data.length; i++){    
        if(groupNames.indexOf(data[i].group) === -1){
            groupNames.push(data[i].group);        
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
    var margin=chartpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0];

    var colours= d3.scale.ordinal()
      .domain(groupNames)
      .range(stylename.fillcolours);

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom

    yMin=Math.min(yMin,d3.min(data, function(d) { return +d.value;}))
    yMax=Math.max(yMax,d3.max(data, function(d) { return +d.value;}))
    
    console.log(yMin,yMax)

    var yScale = d3.scale.linear()
        .range([plotHeight, 0])
        .domain([yMin,yMax]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient(yAlign)

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

    yLabel.selectAll('text')
        .attr("style", null)
        .attr("x",yticksize+(yLabelOffset*.8))

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    var xDomain = d3.extent(data, function(d) {return d.date;});

    var xScale = d3.time.scale()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
            })
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
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
                })
            .call(xAxisMinor);
    }
    plot.selectAll("."+media+"bar")
        .data(data)
        .enter()
        .append("g")
        .attr("id",function(d) { return d.date+"-"+d.value; })
        .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
            })
        .call(function(parent){
            parent.append('rect')
                .style("fill", function (d) {
                    return colours(d.group)
                })
                .attr("id",function(d) { return d.date+"-"+d.value; })
                .attr("class",media+"fill")
                .attr("x", function(d) { return xScale(d.date) - (plotWidth/data.length)/2; })
                .attr("width", plotWidth/data.length)
                .attr("y", function(d) { return yScale(Math.max(0, d.value))})
                .attr("height", function(d) {return (Math.abs(yScale(d.value) - yScale(0))); })
                .on("mouseover",pointer)
                .on("click",function(d){
                    var elClass = d3.select(this)
                    if (elClass.attr("class")==media+"fill") {
                        d3.select(this).attr("class",media+"highlight");
                        console.log(colours.range()[0])
                        d3.select(this).style("fill",colours.range()[6])
                    }
                    else{var el=d3.select(this)
                        el.attr("class",media+"fill");
                        d3.select(this).style("fill",colours.range()[0])
                    }
                })

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
    //console.log(groupNames[0])
    if (groupNames[0]!="-") {
        var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(groupNames)
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