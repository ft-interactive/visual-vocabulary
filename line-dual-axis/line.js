
function lineChart(data, stylename, media, doubleScale,yMinL, yMaxL, yMinR, yMaxR, yAxisHighlight, plotpadding,legAlign,lineSmoothing, logScale, logScaleStart, markers, numTicksy, numTicksyR, ticks,minAxis,interval){


    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date' && d != 'highlight'&& d != 'annotate' ; });
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


    //calculate range of time series 
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var yDomainL;
    var yDomainR;

    let plotData=seriesNames.map(function(d,i){
        return {
            name:d,
            index:i+1,
            lineData:getlines(d,i+1)
        }
    })

    function getlines(group,index) {
        let lineData=[]
        data.forEach(function(el,i){
            //console.log(el,i)
            let column=new Object();
            column.date = el.date
            column.value = +el[group]
            column.highlight = el.highlight
            column.annotate = el.annotate
            column.index = index
            if(el[group]) {
                lineData.push(column)  
            } 
        });
        return lineData
    }

    //calculate range of y axis series data
    data.forEach(function(d,i){
        seriesNames.forEach(function(e,i){
            if((i+1)<=doubleScale) {
                if (d[e]){
                    yMinL=Math.min(yMinL,d[e]);
                    yMaxL=Math.max(yMaxL,d[e]);
                }
            }
            else {
                if (d[e]){
                    yMinR=Math.min(yMinR,d[e]);
                    yMaxR=Math.max(yMaxR,d[e]);
                }
            }
        });			
    });
    yDomainL=[yMinL,yMaxL];
    yDomainR=[yMinR,yMaxR];

    //creat an array of start stop areas
    var boundries= data.filter(function(d) {
        return  (d.highlight==="begin" || d.highlight==="end")
    })
    var shadeAreas=[]

    boundries.forEach(function(d,i){
        if (d.highlight==="begin") {
            shadeAreas.push({begin: d.date,end:boundries[i+1].date}) 
        }
    })

    //Scales

    var yScaleL;
        if (logScale) {
			yScaleL = d3.scale.log()
			.domain([logScaleStart,yMaxL])
			.range([plotHeight,0]);
		}
        else {
			yScaleL = d3.scale.linear()
			.domain(yDomainL)
			.range([plotHeight,0]);
		}

    var yAxisL = d3.svg.axis()
        .scale(yScaleL)
        .ticks(numTicksy)
        .tickSize(yOffset)
        .orient("left")

    if (logScale){
        yAxisL.tickFormat(function (d) {
            return yScaleL.tickFormat(1,d3.format(",d"))(d)
        })   
    }

    var yScaleR;
        if (logScale) {
            yScaleL = d3.scale.log()
            .domain([logScaleStart,yMaxR])
            .range([plotHeight,0]);
        }
        else {
            yScaleR = d3.scale.linear()
            .domain(yDomainR)
            .range([plotHeight,0]);
        }
    var yAxisR = d3.svg.axis()
        .scale(yScaleR)
        .ticks(numTicksyR)
        .tickSize(yOffset)
        .orient("right")

    if (logScale){
        yAxisR.tickFormat(function (d) {
            return yScaleR.tickFormat(1,d3.format(",d"))(d)
        })   
    }

    var yLabelL=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxisL);
    var yLabelR=plot.append("g")
    .attr("class",media+"yAxis")
    .call(yAxisR);

    yLabelL.selectAll('text')
        .attr("style", null);
    yLabelR.selectAll('text')
        .attr("style", null)
        .attr("x", yOffset*2)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelLOffsetL=yLabelL.node().getBBox().width
    yLabelL
        .attr("transform",function(){
            return "translate("+(yLabelLOffsetL)+","+margin.top+")"
            })

    var yLabelLOffsetR=yLabelR.node().getBBox().width
    yLabelR
        .attr("transform",function(){
            return "translate("+(w-yLabelLOffsetR)+","+margin.top+")"
            })

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    var xScale = d3.time.scale()
    //var xScale = scaleWeekday()
        .domain(xDomain)
        .range([0,plotWidth-(yLabelLOffsetL+yLabelLOffsetR)])

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(ticks.major)
        .tickSize(yOffset/2)
        .tickFormat(d3.time.format(formatTick(interval)))
        .orient("bottom");

    function formatTick(int) {
        return {
            "months":"%b",
            "years": "%Y",
            "decade": "%Y",
            "lustrum": "%Y",
            "days": "%d",
            "hours":"%H:%M"
        }[int]
    };

    var xLabel=plot.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(){
            return "translate("+(margin.left+yLabelLOffsetL)+","+(plotHeight+margin.top)+")"
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
                return "translate("+(margin.left+yLabelLOffsetL)+","+(plotHeight+margin.top)+")"
            })
            .call(xAxisMinor);
    }

    if(shadeAreas.length>0){
        plot.selectAll("."+media+"area")
        .data(shadeAreas)
        .enter()
        .call(function(parent){
            parent.append('rect')
                .attr("class",media+"Shade")
                .attr("x", function(d) {
                    return xScale(d.begin)})
                .attr("width", function (d) {return xScale(d.end)-xScale(d.begin)})
                .attr("y", yScaleL(yMaxL))
                .attr("height",plotHeight-yScaleL(yMaxL))
                .attr("transform",function(){
                    return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"
                });
        })
    }

    //add annotation
    var annotations = data.filter(function(d){
        return d.annotate !="" && d.annotate !=undefined;
    })

    var anno = plot.append("g")
        .attr("id","annotations")
        .attr("transform",function(){
                return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"
        })

    anno.selectAll("line")
        .data(annotations)
        .enter()
        .append("line")
        .attr("class",media+"annotationLine")
        .attr("x1",function(d){return xScale(d.date)})
        .attr("x2",function(d){return xScale(d.date)})
        .attr("y1",yScaleL.range()[0])
        .attr("y2",yScaleL.range()[1]-5)

    anno.selectAll("text")
        .data(annotations)
        .enter()
        .append("text")
        .attr("class",media+"annotationText")
        .attr("text-anchor","middle")
        .attr("x",function(d){return xScale(d.date)})
        .attr("y",yScaleL.range()[1]-10)
        .text(function(d){
            return d.annotate
        })


    //create a line function that can convert data[] into x and y points
    var lineData= d3.svg.line()
        .x(function(d) { 
            return xScale(d.date); 
        })
        .y(function(d) { 
            if(d.index <= doubleScale){
                return yScaleL(d.value);
            }
            else {return yScaleR(d.value);}
        })
        .interpolate(lineSmoothing)

    var lines = plot.append("g")
    .attr("id","series").selectAll("g")
            .data(plotData)
            .enter()
            .append("g")
            .attr("id",function(d){return d.name;})
            .call(function(parent){
                console.log("parent")
                parent.selectAll("."+media+"lines")
                    .data(function(d){
                        return [d.lineData]
                    })
                    .enter()
                    .append("path")
                    .attr("class",media+"lines")
                    .attr("stroke",function(d,i){
                        return colours[(d[0].index-1)];  
                    })
                    .attr('d', function(d){
                        return lineData(d);
                    })
                    .attr("transform",function(){
                        return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"
                    })

            })
            .call(function(parent){
                //if needed, create markers
                    if (markers){
                        parent.selectAll("circle")
                        .data(function (d){
                            return d.lineData
                        })
                        .enter()
                        .append("circle")
                        .attr("fill",function(d){
                            return colours[(d.index-1)]
                        })
                        .attr("r",yOffset/4)
                        .attr("id",function(d){
                            console.log(d.date+":"+d.value);
                            return d.date+":"+d.value;
                        })
                        .attr("cx",function(d){return xScale(d.date)})
                        .attr("cy",function(d){
                            if(d.index <= doubleScale) {
                                return yScaleL(d.value)
                            }
                            else {return yScaleR(d.value)}
                        })
                        .attr("transform",function(){
                            return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"
                        })
                    }
            })
            .call(function(parent){
                parent.selectAll("circle")
                .data(function(d){
                    let dots=d.lineData
                    dots=dots.filter(function(d){
                        return d.highlight=="yes"
                    })
                    return dots
                })
                .enter()
                .append("circle")
                .attr("fill",function(d){
                    return colours[(d.index-1)]
                })
                .attr("r",yOffset/4)
                .attr("cx",function(d){return xScale(d.date)})
                .attr("cy",function(d){
                    if(d.index <= doubleScale) {
                        return yScaleL(d.value)
                    }
                    else {return yScaleR(d.value)}
                })
                .attr("transform",function(){
                    return "translate("+(margin.left+yLabelLOffsetL)+","+(margin.top)+")"
                })

            })

    d3.selectAll(".domain").remove()

    //Add labels so that the preflight script in illustrator will work
    d3.selectAll(".printxAxis text")
    .attr("id","xAxisLabel")
    d3.selectAll(".printyAxis text")
    .attr("id","yAxisLabel")
    d3.selectAll(".printyAxis line")
    .attr("id","yAxisTick")
    d3.selectAll(".printxAxis line")
    .attr("id","xAxisTick")

    if (seriesNames[0]!="x"){
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
                return "translate(0,"+((i*yOffset))+")"};
    })

    }
    

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }

    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }


    function scaleWeekday(){
        var domain = [0,1];
        var range = [0,1];
        var msDay = 60000 * 60 * 24; //number of ms in a day
        function scale(x){
            //TODO: check we have a date... if not NaN
            //if it's a weekend reject, returning NaN
            if(x.getDay() == 0 || x.getDay() == 6) return undefined; //sunday is 0, saturday is 6
            var domainWeekendsMs = countWeekendDays(domain[0], domain[1]) * msDay;
            //  console.log(domain[0] + '->' + x, ' weekend days ' + countWeekendDays(domain[0], x) )
            //  console.log('adjusting')
            //  console.log(x.getTime(),'-',countWeekendDays(domain[0],x) * msDay)
            var adjustedValue = ( x.getTime() - (countWeekendDays(domain[0],x) * msDay) )-domain[0].getTime();
            var scaleFactor = (range[1] - range[0]) / ((domain[1] - domain[0]) - domainWeekendsMs ); //range units per ms
            //  console.log('scale', scaleFactor);
            return adjustedValue * scaleFactor;
        }

        scale.invert = function(x){ //TODO, this would be useful
        }
        scale.domain = function(x){
            if(!x) return domain;
            domain = x;
            return scale;
        }

        scale.range = function(x){
            if(!x) return range;
            range = x;
            return scale;
        }

        function countWeekendDays(d1, d2){ //how many weekend days are there between d1 and d2
            var firstday = d1.getDay();
            var daySpan = (d2.getTime() - d1.getTime() - firstday) / msDay;
            var weekSpan = (daySpan / 7) | 0;
            var weekRemainder = Math.ceil(daySpan % 7);
            var extra = 0;
            if (firstday + weekRemainder > 7){
            extra = 2;
            }else if (firstday + weekRemainder == 7 || weekRemainder > firstday){
            extra = 1;
            }
            return weekSpan * 2 + extra;
        }


        return scale;
    }





}