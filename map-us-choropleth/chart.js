
function makeChart(data,usaData,stylename,media,plotpadding,legAlign,yAlign,legendTitles,colorScale,legendColors){

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

    var colorScale = d3.scale.linear()
        .range(["#ddd", "#A5526A", "#F19F9E", "#238fce"])
        .domain([0,1,2,3])

    //make the same as the range above (but without the grey!)
    var legendColors = ["#A5526A", "#F19F9E", "#238fce"]

    var projection = d3.geo.albersUsa()
        .translate([plotWidth/2, plotHeight/2])  
        .scale([600]);

    var path = d3.geo.path()          
        .projection(projection);

    var rateById = {};

    //SHOULD CHANGE WHAT THE RATE BY ID IS
    data.forEach (function(d){
        rateById[d.id] = d.Both
    })

    var map = plot.append("svg")
        .attr("width", plotWidth)
        .attr("height", plotHeight);

    var boundaries = topojson.feature(usaData, usaData.objects.states).features;

    console.log(boundaries)

     // Render the map by using the path generator
    map.selectAll("path")
        .data(boundaries)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            return colorScale(rateById[d.id]);
        })

    //NOTE TO FUTURE SELF: WAS TRYING TO GET LEGEND TO WORK
    //LAST THING I DID WAS SIMPLY TO COPY-PASTE THIS BELOW
    //WAS LOOKING INTO THE SERIESNAMES
     //create a legend first
    var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(legendTitles)
            .enter()
            .append("g")
            .attr ("id",function(d,i){
                return media+"l"+i
            })

        var drag = d3.behavior.drag().on("drag", moveLegend);
        d3.select("#"+media+"legend").call(drag);
            
        legend.append("text")

            .attr("id",function(d,i){
                return media+"t"+i
            })
            .attr("x",yOffset+yOffset/5)
            .attr("y",0)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })

        legend.append("rect")
            .attr("x",0)
            .attr("y",-yOffset+yOffset/3)
            .attr("width",(yOffset/100)*85)
            .attr("height",(yOffset/100)*70)
            .style("fill", function(d,i){return legendColors[i]})

        legend.attr("transform",function(d,i){
            if (legAlign=='hori') {
                var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
                if (i>0) {
                    var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
                }
                else {gWidth=0};
                legendyOffset=legendyOffset+gWidth;
                return "translate("+(legendyOffset)+","+(gHeigt)+")";  
            }
            else {
                var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
                return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
        })

    function colculateTicksize(align, offset) {
        if (align=="right") {
            return w-margin.left-offset
        }
        else {return w-margin.right-offset}
    }
    
    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }

 }