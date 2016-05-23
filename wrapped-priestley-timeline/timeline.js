
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

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

    //CHART OPTIONS
    //specify format of dates
    var dateParser = d3.time.format("%Y");
    var dotMode = false;
    
    var chartData = new Array();//create a copy of the data for this instance to avoid typing issues when the data object is repeatedly called for multiple frames
    
    //parse the data - into the 
    data.forEach(function(d,i){
        var obj = new Object()
        obj.name = d.name
        seriesNames.forEach(function(e,j){
            obj[e]=dateParser.parse(d[e])
        })
        chartData.push(obj);
    })
    
    //sort the data into date order of first column
    chartData.sort(function(a, b){
        return a[seriesNames[0]]-b[seriesNames[0]];
    });

    //identify date range of data
    //initialise dates to first date value
    var minDate = chartData[0][seriesNames[0]]
    var maxDate = chartData[0][seriesNames[0]]
    
    //iterate through dates and compare min/max
    seriesNames.forEach(function(d,i){
        chartData.forEach(function(e,j){
            minDate = d3.min([minDate,e[d]])
            maxDate = d3.max([maxDate,e[d]])
        })  
    })
    //min max dates
    //console.log(minDate,maxDate)
    
    //x scale for dates
    var xScale = d3.time.scale()
        .domain([minDate,maxDate])
        .range([0,plotWidth])
    
    //y scale for country
    var yScale = d3.scale.ordinal()
        .domain(chartData.map(function(d){
            return d.name;
        }))
        .rangeRoundBands([0,plotHeight],0.5);
    
    //AXES
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(4)
    
    //secondary axis - more ticks but no labels
    var xAxis2 = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.time.format(""))
        .ticks(20)
    
    //call axes
    plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform","translate("+margin.left+","+(margin.top+plotHeight)+")")
        .call(xAxis)
    plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform","translate("+margin.left+","+(margin.top+plotHeight)+")")
        .call(xAxis2)
    
    //create chart geometry
    var chart = plot.append("g")
        .attr("id","geometry")
        .attr("transform","translate("+margin.left+","+margin.top+")")
    
    //row geometry
    var rowGroups = chart.append("g")
        .attr("id","chart_rows")
        .selectAll("g")
        .data(chartData)
        .enter()
        .append("g")
    
    rowGroups.each(function(d,i){
        //rectangles
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
        //circles
        seriesNames.forEach(function(e,j){
            d3.select(rowGroups[0][i]).append("circle")
            .attr("cx",function(d){
                return xScale(d[seriesNames[j]])
            })
            .attr("cy",function(d){
                return yScale(d.name)+(yScale.rangeBand()/2);
            })
            .attr("r",yScale.rangeBand()/2)
            .attr("fill",colours[j])
        })   
    })
    //append chart labels
    chart.append("g")
        .attr("id","labels")
        .selectAll("text")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class",media+"subtitle")
        .attr("x",-yScale.rangeBand())
        .attr("y",function(d){
            return yScale(d.name);
        })
        .attr("text-anchor","end")
        .text(function(d){
            return d.name
        })
        .attr("dy",function(d){
            return yScale.rangeBand();
        })
    
    
    
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
            return xScale(chartData[0][d])
        })
        .attr("text-anchor","middle")
        .attr("fill",function(d,i){
            return colours[i]
        })
}