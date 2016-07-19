
function makeChart(data,stylename,media,xMin,xMax,numTicksx,showRect,showLine,markers,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;
    
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
    var parseDate = d3.time.format("%Y").parse;

    
    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){if (d!='name'){return d}});

    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

    /*plot.append("rect")
        .attr("x",margin.left)
        .attr("y",margin.top)
        .attr("width",plotWidth)
        .attr("height",plotHeight)
        .attr("fill",colours[0])*/

    
    //sort the data into date order of first column
    data.sort(function(a, b){
        return a[seriesNames[0]]-b[seriesNames[0]];
    });

    //identify date range of data
    //initialise dates to first date value
    xMin=parseDate(xMin)
    xMax=parseDate(xMax)

    var minDate = data[0][seriesNames[0]]
    var maxDate = data[0][seriesNames[0]]
    
    //iterate through dates and compare min/max
    seriesNames.forEach(function(d,i){
        data.forEach(function(e,j){
            minDate = Math.min(xMin,d3.min([minDate,e[d]]))
            maxDate = Math.max(xMax,d3.max([maxDate,e[d]]))
        })  
    })

    // minDate = Math.min(xMin,minDate)
    // maxDate = Math.max(xMax,maxDate)
    //min max dates
    //console.log(minDate,maxDate)
    
    //y scale for country
    var yScale = d3.scale.ordinal()
        .domain(data.map(function(d){
            return d.name;
        }))
        .rangeRoundBands([0,plotHeight],0.5);

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
    
    //AXES
    //x scale for dates
    var xScale = d3.time.scale()
        .domain([minDate,maxDate])
        .range([yLabelOffset,plotWidth])

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickSize(plotHeight)
        .ticks(4)
    
    //secondary axis - more ticks but no labels
    var xAxis2 = d3.svg.axis()
        .scale(xScale)
        .tickSize(plotHeight)
        .orient("bottom")
        .tickFormat(d3.time.format(""))
        .ticks(20)
    
    //call axes
    plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform","translate("+margin.left+","+(margin.top)+")")
        .call(xAxis)
    plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform","translate("+margin.left+","+(margin.top)+")")
        .call(xAxis2)
    
    //create chart geometry
    var chart = plot.append("g")
        .attr("id","geometry")
        .attr("transform","translate("+margin.left+","+margin.top+")")
    
    //work in rows of geometry
    var rowGroups = chart.append("g")
        .attr("id","chart_rows")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
    
    rowGroups.each(function(d,i){
        //rectangles
        if (showRect){
            for (k=0;k<seriesNames.length-1;k++){
                d3.select(rowGroups[0][i]).append("rect")
                .attr("x",function(d){
                    return xScale(d[seriesNames[k]])
                })
                .attr("y",function(d){
                    return yScale(d.name);
                })
                .attr("width",function(d){

                    return xScale(d[seriesNames[k+1]])-xScale(d[seriesNames[k]])

                })
                .attr("height",yScale.rangeBand)
                .attr("fill",colours[k])
                .attr("fill-opacity",0.8)
            }
        }
        //connecting lines
        if (showLine){
                d3.select(rowGroups[0][i]).append("line")
                .attr("x1",function(d){
                    return xScale(d[seriesNames[0]])
                })
                .attr("x2",function(d){
                    return xScale(d[seriesNames[seriesNames.length-1]])
                })
                .attr("y1",function(d){
                    return yScale(d.name)+(yScale.rangeBand()/2);;
                })
                .attr("y2",function(d){
                    return yScale(d.name)+(yScale.rangeBand()/2);;
                })
                .attr("stroke","#777")
                .attr("stroke-width","2px")//should use class
        }
        //marker dots
        if (markers){
            seriesNames.forEach(function(e,j){
                d3.select(rowGroups[0][i]).append("circle")
                .attr("cx",function(d){
                    return xScale(d[seriesNames[j]])
                })
                .attr("cy",function(d){
                    return yScale(d.name)+(yScale.rangeBand()/2);
                })
                .attr("r",yOffset/2.4)
                .attr("fill",colours[j])
            })
        }
    })
    
    if (markers||showRect){
    //key
    chart.append("g")
        .attr("id","key")
        .selectAll("text")
        .data(seriesNames)
        .enter()
        .append("text")
        .text(function(d){
            return d;
        })
        .attr("y",yScale.rangeBand()/2)
        .attr("x",function(d){
            return xScale(data[0][d])
        })
        .attr("text-anchor","middle")
        .attr("fill",function(d,i){
            return colours[i]
        })
    
    chart.append("g")
        .attr("id","keylines")
        .selectAll("line")
        .data(seriesNames)
        .enter()
        .append("line")
        .attr("y1",yScale.rangeBand()*.5)
        .attr("y2",yScale.rangeBand())
        .attr("x1",function(d){
            return xScale(data[0][d])
        })
        .attr("x2",function(d){
            return xScale(data[0][d])
        })
        .attr("stroke","#777")
        .attr("stroke-width","1px")//should use class
    }

}