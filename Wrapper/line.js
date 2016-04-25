function lineChart(data,stylename,media,plotpadding,legAlign,lineSmoothing, logScale, logScaleStart,yHighlight, markers, numTicksy, numTicksx, ticks, yLabel){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;

    //calculate range of time series
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var yDomain;

    //calculate range of y axis series data
    var min=0;
    var max=4;
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

    //Scales
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
    var ticksize=colculateTicksize(yLabel)

	var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(numTicksx)
        .tickSize(yOffset/2)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .tickValues(ticks)
        .tickSize(ticksize)
        .orient(yLabel)

    if (logScale){
        yAxis.tickFormat(function (d) {
            return yScale.tickFormat(1,d3.format(",d"))(d)
        })   
    }
    var ytext=plot.append("g")
    .attr("class",media+"yAxis")
    .attr("transform",function(){
        if (yLabel=="right"){
            return "translate("+(margin.left)+","+margin.top+")"
        }
        else return "translate("+(ticksize+margin.left)+","+margin.top+")"
        })
    .call(yAxis);

    var xtext=plot.append("g")
    .attr("class",media+"xAxis")
    .attr("transform",function(){
        return "translate(0,"+(h-margin.bottom)+")"
        })
    .call(xAxis);

    if (yLabel=="right") {
        // var test=ytext.selectAll("text")
        // console.log(test.node().getBBox().width)
        ytext.selectAll("text")
            .attr("y", -yOffset/2)
            .style("text-anchor", "end")
    }

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
            return d==originValue || d==yHighlight;
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
            .attr("cy",function(d){return yScale(d.val)+margin.top});
    }

    // //create a legend first
    var legendyOffset=0
    var legend = plot.append("g")
        .attr("id",media+"legend")
        .on("mouseover",pointer)
        .selectAll("g")
        .data(seriesNames)
        .enter()
        .append("g")
        .attr ("id",function(d,i){
            return media+"l"+i
        })

    var drag = d3.behavior.drag().on("drag", moveLegend);
    d3.select("#"+media+"legend").call(drag);
        
    legend.append("text")

        .attr("id",function(d,i){
            return media+"t"+i
        })
        .attr("x",yOffset+yOffset/2)
        .attr("y",yOffset/2)
        .attr("class",media+"subtitle")
        .text(function(d){
            return d;
        })
    legend.append("line")
        .attr("stroke",function(d,i){
            return colours[i];  
        })
        .attr("x1",0)
        .attr("x2",yOffset)
        .attr("y1",yOffset/4)
        .attr("y2",yOffset/4)
        .attr("class",media+"lines")

    legend.attr("transform",function(d,i){
        if (legAlign=='hori') {
            var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
            if (i>0) {
                var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+yOffset; 
            }
            else {gWidth=0};
            legendyOffset=legendyOffset+gWidth;
            return "translate("+(legendyOffset)+","+(gHeigt/2)+")";  
        }
        else {
            return "translate(0,"+((i*yOffset+(margin.top/2)))+")"};
    })

    function colculateTicksize(yLabel) {
        if (yLabel=="right") {
            return w-margin.left
        }
        else {return w-margin.right-margin.left}
    }

    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }





}