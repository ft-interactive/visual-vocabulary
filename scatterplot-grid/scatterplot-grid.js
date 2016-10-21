
function scatterplotGrid(data,stylename,media,plotpadding,legAlign,yAlign, yMin,yMax,xMin,xMax,numTicksx,numTicksx, yAxisHighlight,axisLabel, row, column,xPlot,yPlot){
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    yAlign="left"//sets all y axis to left on the grid

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

    
    //calculate range of time series 
    var xDomain = d3.extent(data, function(d) {return +d[xPlot];});
    var yDomain = d3.extent(data, function(d) {return +d[yPlot];});

    console.log(xDomain,yDomain)

    xDomain[0]=Math.min(xMin,xDomain[0]);
    xDomain[1]=Math.max(xMax,xDomain[1]);
    yDomain[0]=Math.min(yMin,yDomain[0]);
    yDomain[1]=Math.max(yMax,yDomain[1]);

    let allRows=d3.nest()
        .key(function(d){return d[row]})
        .entries(data)
        .map(function(d){
            if(d.key=="undefined") {
                return 'row'
            }
            else {return d.key}
        });

    let allColumns=d3.nest()
        .key(function(d){return d[column]})
        .entries(data)
        .map(function(d){
            if(d.key=="undefined") {
                return 'column'
            }
            else {return d.key}
        });

    let plotData=classify(data,row,column);

    // function getByRowCol(arr, key1, key2){
    //     return arr.filter(function(d){
    //         return (d.row == key1 && d.column ==key2)
    //     })
    // }

    function classify(arr, key1, key2){
        return arr.map(function(d){
            return {
                data:d,
                rowName:d[key1],
                colName:d[key2],
                targetCell:d[key1]+d[key2],
                xPlot:d[xPlot],
                yPlot:d[yPlot]
            }
        })
    }

    let rowLabelOffset=d3.select("#"+media+"Subtitle").style("font-size");
    rowLabelOffset=Number(rowLabelOffset.replace(/[^\d.-]/g, ''));

    var yScaleRow = d3.scale.ordinal()
        .rangeBands([plotHeight+margin.top, margin.top+rowLabelOffset])
        .domain(allRows);

    let rowHeight=yScaleRow.rangeBand()*.95

    var xScaleCol = d3.scale.ordinal()
        .rangeBands([margin.left+rowLabelOffset, plotWidth-margin.right-rowLabelOffset])
        .domain(allColumns);

    var plotColumns=plot.selectAll("."+media+"columns")
        .data(allColumns)
        .enter()
        .append('g')
        .attr("transform", function(d) {return "translate("+(margin.left+rowLabelOffset)+","+(margin.top)+")"; })

    plotColumns.append('rect')
        .attr("class",media+"columns")
        .attr("fill",colours[0])
        .attr("width",xScaleCol.rangeBand()*.95)
        .attr("height",plotHeight)
        .attr("x",function (d,i) {
            return xScaleCol(allColumns[i])})
    plotColumns.append('text')
        .attr("class",media+"labels")
        .attr("width",(xScaleCol.rangeBand()*.95))
        .attr("x",function (d,i) {
            return xScaleCol(allColumns[i])+(xScaleCol.rangeBand()/2)})
        .attr("y",rowLabelOffset)
        .text(function(d,i){return allColumns[i]})

    var plotRows=plot.selectAll("."+media+"rows")
        .data(allRows)
        .enter()
        .append('g')
        .attr("transform", function(d) {return "translate("+(margin.left)+","+(margin.top)+")"; })

    plotRows.append('rect')
        .attr("class",media+"rows")
        .attr("fill",colours[0])
        .attr("width",plotWidth)
        .attr("height",yScaleRow.rangeBand()*.95)
        .attr("y",function (d,i) { 
            return yScaleRow(allRows[i])})
    plotRows.append('text')
        .attr("class",media+"labels")
        .attr("width",rowHeight)
        .attr("transform", function(d,i){
            let yAdjust=(yScaleRow(allRows[i]))+(rowHeight/2)
            return "translate("+(rowLabelOffset)+","+(yAdjust)+") rotate(-90)";
        })
        .text(function(d){
            return d})

    let cellWidth=xScaleCol.rangeBand()*.95
    let cellHeight=yScaleRow.rangeBand()*.95

    var yScale=d3.scale.linear()
        .domain(yDomain)
        .range([cellHeight-margin.top-margin.bottom,0])

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient(yAlign)

    var xScale = d3.scale.linear()
        .domain(xDomain)
        .range([0,(cellWidth-rowLabelOffset-margin.left-margin.right)]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(numTicksx)
        .tickSize(yOffset/2)
        .orient("bottom");

    let cellData=d3.nest()
        .key(function(d){return d.targetCell})
        .entries(plotData)
        .map(function(e) {
            return {
              key: e.key,
              values:e.values,
              colName:e.values[0].colName,
              rowName:e.values[0].rowName
            }
        })

    //console.log("cellData",cellData)

    var cell = plot.selectAll("."+media+"cells")
        .data(cellData)
        .enter()
        .append("g")
        .attr("id", function(d){return d.key})
        .attr("class", media+"cells")
        .attr("transform", function(d) {return "translate("+(margin.left+rowLabelOffset)+","+(margin.top)+")"; })

    cell.append("rect")
    .attr("fill","#ffffff")
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("x",function(d){
        return xScaleCol(d.colName)})
    .attr("y",function(d,i){
        return yScaleRow(d.rowName)})

    yLabel=cell.append("g")
        .attr("class",media+"yAxis")
        .call(yAxis)

    //calculate what the ticksize should be now that the text for the labels has been drawn
    var yLabelOffset=yLabel.node().getBBox().width;
    var yticksize=colculateTicksize(yAlign, yLabelOffset);

    yLabel.call(yAxis.tickSize(yticksize))
    yLabel
        .attr("transform",function(d){
                let colOffset=xScaleCol(d.colName)+yticksize+rowLabelOffset;
                let rowOffset=yScaleRow(d.rowName)+margin.top
                return "translate("+(colOffset)+","+(rowOffset)+")"
            });

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yAxisHighlight;
        }).classed(media+"origin",true);

    xLabel=cell.append("g")
        .attr("class",media+"xAxis")
        .attr("transform",function(d){
                let colOffset=xScaleCol(d.colName)+rowLabelOffset;
                let rowOffset=yScaleRow(d.rowName)+cellHeight-margin.bottom
                return "translate("+(colOffset)+","+(rowOffset)+")"
            })
        .call(xAxis);

    cell.call(addDots)

    function addDots(parent) {
        //console.log(parent)
        parent.selectAll('circles')
        .data(function(d) {
            return d.values
        })
        .enter()
        .append('circle')
        .attr("cx",function(d){return xScale(d.data[xPlot])})
        .attr("cy",function(d){return yScale(d.data[yPlot])})
        .attr("r",yOffset/4)
        .attr("fill",function(d) {
            return colours[0]})
        .attr("transform",function(d){
                let colOffset=xScaleCol(d.colName)+rowLabelOffset;
                let rowOffset=yScaleRow(d.rowName)+margin.top
                return "translate("+(colOffset)+","+(rowOffset)+")"
            })

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
            //console.log("cellWidth",cellWidth)
            return cellWidth-margin.left-offset
        }
        else {
            //console.log("cellWidth",cellWidth)
            return cellWidth-margin.right-offset}
    }

}