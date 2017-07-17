
function stackedChart(data,stylename,media,plotpadding,legAlign,yAlign, xMin, xMax,xAxisHighlight, labels, numTicksx,sort){

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
    //console.log("data",data)
    //Makes copy of daa so that all calculations don't overwrite
    //the loaded data when more that one fram is needed

    var plotData=data.map(function(d) {
        return {
            cat:d.cat,
            bands:getBands(d),
            total:d3.sum(getBands(d), function(d) { return d.height; })
        }
    });

    function getBands(el) {
        let posCumulative=0;
        let negCumulative=0;
        let baseX=0
        let baseX1=0
        var bands=seriesNames.map(function(name,i) {
            if(el[name]>0){
                baseX1=posCumulative
                posCumulative = posCumulative+(+el[name]);
                baseX=posCumulative;
            }
            if(el[name]<=0){
                baseX1=negCumulative
                negCumulative = negCumulative+(+el[name]);
                baseX=negCumulative;
                if (i<1){baseY=0;baseX1=negCumulative}
            }
            return {
                name: name,
                x: +baseX,
                x1:+baseX1,
                height:+el[name]
            }
        });
        xMin=Math.min(xMin,negCumulative)
        xMax=Math.max(xMax,posCumulative)
       return bands
    }

    //console.log("plotData",plotData)

    if (sort=="descending") {
        plotData.sort(function(a, b) { 
        return b.total - a.total; })//Sorts biggest rects to the left
    }
    if (sort=="ascending") {
        plotData.sort(function(a, b) { 
        return a.total - b.total; })//Sorts biggest rects to the left
    }
    if (sort=="alpha") {
        plotData.sort(function(a, b) {
   return a.cat.localeCompare(b.cat);
});
    }
    if (sort=="none") {
        //no sorting applied
    }

    var yScale = d3.scale.ordinal()
        .rangeBands([0, plotHeight],.2)
        .domain(plotData.map(function(d) { return d.cat;}));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickSize(0);

    var yLabel=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width
    
    yLabel
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+margin.top+")"
            })

    var xScale = d3.scale.linear()
        .range([yLabelOffset, plotWidth])
        .domain([xMin,xMax]);

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

    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter().append("g")
        .attr("class", media+"category")
        .attr("transform", function (d) {return "translate(0," + (yScale(d.cat))+ ")"; })
        .call(function(parent){
            parent.selectAll('rect')
            .data(function(d){return d.bands})
            .enter().append('rect')
            .attr("height", yScale.rangeBand())
            .attr("x", function(d) {
                { return xScale(Math.min(d.x, d.x1))}
            })
            .attr("y", function(d) { return yScale(d.name)})
            .attr("width", function(d) {
                return Math.abs(xScale(0)-xScale(d.height))
            })
            .style("fill", function(d,i) { return colours[i] })
            .attr("transform",function(){return "translate("+(margin.left)+","+(margin.top)+")"});
            
            if (labels) {
                parent.selectAll("text")
                .data(function(d) { 
                     console.log(d.bands)
                     return d.bands; })
                .enter().append("text")
                .attr("class", media+"labels")
                .style("text-anchor","end")
                .text(function(d) {return d.height;})
                .attr("x", function(d,i) {
                    return xScale(Math.max(d.x, d.x1))-(yOffset*.4)
                })
                .attr("y", function(d) {
                    console.log(yScale.rangeBand())
                    return yScale.rangeBand()*.6})
                .attr("transform",function(){return "translate("+(margin.left)+","+(margin.top)+")"});
                
                var clear = xLabels.selectAll(".tick").filter(function(d, i) {
                    return d!=originValue
                })
                clear.remove()
            }


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
    var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(seriesNames)
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
                return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
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