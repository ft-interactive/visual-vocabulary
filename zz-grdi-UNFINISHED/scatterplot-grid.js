
function scatterplotGrid(data,stylename,media,plotpadding,legAlign,yAlign, yMin,yMax,xMin,yMax,numTicksx,numTicksx, yAxisHighlight,axisLabel, row, column,xPlot,yPlot){
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

    function getByRowCol(arr, key1, key2){
        return arr.filter(function(d){
            return (d.row == key1 && d.column ==key2)
        })
    }

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

    console.log("plotdata",plotData)

    let rowLabelOffset=d3.select("#"+media+"Subtitle").style("font-size");
    rowLabelOffset=Number(rowLabelOffset.replace(/[^\d.-]/g, ''));

    var yScalePos = d3.scale.ordinal()
        .rangeBands([plotHeight+margin.top, margin.top+rowLabelOffset])
        .domain(allRows);

    let rowHeight=yScalePos.rangeBand()*.95

    var xScalePos = d3.scale.ordinal()
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
        .attr("width",xScalePos.rangeBand()*.95)
        .attr("height",plotHeight)
        .attr("x",function (d,i) {
            return xScalePos(allColumns[i])})
    plotColumns.append('text')
        .attr("class",media+"labels")
        .attr("width",(xScalePos.rangeBand()*.95))
        .attr("x",function (d,i) {
            return xScalePos(allColumns[i])+(xScalePos.rangeBand()/2)})
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
        .attr("height",yScalePos.rangeBand()*.95)
        .attr("y",function (d,i) {return yScalePos(allRows[i])})
    plotRows.append('text')
        .attr("class",media+"labels")
        .attr("width",rowHeight)
        .attr("transform", function(d,i){
            let yAdjust=(yScalePos(allRows[i]))+(rowHeight/2)
            return "translate("+(rowLabelOffset)+","+(yAdjust)+") rotate(-90)";
        })
        .text(function(d){
            return d})

    let cellWidth=xScalePos.rangeBand()*.95
    let cellHeight=yScalePos.rangeBand()*.95

    var yScale=d3.scale.linear()
        .domain(yDomain)
        .range([cellHeight,0])

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(numTicksy)
        .orient("left")

    let cellData=d3.nest()
        .key(function(d){return d.targetCell})
        .entries(plotData)

    console.log(cellData)

    var cell = plot.selectAll("."+media+"cells")
        .data(cellData)
        .enter()
        .append("svg")
        .attr("id", "toCome")
        .attr("class", media+"cells")
        .attr("transform", function(d) {return "translate("+(margin.left+rowLabelOffset)+","+(margin.top)+")"; })

    cell.append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("x",function(d){
            console.log(d.colName)
            return xScalePos(d.values.rowName)})
        .attr("y",function(d,i){return yScalePos(d.values.colName)})



    






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