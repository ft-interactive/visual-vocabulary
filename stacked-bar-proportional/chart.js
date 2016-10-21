
function makeChart(data,seriesNames,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    //var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

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
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered


    //should sort the data in size of total size


    //identify total size - used for y axis
     var totalSize = d3.sum(data, function(d){
        return d.size;
    })


    //identify the series which are part to whole elements [need the 'prop_' prefix]
    var propMatch = /prop_/;
    var components = []
    seriesNames.forEach(function(d){
        if (d.match(propMatch)){
            components.push(d)
        }
    })

    //prepare the stacks for the x axis 
   var xData = [];
   components.forEach(function(d,i){
        var values = []
        data.forEach(function(e,j){
            values.push({x:0,y:e[d]});
        })
        xData.push(values)
   })

   var xStack = d3.layout.stack();
   xStack(xData)

    var xScale = d3.scale.linear()
        .domain([0,100])
        .range([0,plotWidth])

    var yScale = d3.scale.linear()
        .domain([0,totalSize])
        .range([0,plotHeight])

    var yData = data.map(function(d,i){
        return [{x:0,y:d.size}]
    })

    //stack the y axis data
    var yStack = d3.layout.stack();
    yStack(yData)


    console.log(xData)

    console.log(yData)



  /*  var groups = plot.append("g").attr("id","groups")
        .selectAll("g")
        .data(yData)
        .enter()
        .append("g")
        .attr("transform",function(d){

            return "translate(0,"+yScale(d[0].y0)+")";
        })

    //place in some basic rects
    groups.append("rect")
        .attr("width",plotWidth)
        .attr("height",function(d){
            return yScale(d[0].y)
        })
        .attr("fill",function(d,i){
            return colours[i];
        })*/









    



        




    

}