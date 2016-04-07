function lineChart(data,stylename,media,plotpading){

	//graph options
    var lineSmoothing="monotone";//choose 'linear' for an unsmoothed line
    var logScale=false;
    var logScaleStart=1000;

    //Select the plot space in the frame from which to take measurements
    var plot=d3.select("#"+media+"plot")
    console.log(plot)
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    console.log(w,h)
    var margin=plotpading.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var markers=false;//show circle markers
    var yTicks = 4;//rough number of ticks for y axis
    var xTicks = 4;//rough number of ticks for x axis
    var ticks//=[0.2,0.3];//option to force tick values for online

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //calculate range of time series
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var yDomain;

    //calculate range of y axis series data
    var min=0;
    var max=0;
    data.forEach(function(d,i){
        seriesNames.forEach(function(e){
            if (d[e]){
                min=Math.min(min,d[e]);
                max=Math.max(max,d[e]);
            }
        });			
    });
    yDomain=[min,max];

    //create a separate array for each series, filtering out records of each  series for which there are no data
    var plotArrays = [];
    seriesNames.forEach(function(series,i){
        plotArrays[i] = [];
    });
    data.forEach(function(d,i){
        seriesNames.forEach(function(series,e){
            var myRow = new Object();
            myRow.date=d.date;
            myRow.val=d[series];
            if (myRow.val){
                plotArrays[e].push(myRow);
            }   else    {
                //console.log('skipped a value:'+i);   
            } 
        });
    });

    //web scales
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    var xScale = d3.time.scale()
        .domain(xDomain)
        .range([0,plotWidth])

    var yScale;
        if (logScale) {
			yScale = d3.scale.log()
			.domain([logScaleStart,max])
			.range([plotHeight,0]);
		}
        else {
			yScale = d3.scale.linear()
			.domain(yDomain)
			.range([plotHeight,0])
			.nice();
		}
	var xAxis = d3.svg.axis()
        .scale(xScale)
        //.ticks(xTicks)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(yTicks)
        .tickValues(ticks)
        .tickSize(plotWidth)
        .orient("right")

    if (logScale){
        yAxis.tickFormat(function (d) {
            return yScale.tickFormat(1,d3.format(",d"))(d)
        })   
    }
    plot.append("g").attr("class",media+"yAxis").call(yAxis);
    plot.append("g").attr("class",media+"xAxis")
            .attr("transform",function(){
                return "translate(0,"+plotHeight+")"
            })
            .call(xAxis);

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==0;
        }).classed(media+"origin",function(d,i){
            return (d == originValue);
        });

    //create a line function that can convert data[] into x and y points
    var lineData= d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.date); 
        })
        .y(function(d) { 
            return yScale(d.val); 
        })
        .interpolate(lineSmoothing)

    var lines = plot.append("g").attr("id","series").selectAll("g")
            .data(plotArrays)
            .enter()
            .append("g")
            .attr("id",function(d,i){
                return seriesNames[i];  
            })
        lines.append("path")
            .attr("class",media+"lines")
            .attr("stroke",function(d,i){
                return colours[i];  
            })
            .attr('d', function(d){ return lineData(d); });

     //if needed, create markers
        if (markers){
            lines.append("g").attr("fill",function(d,i){return colours[i]})
                .selectAll("circle")
                .data(function(d){return d;})
                .enter()
                .append("circle")
                .attr("r",3)
                .attr("cx",function(d){return xScale(d.date)})
                .attr("cy",function(d){return yScale(d.val)});
        }

}