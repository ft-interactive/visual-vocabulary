function lineChart(data,stylename,media,plotpadding,legAlign){

	//graph options
    var lineSmoothing="monotone";//choose 'linear' for an unsmoothed line
    var logScale=false;
    var logScaleStart=1000;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //Select the plot space in the frame from which to take measurements
    var plot=d3.select("#"+media+"plot")
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var markers=false;//show circle markers
    var numTicksy = 5;//rough number of ticks for y axis
    var numTicksx = 46;//rough number of ticks for x axis
    var ticks//=[0.2,0.3];//option to force tick values for online

    //calculate range of time series
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var yDomain;

    //calculate range of y axis series data
    var min=0;
    var max=0.4;
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
        .range([margin.left,plotWidth])

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
        .tickSize(margin.bottom/3)
        .ticks(numTicksx)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .tickValues(ticks)
        .tickSize(w-margin.left)
        .orient("right")

    if (logScale){
        yAxis.tickFormat(function (d) {
            return yScale.tickFormat(1,d3.format(",d"))(d)
        })   
    }
    var ytext=plot.append("g")
    .attr("class",media+"yAxis")
    .attr("transform",function(){
        return "translate("+margin.left+","+margin.top+")"
        })
    .call(yAxis);

    var xtext=plot.append("g")
    .attr("class",media+"xAxis")
    .attr("transform",function(){
        return "translate(0,"+(h-margin.bottom)+")"
        })
    .call(xAxis);

    ytext.selectAll("text")
    .attr("dy", -4)
    .style("text-anchor", "end")


    //create a line function that can convert data[] into x and y points
    var lineData= d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.date); 
        })
        .y(function(d) { 
            return yScale(d.val)+margin.top; 
        })
        .interpolate(lineSmoothing)

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==0;
        }).classed(media+"origin",true);

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

    //create a legend first
    var compoundWidth=0
    var legend = plot.append("g")
        .attr("id","legend")
        .selectAll("g")
        .data(seriesNames)
        .enter()
        .append("g")
        .attr ("id",function(d,i){
            return media+"l"+i
        })
        
    legend.append("text")
            .attr("id",function(d,i){
                return media+"t"+i
            })
            .attr("x",25)
            .attr("y",10)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })
    legend.append("line")
            .attr("stroke",function(d,i){
                return colours[i];  
            })
            .attr("x1",0)
            .attr("x2",20)
            .attr("y1",5)
            .attr("y2",5)
            .attr("class",media+"lines")

    legend.attr("transform",function(d,i){
        console.log(media)
        if (legAlign=='hori') {
            if (i>0) {
                var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+20 
            }
            else {gWidth=0};
            console.log("gWidth", gWidth); 
            compoundWidth=compoundWidth+gWidth
            return "translate("+(compoundWidth)+",0)";  
        }
        else {return "translate(0,"+(i*15)+")"};
    })



}