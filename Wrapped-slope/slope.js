function slopeChart(data,stylename,media,plotpadding,legAlign,yHighlight, startZero, showDots, showLabels, showValues){

	//graph options
    var lineSmoothing="monotone";//choose 'linear' for an unsmoothed line
    var logScale=false;
    var logScaleStart=1000;
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height


    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    
    //workout dimensions of data
        var maxVal = Math.max(d3.max(data, function(d){return parseFloat(d.val1);}),d3.max(data, function(d){return parseFloat(d.val2);}));
        var minVal = Math.min(d3.min(data, function(d){return parseFloat(d.val1);}),d3.min(data, function(d){return parseFloat(d.val2);}));

    //anchor to zero if needed
    if (startZero==true){
        minVal = Math.min(minVal,0);   
    }

    //create scale for y axis
    var yScale = d3.scale.linear()
        .domain([minVal,maxVal])
        .range([h,0])

    //axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("right")
        .ticks(5)
        .tickSize(w-margin.right-margin.left)

    var yText=plot.append("g")
        .attr("class",media+"yAxis")
        .attr("transform",function(){
            return "translate("+margin.left+",0)";  
        })
        .call(yAxis);

    yText.selectAll("text")
    .attr("dy", -4)
    .style("text-anchor", "end")

    //identify 0 line if there is one
    var originValue = 0;
    console.log(yHighlight)
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yHighlight;
        }).classed(media+"origin",true);

    var graph = plot.append("g")
            .attr("id",media+"slope");

    var slopes = graph.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("id",function(d){return media+d.name})

    slopes.append("line")
        .attr("class",media+"lines")
        .attr("stroke",function(d,i){
                return colours[0];  
            })
        .attr("x1",margin.left)
        .attr("x2",w-margin.right)
        .attr("y1",function(d){return yScale(d.val1)})
        .attr("y2",function(d){return yScale(d.val2)})

    //create dots if requested
    if (showDots)   {
        slopes.append("circle")
            .attr("class",media+"circles")
            .attr("fill",function(d,i){
                return colours[0];  
            })
            .attr("r",3)
            .attr("cx",margin.left)
            .attr("cy",function(d){return yScale(d.val1)});
        slopes.append("circle")
            .attr("class",media+"circles")
            .attr("fill",function(d,i){
                return colours[0];  
            })
            .attr("r",3)
            .attr("cx",w-margin.right)
            .attr("cy",function(d){return yScale(d.val2)});
    }

    //create labels if needed
    if (showLabels) {
        slopes.append("text")
            .attr("class",media+"subtitle")
            .attr("x",margin.left-7)
            .attr("text-anchor","end")
            .attr("y",function(d){return yScale(d.val1)+5})
            .text(function(d){
            if (showValues){
            return d.name+" "+d.val1;
            }   else    {
            return d.name;
            }
        });
        slopes.append("text")
            .attr("class",media+"subtitle")
            .attr("x",w-margin.right+7)
            .attr("text-anchor","start")
            .attr("y",function(d){return yScale(d.val2)+5})
            .text(function(d){
        if (showValues){
            return d.val2+" "+d.name;
            }   else    {
            return d.name;
            }
        });
    }


    
}