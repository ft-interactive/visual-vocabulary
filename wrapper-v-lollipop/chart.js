
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
    
    //axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient(yAlign)
        .ticks(numTicksy)
    //attach it to plot
    var yLabel = plot.append("g")
        .attr("id",media+"yAxis")
        .attr("class", media+"yAxis")
        .call(yAxis)

     //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width
    //console.log("offset= ",yLabelOffset)
    var yticksize=colculateTicksize(yAlign, yLabelOffset);
    //console.log(yticksize);

    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(){
            if (yAlign=="right"){
                return "translate("+(margin.left)+","+margin.top+")"
            }
            else return "translate("+(w-margin.right)+","+margin.top+")"
            })

    //now the x axis (categorical)


    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.scale.ordinal()
        .domain(data.map(function(d){
            //extracts names for cat labels
            return d.x
    }))
        .rangeRoundBands([0,plotWidth-yLabelOffset],0.5)

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(yOffset)
        .orient("bottom");

    var xLabels=plot.append("g")
.attr("class", media+"xAxis")
.attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(h-margin.bottom)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(h-margin.bottom)+")"}
        })
      .call(xAxis);


    //draw chart geometry
    var pops = plot.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform",function(d){
            if(yAlign=="right") {
                return "translate("+(margin.left+xScale(d.x))+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset+xScale(d.x))+","+(margin.top)+")"}
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
            if (d.y>0)  {
            return yScale(d3.max([0,extent[0]]))
            }   else    {
            return yScale(0)    
            }
        })
        .attr("stroke",colours[0])
        .attr("stroke-width",plotWidth/100)

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}
