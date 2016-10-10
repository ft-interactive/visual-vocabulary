
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign,colNames){

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

    //console.log(plotWidth,colours,plotHeight,data)
    //console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

    
    //look at all the values
    var allVals = []
    //extract unique values used in heatmap
    var values = data.map(function(d){
        colNames.forEach(function(e){
            allVals.push(d[e])
        })
    })
    
    //identify the unique values in the array
    var filterVals = allVals.filter(function(v,i) {
        return i==allVals.lastIndexOf(v);
    })
    
    //remove falsy values
    var uniqVals = [];
    for (var i = 0; i < filterVals.length; i++) {
      if (filterVals[i]) {
        uniqVals.push(filterVals[i]);
      }
     }

    //can now build a key and link to colours
    


    var rowNames = []
    data.forEach(function(d,i){
        rowNames.push(d.rowname)
    })
    
    /*console.log(rowNames)
    console.log(colNames)*/
    
    var numCols = colNames.length;
    var numRows = rowNames.length;
    
    /*console.log(numCols)
    console.log(numRows)*/
    
    var xScale = d3.scale.ordinal()
        .domain(d3.range(numCols))
        .rangeBands([115,plotWidth],0)
    
    var yScale = d3.scale.ordinal()
        .domain(d3.range(numRows))
        .rangeBands([75,plotHeight],0)
    
    var keyBoxes = plot.append("g")
        .attr("id","key")
        .selectAll("g")
        .data(uniqVals)
        .enter()
        .append("g")
        .attr("transform",function(d,i){
            return "translate("+(xScale.rangeBand()*i)+",10)"
        })
    
    keyBoxes.append("rect")
        .attr("width",xScale.rangeBand())
        .attr("height",yScale.rangeBand())
        .attr("fill",function(d,i){
            return colours[i]
        })
        .attr("stroke",colours[0])
        .attr("stroke-width","1px")
    
    keyBoxes.append("text")
        .attr("text-anchor","middle")
        .attr("fill",function(d,i){
            var dark = isDark(colours[i]);
            if (dark){
                return "#fff"
            }   else    {
                return "#111"
            }
        })
        .attr("x",xScale.rangeBand()/2)
        .attr("y",(yScale.rangeBand()/2)+5)
        .attr('class', media+'keyLabel')
        .text(function(d){
            return d;
        })
    
    
    function isDark(colour){
        var hsl = d3.hsl(colour)
        if (hsl.l>0.5){
            return false
        }   else    {
            return true
        }
    }
    
    var rectArray = d3.range(numCols*numRows)
    
    var rects = plot.append("g").attr("id","grid")
        .selectAll("rect")
        .data(rectArray)
        .enter()
        .append("rect")
        .attr("width",xScale.rangeBand())
        .attr("height",yScale.rangeBand())
        .attr("stroke",colours[2])
        .attr("stroke-width","1px")
        .attr("id",function(d,i){
            return colNames[Math.floor(d/numRows)]+":"+rowNames[d % numRows]
        })
        .attr("x",function(d,i){
            return xScale(Math.floor(d/numRows))
        })
        .attr("y",function(d,i){
            return yScale(d % numRows)
        })
        .attr("fill",function(d,i){
            //match to correct heatmap value
            var match = false;
            for (var i=0;i<uniqVals.length;i++){
                if (data[d % numRows][colNames[Math.floor(d/numRows)]]==uniqVals[i]){
                    match=true;
                    return colours[i]
                }
            }
            if (match==false)    {
                return "none"
            }
        })
    
    //colLabels
    var colLabels = plot.append("g").attr("id","colLabels")
        .selectAll("text")
        .data(colNames)
        .enter()
        .append("text")
        .text(function(d){
            return d;
        })
        .attr("class",media+"labels")
        .attr("text-anchor","middle")
        .attr("y",65)
        .attr("x",function(d,i){
            return xScale(i)+(xScale.rangeBand()/2)
        })
    
    //rowLabels
     var rowLabels = plot.append("g").attr("id","rowLabels")
        .selectAll("text")
        .data(rowNames)
        .enter()
        .append("text")
        .text(function(d){
            return d;
        })
        .attr("class",media+"labels")
        .attr("text-anchor","end")
        .attr("y",function(d,i){
            return yScale(i)+(yScale.rangeBand()/2)
        })
        .attr("x",110)
    
    
    }
