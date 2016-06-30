function barChart(data,stylename,media,xMin,xMax,xAxisHighlight,plotpadding,legAlign,labels,numTicksx){

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
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0];

    var colours= d3.scale.ordinal()
      .domain(groupNames)
      .range(stylename.fillcolours);

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom
    var drag = d3.behavior.drag().on("drag", moveLegend);

    var yScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotHeight],.2)
    .domain(data.map(function(d) { return d.cat;}));

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0);

    var yLabel=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width

    //yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+margin.top+")"
            })
        
    xMin=Math.min(xMin,d3.min(data, function(d) { return +d.value;}))
    xMax=Math.max(xMax,d3.max(data, function(d) { return +d.value;}))

    var xScale = d3.scale.linear()
        .range([yLabelOffset, plotWidth])
        .domain([xMin,xMax]);

    //d3.max(data, function(d) { return +d.value;})

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==xAxisHighlight;
        }).classed(media+"origin",true);

    plot.selectAll("."+media+"fill")
    .data(data)
    .enter()
        .append("g")
        .attr("id", function(d) {return d.cat +"-"+d.value})
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+margin.top+")"
            })
        .call(function(parent){
            parent.append('rect')
                .attr("id", function(d) {return d.cat +"-"+d.value})
                .style("fill", function (d) {
                    return colours(d.group)
                })
                .attr("class",media+"bars")
                .attr("x", function(d) { return xScale(Math.min(0, d.value))-yLabelOffset; })
                .attr("width", function(d) { return Math.abs(xScale(d.value) - xScale(0)); })
                .attr("y", function(d) { return yScale(d.cat); })
                .attr("height", function(d) {  return yScale.rangeBand() })
                .on("mouseover",pointer)
                .on("click",function(d){
                    var elClass = d3.select(this)
                    if (elClass.attr("class")==media+"bars") {
                        d3.select(this).attr("class",media+"barshighlight");
                        d3.select(this).style("fill",colours.range()[6])
                    }
                    else{var el=d3.select(this)
                        el.attr("class",media+"bars");
                        d3.select(this).style("fill",colours.range()[0])
                    }
                })
                if (labels) {
                parent.append("text")
                .attr("class", media+"label")
                .style("text-anchor","end")
                .text(function(d) {return d3.format(".1f")(d.value);})
                .attr("x", xScale(0)-yLabelOffset/4)
                .attr("y", function(d) { return yScale(d.cat)+(yScale.rangeBand()-yOffset*.2    ); });

                var clear = xLabels.selectAll(".tick").filter(function(d, i) {
                    return d!=originValue
                })
                clear.remove()
            }
        })

    

    //create a legend first 
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