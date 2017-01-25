
function bumpChart(data,stylename,media,plotpadding,legAlign,yAlign, yMin, yMax, numbers,rects){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d!="pos" ; });
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
    
    yMin=Math.min(yMin,d3.min(data, function(d) { return +d.pos;}))
    yMax=Math.max(yMax,d3.max(data, function(d) { return +d.pos;}))

    let terminusLabels=data.map(function(d){
    let last=seriesNames.length-1
        return{
            pos:d.pos,
            startLabel: d.pos+": "+d[seriesNames[0]],
            endlabel: d.pos+": "+d[seriesNames[last]]
        }
    })

    let plotData=seriesNames.map(function(d,i){
        return {
            group:d,
            index:i+1,
            rankings:getGroups(d,i)
        }
    })

    function getGroups(group,index) {
        let rankings=[]
        data.forEach(function(el,i){
            let column=new Object();
            column.pos= +el.pos
            column.group=group
            column.prevGroup=seriesNames[index-1]
            column.nextGroup=seriesNames[index+1]
            column.item=el[group]
            column.prev=relPositions("prev",el[group], index-1)
            column.next=relPositions("next",el[group], index+1)
            column.status=column.prev-column.pos
        rankings.push(column)   
        });
        return rankings
    }

    //finds the items previous ranking
    function relPositions(trace,item,i) {
        let lookup = seriesNames[i]
        const prev = data.find(function(d){
                return d[lookup]==item;
        });
        //checks to see if undefined Nan etc
        if(!prev) return prev;
        return +prev.pos;
    }

    let terminus=[]
    let items=[]
    plotData.forEach(function(d){
        let start=d.rankings.filter(function (el){
            items.push(el.item)
            return (el.prev==undefined)
        })
        terminus.push.apply(terminus, start);

    })
    terminus=terminus.filter(function(d){
        return (d.next!=undefined)
    })


    let paths=terminus.map(function(d) {
        return {
            item: d.item,
            indexStart: seriesNames.indexOf(d.group),
            indexEnd: endindex(d.item,seriesNames.indexOf(d.group)+1),
            pathData: getPaths(d.item,seriesNames.indexOf(d.group),endindex(d.item,seriesNames.indexOf(d.group))+1),
            pos: d.pos,
            posEnd: ""
        }
    })
    paths.forEach(function(d) {
        let last = +d.pathData.length-1
        d.posEnd=d.pathData[last].pos
    })

    // console.log(plotData)
    // console.log("paths",paths)

    function getPaths(item, indexStart,indexEnd) {
        //console.log(item,indexStart,indexEnd)
        let plotArray=[]
        for (var i = indexStart; i < indexEnd; i++) {
            //console.log("seriesNames",seriesNames[i])
            //console.log("plotData",plotData[i])
            let points=plotData[i].rankings.filter(function(d){
                return(d.item==item)
            })
            plotArray.push.apply(plotArray, points);
        }
        return (plotArray)
    }

    function endindex(item, start) {
        var end=0
        for (var i = start; i < plotData.length; i++) {
            let lookup = plotData[i]
            test=lookup.rankings.every(function(el){
                end=i
                if(el.item==item && el.next==undefined) {
                    return false;
                }
                else return true;
            })
            if(!test) { break}
        }
        return end
    }


    var yScale = d3.scale.ordinal()
    .rangeBands([0, plotHeight],.2)
    .domain(terminusLabels.map(function(d) { return d.pos;}));
    
    let ticks=terminusLabels.map(function(d) { return d.startLabel;})

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0)
    //.tickFormat(function (d){return ticks[d-1]});

    var yLabel=plot.append("g")
    .attr("id", media+"yAxis")
    .attr("class", media+"yAxis")
    .call(yAxis)

    var yLabelOffset=yLabel.node().getBBox().width

    yLabel
        .attr("transform",function(){
            return "translate("+(yLabelOffset+margin.left)+","+margin.top+")"
            })

    var yScaleR = d3.scale.ordinal()
    .rangeBands([0, plotHeight],.2)
    .domain(terminusLabels.map(function(d) { return d.endlabel;}));
    var yAxisR = d3.svg.axis()
    .scale(yScaleR)
    .orient("right")
    .tickSize(0);

    var yLabelR=plot.append("g")
    .attr("id", media+"yAxis")
    .attr("class", media+"yAxis")
    .call(yAxisR)

    var yLabelOffsetR=yLabelR.node().getBBox().width
    plotWidth=plotWidth-yLabelOffsetR
    yLabelR
        .attr("transform",function(){
            return "translate("+(plotWidth+margin.left)+","+margin.top+")"
            })


    var xScale = d3.scale.ordinal()
    .rangeBands([0, plotWidth-yLabelOffset],.2)
    .domain(seriesNames.map(function(d) { return d;}));

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .tickSize(0);

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            })
      .call(xAxis);

    let columns=plot.selectAll("."+media+"category")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) { return d.group; })
        .attr("class", media+"category")
        .attr("transform",function(i){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            })
    
    columns.append("rect")
                .style("fill","#000000")
                .attr("class", media+"column")
                .attr("x",function (d) {return xScale(d.group)})
                .attr("y",0)
                .attr("width",function (d) {return xScale.rangeBand()})
                .attr("height",plotHeight)
    
    // columns.call(function(parent){
                
    //     parent.selectAll('text')
    //         .data(function(d){
    //                 return d.rankings
    //             })
    //         .enter()
    //         .append("text")
    //         .attr("class", media+"subtitle")
    //         .style("text-anchor", "middle")
    //         .attr("y", function(d){
    //             return yScale(d.pos)+yOffset*1.4})
    //         .attr("x", function(d){return xScale(d.group)+(xScale.rangeBand()/2)})
    //         .text(function(d,i){
    //             if(d.prev==undefined && d.group!=seriesNames[0]){
    //                 return d.item
    //             }
    //             if(d.group==seriesNames[0]){
    //                 return ""
    //             }
    //             return d.status})
    //     })

    //create a line function that can convert data[] into x and y points
    var lineData= d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.group)+xScale.rangeBand()/2; 
        })
        .y(function(d) { 
            return yScale(d.pos)+yScale.rangeBand()/2; 
        })
        .interpolate("monotone")

    var reg = new RegExp("[ ]+","g");

    plot.selectAll("."+media+"linkGroup")
        .data(paths)
        .enter()
        .append("g")
        .attr("id",function(d) { return "group"+d.item; })
        .attr("class",media+"linkGroup")
        .attr("transform",function(){
                    return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
                })

        .call(function(parent){
        parent.append('circle')
        .attr("class",media+"fill")
        .attr("id",function(d) {
            let id="circle"+media+d.item.replace(reg,"");
            return id; })
        .attr("r",yOffset/6)
        .attr("cx",function(d){
            let x=d.indexStart
            return xScale(seriesNames[x])+xScale.rangeBand()/2})
        .attr("cy",function(d){
            let y=d.pos
            return yScale(y)+yScale.rangeBand()/2})
        parent.append('circle')
        .attr("class",media+"fill")
        .attr("id",function(d) {
            let id="circle"+media+d.item.replace(reg,"");
            return id; })
        .attr("r",yOffset/6)
        .attr("cx",function(d){
            let x=d.indexEnd
            return xScale(seriesNames[x])+xScale.rangeBand()/2})
        .attr("cy",function(d){
            let y=d.posEnd
            return yScale(y)+yScale.rangeBand()/2})

        })
        
        .call(function(parent){

        parent.selectAll("."+media+"link")
        .data(function(d){
            return [d.pathData]
        })
        .enter()
        .append("path")
        .classed(media+"linkGroup",false)
        .attr("class",media+"link")
        .attr("id",function(d) {
            let id=media+d[0].item.replace(reg,"");
            return id; })
        .on("click",function(d) {
            let id=this.id.replace(reg,"");
            return highlightlink(id)})
        .attr("stroke-width",yOffset/5)
        .attr('d', function(d){
            return lineData(d);
        })

        function highlightlink(linkName) {
            let selected=d3.selectAll("#"+linkName)
            var elClass = selected[0];
            var el=d3.select(elClass[0])
            if (el.attr("class")==media+"link") {
                    selected.attr("class",media+"linkhighlight")
                }
            else {selected.attr("class",media+"link")}

            selected=d3.selectAll("#"+"circle"+linkName)
            elClass = selected[0];
            el=d3.select(elClass[0])
            if (el.attr("class")==media+"fill") {
                    selected.attr("class",media+"highlight")
                }
            else {selected.attr("class",media+"fill")}
        }

    })

        

}