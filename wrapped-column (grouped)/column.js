function columnChart(data,stylename,media,plotpadding,legAlign,lineSmoothing, logScale, logScaleStart,yHighlight, markers, numTicksy, numTicksx, ticks){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

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
    var colours=stylename.linecolours;

    var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([h, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .tickSize(yOffset/2)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")

    var svg = plot.append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bandNames = d3.keys(data[0]).filter(function(key) { return key !== "cat"; });

    data.forEach(function(d) {
        d.values = bandNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.cat; }));
    x1.domain(bandNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value; }); })]);
    
    svg.append("g")
        .attr("class",media+"xAxis")
        .attr("transform", "translate(0," + (h-margin.bottom-margin.top) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class",media+"yAxis")
        .call(yAxis)

    // //create a legend first
    // var legendyOffset=0
    // var legend = plot.append("g")
    //     .attr("id",media+"legend")
    //     .on("mouseover",pointer)
    //     .selectAll("g")
    //     .data(seriesNames)
    //     .enter()
    //     .append("g")
    //     .attr ("id",function(d,i){
    //         return media+"l"+i
    //     })

    // var drag = d3.behavior.drag().on("drag", moveLegend);
    // d3.select("#"+media+"legend").call(drag);
        
    // legend.append("text")

    //     .attr("id",function(d,i){
    //         return media+"t"+i
    //     })
    //     .attr("x",yOffset+yOffset/2)
    //     .attr("y",yOffset/2)
    //     .attr("class",media+"subtitle")
    //     .text(function(d){
    //         return d;
    //     })
    // legend.append("line")
    //     .attr("stroke",function(d,i){
    //         return colours[i];  
    //     })
    //     .attr("x1",0)
    //     .attr("x2",yOffset)
    //     .attr("y1",yOffset/4)
    //     .attr("y2",yOffset/4)
    //     .attr("class",media+"lines")

    // legend.attr("transform",function(d,i){
    //     if (legAlign=='hori') {
    //         var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
    //         if (i>0) {
    //             var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+yOffset; 
    //         }
    //         else {gWidth=0};
    //         legendyOffset=legendyOffset+gWidth;
    //         return "translate("+(legendyOffset)+","+(gHeigt/2)+")";  
    //     }
    //     else {
    //         return "translate(0,"+((i*yOffset))+")"};
    // })

    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }





}