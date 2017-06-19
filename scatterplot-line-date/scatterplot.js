
function scatterplot(data,stylename,media,plotpadding,legAlign,yAlign, yMin,yMax,numTicksy, yAxisHighlight,lineSmoothing,lineStart) {
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

    let dotSeries=seriesNames.slice(0,lineStart)
    let lineSeries=seriesNames.slice(lineStart)

    var yDomain = extentMulti(data, lineSeries);
    var xDomain = d3.extent(data, function(d) {return d.date;});

    yDomain[0]=Math.min(yMin,yDomain[0]);
    yDomain[1]=Math.max(yMax,yDomain[1]);

    // let lineGroup=lineSeries.map(function(d,i){
    //     return {
    //         name:d,
    //         lineData:getlines(data,d)
    //     }
    // })
    // console.log(lineGroup)

    var lineGroup = [];
    lineSeries.forEach(function(series,i){
        lineGroup[i] = [];
    });
    data.forEach(function(d,i){
        lineSeries.forEach(function(series,e){
            var myRow = new Object();
            myRow.date=d.date;
            myRow.val=d[series];
            if (myRow.val){
                lineGroup[e].push(myRow);
            }   else    {
                //console.log('skipped a value:'+i);   
            } 
        });
    });


    let dotGroup=dotSeries.map(function(d,i){
        return {
            name:d,
            dotData:getdots(data,d)
        }
    })

    function getdots(data,group) {
        let dotData=[]
        data.forEach(function(el,i){
            //console.log(el,i)
            let column=new Object();
            column.name = group
            column.date = el.date
            column.value = +el[group]
            if(el[group]) {
                dotData.push(column)  
            } 
        });
        return dotData
    }


    //console.log(plotData)

    var yScale=d3.scale.linear()
        .domain(yDomain)
        .range([plotHeight,0])

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient(yAlign)

    var yLabel=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxis);

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

    if (yAlign=="right"){
        yLabel.selectAll('text')
            .attr("style", null)
            .attr("x",yticksize+(yLabelOffset*.8))
        }

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.time.scale()
    //var xScale = scaleWeekday()
        .domain(xDomain)
        .range([0,(plotWidth-yLabelOffset)])

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)
        .orient("bottom");

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
            })
        .call(xAxis);

    xLabel.selectAll('text')
        .attr("style", null)

    if(minAxis) {
        var xAxisMinor = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.minor)
        .tickSize(yOffset/4)
        .orient("bottom");

        var xLabelMinor=plot.append("g")
            .attr("class",media+"minorAxis")
            .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(plotHeight+margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(plotHeight+margin.top)+")"}
                })
            .call(xAxisMinor);
    }

    var allDots = plot.selectAll("."+media+"datCat")
        .data(dotGroup)
        .enter()
        .append("g")
        .attr("id", function(d) {return d.name})
        .attr("transform",function(){
                if(yAlign=="right") {
                    return "translate("+(margin.left)+","+(margin.top)+")"
                }
                 else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
                })
        .attr("class", media+"datCat")
        .call(addDots)

    var lines = plot.append("g").attr("id","series").selectAll("g")
        .data(lineGroup)
        .enter()
        .append("g")
        .attr("id",function(d,i){
            return seriesNames[i];  
        })
    
    var lineData= d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.date); 
        })
        .y(function(d) { 
            return yScale(d.val); 
        })
        .interpolate(lineSmoothing)


    lines.append("path")
        .attr("class",media+"lines")
        .attr("stroke",function(d,i){
            return colours[i];  
        })
        .attr('d', function(d){
            return lineData(d); })
        .attr("transform",function(){
            if(yAlign=="right") {
                return "translate("+(margin.left)+","+(margin.top)+")"
            }
             else {return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"}
        })


    function addDots(parent) {
        //console.log(parent)
        parent.selectAll('circles')
        .data(function(d) {
            return d.dotData
        })
        .enter()
        .append('circle')
        .attr("cx",function(d){return xScale(d.date)})
        .attr("cy",function(d){return yScale(d.value)})
        .attr("r",yOffset/4)
        .attr("fill",function(d) {
            return colours[dotSeries.indexOf(d.name)]})
        }

    var getLine = d3.svg.line()
        .x(function(d,i) { 
            return xScale(+d.date); 
        })
        .y(function(d) { 
            return yScale(+d.val); 
        })
        .interpolate(lineSmoothing)


    // Legend
    // if (categories[0]!="") {
    //     var legendyOffset=0
    //     var legend = plot.append("g")
    //         .attr("id",media+"legend")
    //         .on("mouseover",pointer)
    //         .selectAll("g")
    //         .data(categories)
    //         .enter()
    //         .append("g")
    //         .attr ("id",function(d,i){
    //             return media+"l"+i
    //         })

    //     var drag = d3.behavior.drag().on("drag", moveLegend);
    //     d3.select("#"+media+"legend").call(drag);
            
    //     legend.append("text")
    //         .attr("id",function(d,i){
    //             return media+"t"+i
    //         })
    //         .attr("x",yOffset/2-yOffset/5+5)
    //         .attr("y",yOffset/5)
    //         .attr("class",media+"subtitle")
    //         .text(function(d){
    //             return d;
    //         })

    //     legend.append("circle")
    //         .attr("cx",0)
    //         .attr("cy",0)
    //         .attr("r",yOffset/2-yOffset/5)
    //         .style("fill", function(d,i){return colours[i]})

    //     legend.attr("transform",function(d,i){
    //         if (legAlign=='hori') {
    //             var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
    //             if (i>0) {
    //                 var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
    //             }
    //             else {gWidth=0};
    //             legendyOffset=legendyOffset+gWidth;
    //             return "translate("+(legendyOffset)+","+(gHeigt)+")";  
    //         }
    //         else {
    //             var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
    //             return "translate(0,"+((i*yOffset+margin.top)+yOffset/2)+")"};
    //     })

    // }

    function extentMulti(data, columns){
        const ext = data.reduce((acc, row, index)=>{
            let values = columns.map(key=> +row[key])
            let rowExtent = d3.extent(values);
            if(!acc.max){
                acc.max = rowExtent[1];
                acc.min = rowExtent[0];
            }else{
                acc.max = Math.max(acc.max, rowExtent[1]);
                acc.min = Math.min(acc.min, rowExtent[0]);
            }
            return acc;
        },{});
        return [ext.min, ext.max];
    }


    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        console.log(this.getBBox().width)
        var dX = d3.event.x-(this.getBBox().width/2);// subtract cx
        var dY = d3.event.y-(this.getBBox().height);// subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

}