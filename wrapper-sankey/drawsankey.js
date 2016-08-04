
function sankeyChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'value'; });
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

    //code adapted from http://bl.ocks.org/d3noob/c9b90689c1438f57d649

    console.log("seriesNames", seriesNames)

    
    // Set the sankey diagram properties
    var sankey = d3.sankey(plotWidth)
        .nodeWidth(yOffset*0.7)
        .nodePadding(yOffset*1.5)
        .size([plotWidth, plotHeight]);

    var path = sankey.link();

    //set up graph in same style as original example but empty
    var plotData = {"nodes" : [], "links" : []};

    //The column heading from the dataset have been concatonated to the name
    //so that you can have nodes that appear to map to the same name, eg
    //Labour to Labour so you can map vote share over time
    data.forEach(function (d) {
      plotData.nodes.push({ "name": d[seriesNames[0]]+seriesNames[0] });
      plotData.nodes.push({ "name": d[seriesNames[1]]+seriesNames[1] });
      plotData.links.push({ "source": d[seriesNames[0]]+seriesNames[0],
                         "target": d[seriesNames[1]]+seriesNames[1],
                         "value": +d.value });
     });

    console.log("data", data)

    // return only the distinct / unique nodes
    plotData.nodes = d3.keys(d3.nest()
        .key(function (d) { return d.name; })
        .map(plotData.nodes));

    console.log("nodes", plotData.nodes)
    
    var cat=[]

    // loop through each link replacing the text with its index from node
    plotData.links.forEach(function (d, i) {
        plotData.links[i].source = plotData.nodes.indexOf(plotData.links[i].source);
        plotData.links[i].target = plotData.nodes.indexOf(plotData.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings and remove serieNames as these are no longer needed
    plotData.nodes.forEach(function (d, i) {
        var check=d.slice(-(seriesNames[0].length));
        if (check==seriesNames[0]){
            cat.push(d.slice(0,-(seriesNames[0].length)))
        }
        if (isEven(i)){
            console.log("even")
            var chrts=seriesNames[0].length
            d = d.slice(0, -chrts);
        }
        else {
            var chrts=seriesNames[1].length
            d = d.slice(0, -chrts);
        }
        plotData.nodes[i] = { "name": d };
    });




    console.log("cat",cat)

    sankey
    .nodes(plotData.nodes)
    .links(plotData.links)
    .layout(32);

    // add in the links
    var link = plot.append("g").selectAll("."+media+"link")
        .data(plotData.links)
    .enter().append("path")
        .attr("id",function(d) {
            return d.source.name + " to " + 
                d.target.name + "\n" + d.value;
            })
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", media+"link")
        .attr("d", path)
        .style("stroke",function(d,i){
            console.log(colours[cat.indexOf(d.source.name)])
            return colours[cat.indexOf(d.source.name)]
        })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    // add in the nodes
    var node = plot.append("g").selectAll("."+media+"node")
        .data(plotData.nodes)
    .enter().append("g")
        .attr("class", media+"node")
        .attr("transform", function(d) { 
          return "translate(" + (d.x)+ "," + (d.y) + ")"; })
    .call(d3.behavior.drag()
        .origin(function(d) {
            return d;})
        .on("dragstart", function() { 
            this.parentNode.appendChild(this); })
        .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")")
      .style("fill", "9D9D9C")

    var numNodes=plotData.nodes.length/2;

    node.append("text")
        .attr("class",media+"subtitle")
        .attr("y",-yOffset/4)
        .attr("x",function (d){
            if(d.x>plotWidth/2) {
                return yOffset*.7
            }
            else {return 0}
        })
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")")
        .style("text-anchor", function (d){
            if(d.x>plotWidth/2) {
                return "end"
            }
            else {return "start"}
        })
        .text(function (d) {return d.name})

        //Add column labels
        plot.append("text")
            .attr("class",media+"subtitle")
            .attr("y",yOffset)
            .attr("x",margin.left)
            .text(seriesNames[0])

        plot.append("text")
            .attr("class",media+"subtitle")
            .attr("y",yOffset)
            .attr("x",plotWidth-margin.right)
            .style("text-anchor", "end")
            .text(seriesNames[1])

    
    // the function for moving the nodes
    function dragmove(d) {
    d3.select(this)
    .attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min((plotHeight) - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
    }


    function isEven(n) {
       return n % 2 == 0;
    }





}