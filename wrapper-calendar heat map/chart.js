
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
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



    var colours = d3.scale.linear()
    .range(["white", stylename.fillcolours[0]])
    .domain([0, 1]);

    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    var cellSize = plotWidth/53; // cell size

    
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var startYear=xDomain[0].getFullYear();
    var endYear=xDomain[1].getFullYear();

    var percent = d3.format(".1%");
    var format = d3.time.format("%Y-%m-%d");
    var toolDate = d3.time.format("%d/%b/%y");


    var plotData=d3.nest()
        .key(function(d){return d.date.getFullYear();})
        .entries(data)
    
    console.log(plotData)

    var calendar = plot.selectAll("g")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) {return d.key})
    .call(function(parent){

        parent.append("text")
            .attr("class", media+"subtitle")
            .attr("y",yOffset)
            .text(function(d) {return d.key})
            .attr("transform",function(d,i){
                 return "translate("+(0)+","+i*(cellSize*7+yOffset)+")"
            })

        var rects = parent.append('g')
            .attr("transform",function(d,i){
                 return "translate("+(0)+","+i*(cellSize*7+yOffset)+")"
            })
            .attr('id','alldays')
            .selectAll('.day')
            .data(function(d) { return d3.time.days(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1)); })
            .enter().append('rect')
            .attr('id',function(d) {
                return '_'+format(d);
                //return toolDate(d.date)+':\n'+d.value+' dead or missing';
            })
            .attr('class', media+'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', function(d) {
                return (d3.time.weekOfYear(d) * cellSize);
            })
            .attr('y', function(d) { return (d.getDay() * cellSize); })

            .datum(format);


    })

    

}