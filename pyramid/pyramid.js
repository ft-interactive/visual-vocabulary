
function pyramid(data,stylename,media,plotpadding,legAlign,yAlign,xmin,xmax,numTicksx, xAxisHighlight){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'category'; });
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
    
    let plotData=data;
    //console.log(plotData);
    console.log(seriesNames);

    var yScale = d3.scale.ordinal()
    .rangeBands([0, plotHeight],.05)
    .domain(data.map(function(d) { return d.category;}));
    
    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("right")
    .tickSize(0);

    var yLabel=plot.append("g")
    .attr("id", media+"yAxis")
    .attr("class", media+"yAxis")
    .call(yAxis)

    var yLabelOffset=yLabel.node().getBBox().width;
    yLabel
        .attr("transform",function(){
                    return "translate("+(plotWidth/2+margin.left)+","+margin.top+")"
                })

    yLabel.selectAll('text')
        .attr("style", null)
        .style("text-anchor","middle")

    // console.log(yLabelOffset)
    plotData.forEach(function(d,i){
        seriesNames.forEach(function(e){
            if (d[e]){
                xMin=Math.min(xMin,d[e]);
                xMax=Math.max(xMax,d[e]);
            }
        });         
    });
    console.log(xMin,xMax)

    var xScaleR = d3.scale.linear()
        .range([(plotWidth/2)+yLabelOffset/2, plotWidth])
        .domain([xMin,xMax]);

    var xAxis = d3.svg.axis()
    .scale(xScaleR)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");

    var xLabelsR=plot.append("g")
        .attr("id", media+"xAxis")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);

    var xScaleL = d3.scale.linear()
        .range([margin.left, (plotWidth/2)-(yLabelOffset/2)])
        .domain([xMax,xMin]);

    var xAxis = d3.svg.axis()
    .scale(xScaleL)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");

    var xLabelsL=plot.append("g")
        .attr("id", media+"xAxis")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==xAxisHighlight;
        }).classed(media+"origin",true);

    let labelLeft=plot.append("text")
        .attr("x",xScaleR(0)+margin.left)
        .attr("y",yOffset)
        .attr("class",media+"subtitle")
        .style("text-anchor","start")
        .text(seriesNames[1])

    let labelRight=plot.append("text")
        .attr("x",xScaleL(0)+margin.left)
        .attr("y",yOffset)
        .attr("class",media+"subtitle")
        .style("text-anchor","end")
        .text(seriesNames[0])

    plot.selectAll("."+media+"fill")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id", function(d) {return d.category})
        .attr("transform",function(){
                return "translate("+(margin.left)+","+margin.top+")"
            })
        .call(addBarsL)
        .call(addBarsR)



    function addBarsL(parent) {
        parent.selectAll("."+media+"fill")
        .data(plotData)
            .enter()
            .append("rect")
            .attr("class",media+"bars")
            .attr("id", function(d) {return d.category +"-"+d[seriesNames[0]]})
            .attr("fill",colours[0])
            .attr("height", function(d) {  return yScale.rangeBand()})
            .attr("x",function(d) {return xScaleL(d[seriesNames[0]])})
            .attr("y", function(d) { return yScale(d.category)})
            .attr("width",function (d) {return Math.abs(xScaleL(d[seriesNames[0]])-xScaleL(0))})
    }

    function addBarsR(parent) {
        parent.selectAll("."+media+"fill")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("class",media+"bars")
            .attr("id", function(d) {return d.category +"-"+d[seriesNames[1]]})
            .attr("fill",colours[1])
            .attr("height", function(d) {  return yScale.rangeBand()})
            .attr("x",xScaleR(0))
            .attr("y", function(d) { return yScale(d.category)})
            .attr("width",function (d) {return xScaleR(d[seriesNames[1]])-xScaleR(0)})

    }


}