function columnChart(data,stylename,media,plotpadding,legAlign, logScale, logScaleStart, yMin,yMax,yHighlight, markers, numTicksy, ticks, yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'cat'; });
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom

    var colours=stylename.fillcolours;

    var yScale = d3.scale.linear()
        .range([plotHeight, 0]);

    var plotData=data.map(function(d) {
        return {
            cat:d.cat,
            bands:getBands(d)
        }
    });

    function getBands(el) {
        var bands=seriesNames.map(function(name) {
            return {
                name: name,
                value:+el[name]
            }
        });
       return bands
    }

    var yMin=Math.min(yMin,d3.min(plotData, function(d) { return d3.min(d.bands, function(d) { return d.value; })})); 
    var yMax=Math.max(yMax,d3.max(plotData, function(d) { return d3.max(d.bands, function(d) { return d.value; })})); 

    yScale.domain([yMin, yMax]);

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

    var x0 = d3.scale.ordinal()
    .rangeBands([0, plotWidth-yLabelOffset], .1);

    var x1 = d3.scale.ordinal();

    var xAxis = d3.svg.axis()
        .scale(x0)
        .tickSize(yOffset/2)
        .orient("bottom");

    x0.domain(data.map(function(d) { return d.cat; }));
    x1.domain(seriesNames)
    .rangeBands([0, x0.rangeBand()]);    

    var xlabels=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
            })
        .call(xAxis);

    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter().append("g")
        .attr("class", media+"category")
        .attr("transform", function(d) { return "translate(" + (x0(d.cat)+(margin.left)) + ",0)"; });

    category.selectAll("rect")
        .data(function(d) { return d.bands; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .attr("y", function(d,i) {
            //console.log(i, "value",d.value)
            //console.log("Scale",yScale(Math.max(0, d.value)));
            return yScale(Math.max(0, d.value))})
          .attr("height", function(d) {return (Math.abs(yScale(d.value) - yScale(0))); })
          .style("fill", function(d,i) { return colours[i] })
          .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
            });

    // //create a legend first
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