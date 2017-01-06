
function makeChart(data, stylename, media, plotpadding, legAlign, graphsPerRow, numberOfRows, yMin, yMax, legendTitles){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;


    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width, height and the margin unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]

    var colours=stylename.linecolours;

    //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
    var plotWidth = (w/graphsPerRow)-(margin.left+margin.right);
    var plotHeight = (h/numberOfRows)-(margin.top+(margin.bottom/(numberOfRows/1.1)));

    var xScale = d3.time.scale()
        .range([0, plotWidth]);

    var yScale = d3.scale.linear()
        .range([plotHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(3)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(3)
        .orient("left");

    //CREATE LINE
    var line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.lineValue); });


    xScale.domain(d3.extent(data, function(d) { return d.date; })).nice()
    yScale.domain([yMin,yMax]);

    //NEST THE DATA
    var nestedData = d3.nest()
        .key(function(d){return d.graphName})
        .key(function(d){return d.lineCategory})
        .entries(data);

    //CREATE THE GRAPHS
    var graphGroup = plot.selectAll(".graphName")
        .data(nestedData)
        .enter().append("g")
          .attr("class", "graphName")
          //space the charts apart both horizontally and vertically
          //this currently allows for only four rows, but you can manually add more
          .attr("transform", function (d,i) {
            if (i<graphsPerRow) {
              return "translate(" + ((plotWidth+margin.left)*i) + "," + margin.top + ")"
            }
            if (i>=graphsPerRow && i<(graphsPerRow*2)) {
              return "translate(" + ((plotWidth+margin.left)*(i-graphsPerRow)) + "," + (plotHeight+(margin.bottom+margin.top)) + ")"
            }
            if (i>=(graphsPerRow*2 && i<(graphsPerRow*3))) {
              return "translate(" + ((plotWidth+margin.left)*(i-(graphsPerRow*2))) + "," + ((plotHeight*2)+(2*margin.bottom)+margin.top) + ")"
            }
            //below is for a fourth row. You may need to adjust a bit
            //if you have any more than four rows, you'll need to add another loop
            if (i>=(graphsPerRow*3 && i<(graphsPerRow*4))) {
              return "translate(" + ((plotWidth+margin.left)*(i-(graphsPerRow*3))) + "," + ((plotHeight*3) + (3*margin.bottom)+margin.top) + ")"
            }
          })

    //ADD TITLES TO EACH SMALL MULTIPLE GRAPH
    graphGroup.append("text")
        .attr("class", media+"subtitle name")
        .attr("transform","translate(0," + (-5) + ")")
        .text(function(d){return d.key;});

    //DRAW LINES FOR EACH CHART
    graphGroup.selectAll(".lines")
        .data(function(d,i) { return d.values; })
      .enter().append("path")
        .attr("class", function(d,i) {return "lines line-" + nestedData[i].values[i].key})
        .attr("class", media+"lines")
        .attr("transform","translate("+margin.left+",0)")
        .attr("stroke",function(d,i){
                return colours[i];  
            })
        .attr("d", function(d,i) { return line(d.values); });

    //MAKE EACH CHART'S X AXIS     
    graphGroup.append("g")
      .attr("class", media+"xAxis x axis")
      .attr("transform","translate("+ margin.left+ "," + plotHeight + ")")
      .call(xAxis);

    //MAKE EACH CHART'S Y AXIS
    graphGroup.append("g")
      .attr("class", media+"yAxis y axis")
      .attr("transform","translate("+margin.left+",0)")
      .call(yAxis);


// // return the series names from the first row of the spreadsheet
// var seriesNames = Object.keys(nestedData[0].values[0]).filter(function(d){ return d })

    var legendTitle = legendTitles

        // //create a legend first
        var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(legendTitle)
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
            .attr("x",yOffset+yOffset/2)
            .attr("y",yOffset/2)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })
        legend.append("line")
            .attr("stroke",function(d,i){
                return colours[i];  
            })
            .attr("x1",0)
            .attr("x2",yOffset)
            .attr("y1",yOffset/4)
            .attr("y2",yOffset/4)
            .attr("class",media+"lines")

        legend.attr("transform",function(d,i){
            if (legAlign=='hori') {
                var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
                if (i>0) {
                    var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+yOffset; 
                }
                else {gWidth=0};
                legendyOffset=legendyOffset+gWidth;
                return "translate("+(legendyOffset)+","+(gHeigt/2)+")";  
            }
            else {
                return "translate(0,"+((i*yOffset))+")"};
    })

function pointer() {
        this.style.cursor='pointer'
    }

function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }


}

   