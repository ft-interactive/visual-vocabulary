
function makeChart(data,stylename,media,yMin,yMax,yAxisHighlight,numTicksy,plotpadding,legAlign,yAlign){

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
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);

     //console.log(plotWidth,colours,plotHeight,data)
     //console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

    //query data
    var extent=d3.extent(data,function(d){
        return d.y;
    })
    extent[0]=Math.min(yMin,extent[0]);
    extent[1]=Math.max(yMax,extent[1]);


    //over-ride default scale values here
    //extent=[0,1000]

    //define scales and axes
    //y axis first
    //scale
    var yScale=d3.scale.linear()
        .domain(extent)
        .range([plotHeight,0])
        .nice()
    //axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(numTicksy)
    //attach it to plot
    var yLabel = plot.append("g")
        .attr("id",media+"yAxis")
        .attr("class", media+"yAxis")
        .call(yAxis)

    //establish the width of the y axis
    var axisWidth=document.getElementById(media+"yAxis").getBBox().width;

    //calculate full tick width - the offset
    var ticksize = plotWidth-axisWidth;

    //set ticksize and re-call the axis to draw the tick marks properly
    yAxis.tickSize(-ticksize)
    yLabel.call(yAxis);

    //offset the y axis by the length of the text
    d3.select("#"+media+"yAxis")
        .attr("transform","translate("+axisWidth+",0)")

    plot.selectAll('.tick')
  		.classed(media+'origin',function(d,i){
  			return (d == 0);
  		});

    //now the x axis (categorical)

    var xScale = d3.scale.ordinal()
        .domain(data.map(function(d){
            //extracts names for cat labels
            return d.x
    }))
        .rangeRoundBands([axisWidth,plotWidth],0.5)

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(yOffset)
        .orient("bottom");

    plot.append("g")
        .attr("class", media+"xAxis")
        .attr("transform","translate(0,"+(h-margin.bottom)+")")
        .call(xAxis)


    //draw chart geometry
    var pops = plot.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform",function(d){
            return "translate("+xScale(d.x)+",0)";
        })

    pops.append("circle")
        .attr("cx",xScale.rangeBand()/2)
        .attr("cy",function(d){
            return yScale(d.y)
        })
        .attr("r",plotWidth/40)
        .attr("fill",colours[0])

    pops.append("line")
        .attr("x1",xScale.rangeBand()/2)
        .attr("x2",xScale.rangeBand()/2)
        .attr("y1",function(d){
            return yScale(d.y)
        })
        .attr("y2",function(d){
            return yScale(extent[0])
        })
        .attr("stroke",colours[0])
        .attr("stroke-width",plotWidth/100)

}
