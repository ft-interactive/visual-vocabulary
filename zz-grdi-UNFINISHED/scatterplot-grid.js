
function scatterplotGrid(data,stylename,media,plotpadding,legAlign,yAlign, yMin,yMax,xMin,yMax,numTicksx,numTicksx, yAxisHighlight,axisLabel,xaxisLabel,yaxisLabel, row, column){
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
    var xDomain = d3.extent(data, function(d) {return +d.x;});
    var yDomain = d3.extent(data, function(d) {return +d.y;});

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
    console.log(allRows,allColumns)

    let plotData=allRows.map(function(d){
        return {
            rowName:d,
            columns:getColumns(d)
        }
    })

    function getColumns(row) {
        let columns=allColumns.map(function(d){
            return{
                targetCell:row+d,
                columnName:d,
                values:getValues(d)
            }
        })
        return columns
    }

    function getValues(colCheck) {
        let filtered=data.filter(function(d){
            return d[column]==colCheck
        })
        return filtered

    }

    console.log("plotdata",plotData)

            
    

        


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