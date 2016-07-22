
function makeChart(data,stylename,media,sort,xMin,xMax,xAxisHighlight,numTicksx,plotpadding,legAlign,yAlign){

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
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

  /*  plot.append("rect")
        .attr("x",margin.left)
        .attr("y",margin.top)
        .attr("width",plotWidth)
        .attr("height",plotHeight)
        .attr("fill",colours[0])*/
    
    //chart variables
    var dotSize=yOffset/2;
    var lineWeight=2;
    
    //parse the data for constant data elements
    data.forEach(function(d)    {
        d.value=+d.value;
    });
    
    //sort the data by middle income
    if (sort=="descending") {
        data.sort(function(a, b) { return b.value - a.value; })//Sorts biggest rects to the left
        }
    else {data.sort(function(a, b) { return a.value - b.value; })} //Sorts biggest rects to the left
    
    //calculate the range of the data - used for x axis
    var xEntent = d3.extent(data,function(d){
        return d.value;
    })
    xEntent[0]=Math.min(xMin,xEntent[0])
    xEntent[1]=Math.max(xMax,xEntent[1])
    
    //create y-scale

    var yScale = d3.scale.ordinal()
    .rangeRoundBands([0, plotHeight],1)
    .domain(data.map(function(d) { return d.name;}));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickSize(0);

    var yLabel=plot.append("g")
      .attr("class", media+"yAxis")
      .call(yAxis)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width

    //yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+margin.top+")"
            })

    //define x-axis
    var xScale = d3.scale.linear()
        .domain(xEntent)
        .range([yLabelOffset,plotWidth])

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");
        
    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);
    
    plot.append("g")
        .attr("id","lines")
        .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
        .selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("id",function(d){
            return d.name+":"+d.value+"_line"
        })
        .attr("x1",function(d){
            if (d.value>0){
                return xScale(d3.max([0,xEntent[0]]))
            }   else    {
                return xScale(d.value)
            }
        })
        .attr("x2",function(d){
            if (d.value<0){
                return xScale(0)
            }   else    {
                return xScale(d.value);
            }
            
        })
        .attr("y1",function(d){
            return yScale(d.name)
        })
        .attr("y2",function(d){
            return yScale(d.name)
        })
        .attr("stroke",colours[0])
        .attr("stroke-width",lineWeight);


    
    //create dots
    plot.append("g")
        .attr("id","dots")
        .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("id",function(d){
            return d.name+":"+d.value+"_dot"
        })
        .attr("cx",function(d){
            return xScale(d.value);
        })
        .attr("cy",function(d){
            return yScale(d.name)
        })
        .attr("r",dotSize)
        .attr("fill",colours[0])
}