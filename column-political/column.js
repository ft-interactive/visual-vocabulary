function columnChart(data,stylename,media,plotpadding,legAlign,lineSmoothing, logScale, logScaleStart,yHighlight, markers, numTicksy, numTicksx, yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    var seriesNames=[]
    for(i = 0; i< data.length; i++){    
        if(seriesNames.indexOf(data[i].party) === -1){
            seriesNames.push(data[i].party);        
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
    margin=margin[0].margin[0]
    //var colours=stylename.fillcolours;

    var color = d3.scale.ordinal()
      .domain(["BNP","Conservative","Labour","UKIP","Green Party","Scottish Green Party","SNP","Liberal Democrats","Plaid Cymru","Socialist Party of Great Britain","Christian Peoples Alliance","Scotish Socialist Party","Focus on Scotland","Yes in May 2011 Ltd","No Campaign Limited","Grey","Movement for Change"])
      .range(["#546A7E","#6da8e1","#e25050","#ca6dbf","#65a68c","#65a68c","#F2E24D","#ffc660","#99d2d0","#A50409","#813887","#EF4123","#4588FF","#9B3E97","#D7E025","#D1D2D4","#636466"]);

    var plotWidth=w-margin.left-margin.right
    var plotHeight=h-margin.top-margin.bottom

    var yScale = d3.scale.linear()
    .range([plotHeight, 0]);

    //var max=d3.max(data, function(d,i) { return +d.value;});
    yScale.domain([0, d3.max(data, function(d,i) { return +d.value;})]);

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
        }).classed(media+"origin",true);

    var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotWidth], .1);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");


    xScale.domain(data.map(function(d) { return d.cat;}));

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (h-margin.bottom) + ")")
      .call(xAxis);

    plot.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .style("fill", function (d) {return color(d.party)})
      .attr("x", function(d) { return xScale(d.cat); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return plotHeight - yScale(d.value); })
      .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left)+","+(margin.top)+")"}
        })

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
        .style("fill", function(d,i){return color(d)})

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