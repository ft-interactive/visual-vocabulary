
function xyHeatmap(data,stylename,media,plotpadding,legAlign,yAlign){

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

    //roll up the data by category
    var catData = d3.nest()
        .key(function(d){return d.category;})
        .entries(data);

    console.log(catData);

    var cellHeight=plotHeight/catData.length
    var cats=plot.append("g")
        .attr("id","catagories")
    var labels = cats.selectAll("g")
        .data(catData)
        .enter()
        .append("g")
        .attr("id",function(d){
            return d.key;  
        })
        .attr("transform",function(d,i){
            return "translate("+margin.left+","+(margin.top+(cellHeight*i))+")";
        });
    
    labels.append("text")
    .attr("class",media+"subtitle")
    .text(function(d){return d.key})
    var cellWidth=(plotWidth-(d3.select("#catagories").node().getBBox().width))/catData[0].values.length

    

}