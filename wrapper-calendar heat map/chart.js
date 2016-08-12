
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign,fiscal){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
    //Select the plot space in the frame from which to take measurements
    var div = d3.select("body").append("div")   
    .attr("class", media+"Title")               
    .style("opacity", 0);

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
    var maxVal=d3.max(data, function(d){return +d.value})
    var minVal=d3.min(data, function(d){return +d.value})

    var colours = d3.scale.linear()
    .range(["white", stylename.fillcolours[0]])
    .domain([minVal, maxVal]);

    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    var parseDate = d3.time.format("%d/%m/%Y").parse;
    var cellSize = plotWidth/54; // cell size

    
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var startYear=xDomain[0].getFullYear();
    var endYear=xDomain[1].getFullYear();

    var percent = d3.format(".1%");
    var format = d3.time.format("%Y-%m-%d");
    var toolDate = d3.time.format("%d/%b/%y");

    var fiscalPlot=data.map(function(d,i){
        //d3.time.weekOfYear(d.date)
        return {
            date:d.date,
            value:d.value,
            fyear: getFiscalYear(d.date),
            fweek: getFiscalWeek(d.date)
        }
    })
    function getFiscalYear(e){
        var startDate="06/04/"+e.getFullYear()
        if(e>=parseDate(startDate)){
            //console.log("greater",e)
            return e.getFullYear()+1
        }
        else {
            return e.getFullYear()}
    }

    function getFiscalWeek(e){
        var startDate="06/04/"+e.getFullYear()
        var week=d3.time.weekOfYear(e)  
        var startWeek=d3.time.weekOfYear(parseDate(startDate))
        if(e>=parseDate(startDate)) {
            var fweek=week-startWeek
        }
        else {
            var fweek=52-(startWeek-week);
        }
        return fweek
    }

    if (fiscal){
        var plotData=d3.nest()
        .key(function(d){return d.fyear;})
        .entries(fiscalPlot)
    }
    else {
        var plotData=d3.nest()
        .key(function(d){return d.date.getFullYear();})
        .entries(data)
    }

    //console.log(plotData)

    var calendar = plot.selectAll("g")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) {return d.key+"-"+d.value})
        .attr("transform",function(d,i){
                 return "translate("+(0)+","+(i*(cellSize*7+yOffset*2)+margin.top)+")"
            })
    .call(function(parent){

        parent.append("text")
            .attr("class", media+"subtitle")
            .attr("y",yOffset)
            .text(function(d) {
                if (fiscal) {return "Year ending "+d.key}
                else {return d.key}
            })

        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=parent.append('g').attr('id','dayLabels')
        days.forEach(function(d,i)    {
            dayLabels.append('text')
            .attr('class',media+'subtitle')
            .attr('x',0)
            .attr('y',function(d) { return yOffset*1.4+(i * cellSize); })
            .attr('dy','0.9em')
            .text(d);
        })

        var rects = parent.append('g')
        .attr("transform",function(d,i){
                 return "translate("+(0)+","+yOffset*1.5+")"
            })
            .attr('id','alldays')
            .selectAll('.day')
            .data(function(d) { 
                return d.values
                //return d3.time.days(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1));
            })
            .enter().append('rect')
            .on("mouseover", function(d) {
            var dayNumber=d3.time.format("%j")    
            div.transition()             
                .style("opacity", .9);      
            div .html(d.date+" "+d3.time.weekOfYear(d.date)+"</br>"+dayNumber(d.date)+" value"+d.value+" fweek "+getFiscalWeek(d.date))  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })  
            .attr('id',function(d) {
                return '_'+format(d.date);
                //return toolDate(d.date)+':\n'+d.value+' dead or missing';
            })
            .attr('class', media+'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', function(d) {
                if (fiscal){
                    return d.fweek * cellSize+margin.left;
                }
                else {return (d3.time.weekOfYear(d.date) * cellSize+margin.left)};
            })
            .attr('y', function(d) { return (d.date.getDay() * cellSize); })
            .style("fill",function(d) {return colours(d.value)})
            //.datum(format);

            //add montly outlines for calendar
            parent.append('g')
            .attr('id',media+'monthOutlines')
            .selectAll('.month')
            .data(function(d) {
                if (fiscal){
                    return d3.time.months(new Date(parseInt(d.key)-1, 3, 1),
                        new Date(parseInt(d.key), 2, 31));

                }
                else {
                    return d3.time.months(new Date(parseInt(d.key), 0, 1),
                    new Date(parseInt(d.key), 11, 31));} 
            })
            .enter().append('path')
            .attr('class', media+'month')
            .attr('transform','translate('+(margin.left)+','+(yOffset*1.5)+')')
            .attr('d', monthPath);

            //retreive the bounding boxes of the outlines
            var BB = new Array();
            var mp = document.getElementById(media+'monthOutlines').childNodes;
            for (var i=0;i<mp.length;i++){
                BB.push(mp[i].getBBox());
            }
            var monthX = new Array();
            BB.forEach(function(d,i){
                boxCentre = d.width/2;
                monthX.push(d.x+boxCentre);
            })

            //create centred month labels around the bounding box of each month path
            //create day labels
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var monthLabels=parent.append('g').attr('id','monthLabels')
            months.forEach(function(d,i)    {
                monthLabels.append('text')
                .attr('class',media+'subtitle')
                .attr('x',monthX[i]+margin.left)
                .attr('x',function (d) {
                    if (fiscal && i<3){
                        return monthX[i+9]+margin.left
                    }
                    if (fiscal && i>2){
                        return monthX[i-3]+margin.left
                    }
                    else {return monthX[i]+margin.left}
                })
                .attr('y',yOffset)
                .text(d);
            })

            // add min/max legend


            //not quite pure Bostock, little bit of Haslett also - compute and return monthly path data for any year
            function monthPath(t0) {
                //console.log("t0",t0)
                var t1 = new Date(t0.getFullYear(),t0.getMonth() + 1, 0)
                //console.log("t1",t1)
                if (fiscal){
                    var w0 = getFiscalWeek(t0), w1 = getFiscalWeek(t1)
                    if(w0>w1){w0=0}
                }
                else {
                    var w0 = d3.time.weekOfYear(t0), w1 = d3.time.weekOfYear(t1)
                }
                //console.log("w",w0,w1)
                var d0 = t0.getDay(), d1 = t1.getDay();
                if(w0==0){d0=0};
                //console.log("d",d0,d1)
                return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                    + "H" + w0 * cellSize + "V" + 7 * cellSize
                    + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                    + "H" + (w1 + 1) * cellSize + "V" + 0
                    + "H" + (w0 + 1) * cellSize + "Z";
            }

    })
    var legData=[{val: minVal,text:"min value"},{val: maxVal, text: "max value"}]

    //create a legend first
    var legendyOffset=0
    var legend = plot.append("g")
        .attr("id",media+"legend")
        .on("mouseover",pointer)
        .selectAll("g")
        .data(legData)
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
        .attr("x",yOffset+yOffset/5)
        .attr("y",0)
        .attr("class",media+"subtitle")
        .text(function(d){
            return d.text+" "+d.val;
        })

    legend.append("rect")
        .attr("x",0)
        .attr("y",-yOffset+yOffset/3)
        .attr("width",(yOffset/100)*85)
        .attr("height",(yOffset/100)*70)
        .style("fill", function(d,i){return colours(d.val)})

    legend.attr("transform",function(d,i){
        if (legAlign=='hori') {
            var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
            if (i>0) {
                var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
            }
            else {gWidth=0};
            legendyOffset=legendyOffset+gWidth;
            return "translate("+(legendyOffset)+","+(gHeigt)+")";  
        }
        else {
            var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
            return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
    })

    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }
    

}