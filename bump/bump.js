
function bumpChart(data,stylename,media,plotpadding,legAlign,yAlign, yMin, yMax, numbers){

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

    let plotData=seriesNames.map(function(d,i){
        return {
            group:d,
            index:i,
            rankings:getGroups(d,i),
        }
    })

    function getGroups(group,index) {
        //console.log(group,index)
        let rankings=[]
        data.forEach(function(el,i){
            let column=new Object();
            column.pos= +el.pos
            column.group=group
            column.prevGroup=seriesNames[index-1]
            column.item=el[group]
            column.prev=getPrev(el[group], index)
            column.status=column.prev-column.pos
        rankings.push(column)
        });
        return rankings
    }

    //finds the items previous ranking
    function getPrev(item,i) {
        //console.log(item,seriesNames[i-1])
        let ref = seriesNames[i-1]
        const prev = data.find(function(d){
            return d[ref]==item;
        });
        //checks to see if undefined Nan etc
        if(!prev) return prev;
        return +prev.pos;
    }

    console.log("plotData", plotData)

    var yScale = d3.scale.ordinal()
    .rangeBands([0, plotHeight],.2)
    .domain(data.map(function(d) { return d.pos;}));

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0);

    var yLabel=plot.append("g")
    .attr("id", media+"yAxis")
    .attr("class", media+"yAxis")
    .call(yAxis)

    var yLabelOffset=yLabel.node().getBBox().width

    yLabel
        .attr("transform",function(){
            return "translate("+(yLabelOffset+margin.left)+","+margin.top+")"
            })

    var xScale = d3.scale.ordinal()
    .rangeBands([0, plotWidth-yLabelOffset],.4)
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

    plot.selectAll("."+media+"bar")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) { return d.group; })
        .attr("class", media+"category")
        .call(function(parent){

        parent.selectAll('rect')
            .data(function(d){
                return d.rankings
            })
            .enter()
            .append("rect")
            .attr("class",media+"fill")
            .attr("width", xScale.rangeBand())
            .attr("height", yScale.rangeBand())
            .attr("y", function(d){return yScale(d.pos)})
            .attr("x", function(d){return xScale(d.group)})
            .attr("fill",function(d){
                if(d.status>0){
                    return "#76ACB8"
                }
                if(d.status<0){
                    return "#BB6D82"
                }
                else {return "#B8B1A9"}
            })
            .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            })

        parent.selectAll('text')
            .data(function(d){
                    return d.rankings
                })
            .enter()
            .append("text")
            .attr("class", media+"labels")
            .style("text-anchor",function(d){
                if (d.group==seriesNames[0]) {
                    return "start"
                }
                else {return "middle"}
            })
            .attr("y", function(d){return yScale(d.pos)+(yScale.rangeBand()*.7)})
            .attr("x", function(d){
                if(d.group==seriesNames[0]) {
                    return xScale(d.group)+(xScale.rangeBand()/8)
                }
                else {return xScale(d.group)+(xScale.rangeBand()/2)}
                })
            .text(function(d){
                if(d.status>0){

                    if (numbers) {
                         return "+"+d.status
                    }
                    else {return d.item+" +"+d.status}
                }
                if(d.status<0){
                    if (numbers) {
                         return d.status
                    }
                    else {return d.item+" "+d.status}
                }
                else {return d.item}
            })
            .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            })

        parent.selectAll("."+media+'link')
            .data(function(d){
                    console.log("data",d.rankings.filter(function(el){return el.status}))
                    return d.rankings.filter(function(el){return el.status>=0 || el.status<=0})
                })
            .enter()
            .append("path")
          .attr("class",media+"link")
          .attr("stroke-width",function (d){return (yScale.rangeBand()/1.3)})
          .attr("d", function(d) {
            let x = xScale(d.prevGroup)+(xScale.rangeBand());
            let y = yScale(d.prev)+(yScale.rangeBand()/2);
            let x1 = xScale(d.group);
            let y1 = yScale(d.pos)+(yScale.rangeBand()/2);
            return "M" + x + "," + y
                + "C" + (x+(xScale.rangeBand()/4)) + "," +y
                + " " + (x1-(xScale.rangeBand()/4)) + "," + y1
                + " " + x1 + "," + y1;
          })
          .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            });

        })



}