
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
    var dotSize=plotHeight/32;
    var lineWeight=2;
    var labelPadding=plotWidth/4;
    

    
    //parse the data for constant data elements
    data.forEach(function(d)    {
        d.value=+d.value;
    });
    
    
    //sort the data by middle income
    data.sort(function(a, b){
        return b.value-a.value;
    });
    
    //calculate the range of the data - used for x axis
    var xRange = d3.extent(data,function(d){
        return d.value;
    })
    
    //create scale
    var xScale = d3.scale.linear()
        .domain(xRange)
        .range([labelPadding,plotWidth])
    
    var yScale = d3.scale.ordinal()
        .domain(data.map(function(d){
            return d.name;
        }))
        .rangeRoundBands([0,plotHeight],1);
    
    
    
    //AXES
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(4)
        
    plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform","translate("+margin.left+","+(margin.top+plotHeight)+")")
        .call(xAxis)
    
    //create geometry
    var chart = plot.append("g")
        .attr("id","geometry")
        .attr("transform","translate("+margin.left+","+margin.top+")")
    
    chart.append("g")
        .attr("id","lines")
        .selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("id",function(d){
            return d.name+":"+d.value+"_line"
        })
        .attr("x1",xScale(xRange[0]))
        .attr("x2",function(d){
            return xScale(d.value);
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
    chart.append("g")
        .attr("id","dots")
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
    
    
    //createLabels
    chart.append("g")
        .attr("id","labels")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("y",function(d){
            return yScale(d.name)
        })
        .attr("x",xScale(xRange[0]))
        .text(function(d){
            return d.name
        })
        .attr("class",media+"subtitle")
        .attr("text-anchor","end")
        .attr("dx",-dotSize)
        .attr("dy",function(d){
            return this.getBoundingClientRect().height/3
        })

    
    
    
    
    
    

}