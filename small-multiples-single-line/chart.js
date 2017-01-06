
function makeChart(data, stylename, media, plotpadding, legAlign, 
    graphsPerRow, numberOfRows, yMin, yMax, legendTitles){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;


    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));

    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date' && d != 'value'});

    
    //Get the width, height and the margin unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]

    var colours=stylename.linecolours;

    var plotWidth = w;
    var plotHeight = h;

    //CREATE THE PLOT WIDTHS, BUT FOR EACH INDIVIDUAL GRAPH
    var widthOfSmallCharts = (w/graphsPerRow)-(margin.left+margin.right);
    var heightOfSmallCharts = (h/numberOfRows)-(margin.top+margin.bottom);

    var xScale = d3.time.scale()
        .range([0, widthOfSmallCharts]);

    var yScale = d3.scale.linear()
        .range([heightOfSmallCharts, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSize(8)
        .ticks(2)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(3)
        .orient("left")
        .tickSize(-widthOfSmallCharts)
        .tickFormat(function(d){
            return d;
        });

    //domainz
    var yDomain = [yMin,yMax];
    var xDomain = d3.extent(data, function(d) { return d.date; } );
        xScale.domain(xDomain);
        yScale.domain(yDomain);

    //CREATE LINE
    var line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.lineValue); });

    xAxis.tickValues(xDomain);

    var svg = plot.append("svg")
        .attr("width", plotWidth)

    var chart = svg.selectAll("g")
        .data(seriesNames)
            .enter()
        .append("g")
        .attr("id", function(d){ return d; })
        .attr("transform", function(d, i) { 
            var yPos = Number((Math.floor( i / graphsPerRow) * (heightOfSmallCharts + margin.top + margin.bottom) + margin.top));
            var xPos = i%graphsPerRow;
            return 'translate(' + ((widthOfSmallCharts + margin.left) * xPos + margin.left) + ',' + yPos + ')'
            })
    

    //set the height of the svg container       
        svg.attr('height', function(d) {
            var numCharts = seriesNames.length;
            var rows = Math.ceil(numCharts / graphsPerRow);
            var chartHeight = rows * (heightOfSmallCharts + margin.top + margin.bottom) + margin.top
            return chartHeight;
        });

    //add titles for each chart
        chart.append('text')
            .attr("class", media+"subtitle name")
            .attr("dx", function(d,i) {widthOfSmallCharts/2
                // var xPos = i%graphsPerRow;
                // return ((widthOfSmallCharts + margin.left) * xPos + margin.left);
            })
            .attr("dy", -15)
            .text(function(d) {return d.toUpperCase(); });

    //make axes
        chart.append('g')
            .attr("class", media+"yAxis y axis")
            .call(yAxis);

        chart.append('g')
            .attr("class", media+"xAxis x axis")
            .attr('transform', 'translate(0,' + heightOfSmallCharts + ')')
            .call(xAxis);

    //make lines
        chart.append('path')
            .attr("class", media+"lines lines")
            .attr("stroke", colours[0])
            .each(function(seriesName){
                var line = d3.svg.line()
                    .defined(function(d) { return ( !isNaN( d[seriesName] ) ) })
                    .x(function(d) { return xScale(d.date); })
                    .y(function(d) { return yScale( d[seriesName] ); })
                d3.select(this)
                    .datum(data)
                    .attr('d', function(d){ return line(d); });
            });


        //legend
        var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(legendTitles)
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

        //legend doodads
        function pointer() {
                this.style.cursor='pointer'
            }

        function moveLegend() {
                var dX = d3.event.x; // subtract cx
                var dY = d3.event.y; // subtract cy
                d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

            }


}

   