function waterfallChart(data,stylename,media,plotpadding,legAlign,lineSmoothing, logScale, logScaleStart,yHighlight, markers, numTicksy, numTicksx, yAlign, markers){

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
    //Work out xdomain
    console.log(data)
    var xMin=0;
    var xMax=0

     var cumulative =0;

    function extents(last,value) {
        console.log("last=",last,"value=",value)
        console.log("cumulative in function",cumulative)
        if (last==0){
            return [0,value]
        }
        else {
            if (value>0){
                console.log("last+value",last+value)
                return [last, cumulative+value]
            } 
            else {
                console.log("last",last)
                console.log(Math.abs(value))
                return [last+(value), last +(value)+Math.abs(value)]}    
        }
    }


    function group(value) {
        return value < 0 ? 'negative' : 'positive';
    }

    var plotData=data.map(function(d) {
        console.log(d.cat,"/////////////////////////")
        var extent = extents(cumulative,+d.value);
        cumulative=extent[1];
        console.log("extent=",extent)
        console.log(d.value)
        if(d.value<0){
            console.log("<")
            cumulative=extent[0];
        }
        else {
            console.log(">")
            cumulative=extent[1]};
        console.log("cumulative",cumulative)

        return {
            cat:d.cat,
            value:  +d.value,
            start: extent[0],
            end: extent[1],
            group: group(d.value)
        }
    })

    plotData.push({
        cat: 'total',
        value:100,
        start: 0,
        end: d3.sum(data, function(d){
            return d.value
        }),
        group: null,
        value: 0
    })

    console.log("transformed data", plotData)
    console.log("xDomain",xMin,xMax)

    var yScale = d3.scale.linear()
        .range([plotHeight, 0]);

    var min=d3.min(data, function(d) { return +d.value;})
    var max=d3.max(data, function(d) { return +d.value;})

    //var max=d3.max(data, function(d,i) { return +d.value;});
    yScale.domain([min, max]);

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
        })
    .classed(media+"origin",true);

    var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotWidth],.3);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

    xScale.domain(data.map(function(d) { return d.cat;}));


    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (h-margin.bottom) + ")")
      .call(xAxis);

    plot.selectAll("."+media+"bar")
    .data(data)
    .enter()
        .append("g")
        .attr("id",function(d) { return d.cat+"-"+d.value; })
        .attr("transform",function(){
                return "translate("+(margin.left)+","+margin.top+")"
            })
        .call(function(parent){
            parent.append('rect')
                .style("fill", function (d) {
                    return colours(d.group)
                })
                .attr("id",function(d) { return d.cat+"-"+d.value; })
                .attr("class",media+"bars")
                .attr("x", function(d) { return xScale(d.cat); })
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(Math.max(0, d.value))})
                .attr("height", function(d) {return (Math.abs(yScale(d.value) - yScale(0))); })
                .on("mouseover",pointer)
                .on("click",function(d){
                    var elClass = d3.select(this)
                    if (elClass.attr("class")==media+"bars") {
                        d3.select(this).attr("class",media+"barshighlight");
                        console.log(colours.range()[0])
                        d3.select(this).style("fill",colours.range()[7])
                    }
                    else{var el=d3.select(this)
                        el.attr("class",media+"bars");
                        d3.select(this).style("fill",colours.range()[0])
                    }
                })
            if (markers) {
                parent.append("text")
                .attr("class", media+"label")
                .style("text-anchor","middle")
                .text(function(d) {return d.value;})
                .attr("x", function(d) { return xScale(d.cat)+(xScale.rangeBand()/2)})
                .attr("y", function(d) {
                    if(d.value>0) {
                        return yScale(d.value)+yOffset+yOffset/2
                    }
                    else {
                        return yScale(d.value)-yOffset/2}
                });
                var clear = yLabel.selectAll(".tick").filter(function(d, i) {
                    return d!=originValue
                })
                clear.remove()
            }
        });

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