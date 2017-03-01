function slopeChart(data,stylename,media,yMin,yMax,plotpadding,legAlign,yHighlight, markers, showLabelLeft,showLabelRigHt, labelleft, labelright){

	//graph options
    var lineSmoothing="monotone";//choose 'linear' for an unsmoothed line
    var logScale=false;
    var logScaleStart=1000;
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height

    // return the series names from the first row of the spreadsheet

    var groupNames = d3.nest()
        .key(function(d){return d.group})
        .entries(data)
        .map(function(d){return d.key});
    for(var i = groupNames.length - 1; i >= 0; i--) {
        if(groupNames[i] == "") {
           groupNames.splice(i, 1);
        }
    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
        this.parentNode.appendChild(this);
        });
    }


    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));

    margin=margin[0].margin[0];
    if(!showLabelLeft){
        margin.left=0
    }
    if(!showLabelRight){
        margin.right=0
    }
    //var colours=stylename.fillcolours;
    var colours= d3.scale.ordinal()
      .domain(groupNames)
      .range(stylename.linecolours);
    
    //workout dimensions of data
    var maxVal = Math.max(d3.max(data, function(d){return parseFloat(d.val1);}),d3.max(data, function(d){return parseFloat(d.val2);}));
    var minVal = Math.min(d3.min(data, function(d){return parseFloat(d.val1);}),d3.min(data, function(d){return parseFloat(d.val2);}));

    yMin=Math.min(yMin,minVal);
    yMax=Math.min(yMax,maxVal);
   

    //create scale for y axis
    var yScale = d3.scale.linear()
        .domain([yMin,yMax])
        .range([h-margin.top,0+margin.bottom])

    //axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("right")
        .ticks(5)
        .tickSize(w-margin.left-margin.right)

    var yText=plot.append("g")
        .attr("class",media+"yAxis")
        .attr("transform",function(){
            return "translate("+margin.left+","+margin.top+")";  
        })
        .call(yAxis);

    yText.selectAll("text")
    .attr("dx",-yOffset/1.8)
    .attr("dy", -4)
    .style("text-anchor", "end")

    //identify 0 line if there is one
    var originValue = 0;
    //console.log(yHighlight)
    var origin = plot.selectAll(".tick")
        .filter(function(d, i) {
            return d==originValue || d==yHighlight;
        }).classed(media+"origin",true);

    var graph = plot.append("g")
            .attr("id",media+"slope")
            .attr("transform",function(){
            return "translate(0,"+margin.top+")";  
        });

    var slopes = graph.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("id",function(d){return d.val1+"-"+d.name+"-"+d.val2})
        .attr("class",function(d,i){
            if(d.label=="yes"){
                return media+"linesHighlight"
            }
            else {return media+"lines"}
            })

    slopes.append("line")
        .attr("stroke",function(d,i){
            if(d.label=="yes"){
                return colours(d.group);
            }
            else {return "#8A8A8A"}
            })
        .attr("x1",margin.left)
        .attr("x2",w-margin.right)
        .attr("y1",function(d){return yScale(d.val1)})
        .attr("y2",function(d){return yScale(d.val2)})

    var el=d3.selectAll("."+media+"linesHighlight")
    el.moveToFront()

    //create dots if requested
    if (markers)   {
        slopes.append("circle")
            .attr("fill",function(d,i){
                if(d.label=="yes"){
                    return colours(d.group);
                }
                else {return "#8A8A8A"}
                })
            .attr("class",function(d,i){
                if(d.label=="yes"){
                    return media+"highlight";
                }
                else {return media+"fill"}  
            })
            .attr("r",yOffset/3.2)
            .attr("cx",margin.left)
            .attr("cy",function(d){return yScale(d.val1)});
        slopes.append("circle")
            .attr("fill",function(d,i){
                if(d.label=="yes"){
                    return colours(d.group);
                }
                else {return "#8A8A8A"}  
            })
            .attr("class",function(d,i){
                if(d.label=="yes"){
                    return media+"highlight";
                }
                else {return media+"fill"}  
            })
            .attr("r",yOffset/3.2)
            .attr("cx",w-margin.right)
            .attr("cy",function(d){return yScale(d.val2)});
    }
    var el=d3.selectAll("."+media+"highlight")
    el.moveToFront()

    //create labels if needed
    if (showLabelLeft) {
        slopes.append("text")
            .attr("class",media+"subtitle")
            .attr("x",margin.left-7)
            .attr("text-anchor","end")
            .attr("y",function(d){return yScale(d.val1)+5})
            .text(function(d){
                if (d.label=="yes"){
                return d.name+" "+d.val1;
                }
        });
    };
    if (showLabelRight) {
        slopes.append("text")
            .attr("class",media+"subtitle")
            .attr("x",w-margin.right+7)
            .attr("text-anchor","start")
            .attr("y",function(d){return yScale(d.val2)+5})
            .text(function(d){
                if (d.label=="yes"){
                    return d.val2+" "+d.name;
                    }
        });
    }

    //column headings
    plot.append("text")
        .attr("x",margin.left)
        .attr("y",margin.top)
        .attr("class",media+"labels")
        .attr("text-anchor",function(){
            if (showLabelLeft) {
                return "end"
            }
            else {return "start"}
        })
        .text(labelleft);
  
    plot.append("text")
        .attr("x",w-margin.right)
        .attr("y",margin.top)
        .attr("class",media+"labels")
        .attr("text-anchor",function(){
            if (showLabelRight) {
                return "start"
            }
            else {return "end"}
        })
        .text(labelright);

    
}