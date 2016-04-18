function pieChart(data, stylename, media, chartpadding,legend, innerRadious, outerRadious, graphLabels){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    radius = Math.min(w, h)/2;
    var margin=chartpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.fillcolours;

    var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius-40)
        .innerRadius(radius-40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = plot.append("svg")
        .attr("width", w)
        .attr("height", h)
         .append("g")
        .attr("transform", "translate(" + (w / 2) + "," + (h / 2)+")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d,i){
                return colours[i];  
            })





    // //create a legend first
    // var legendyOffset=0
    // var legend = plot.append("g")
    //     .attr("id",media+"legend")
    //     .on("mouseover",pointer)
    //     .selectAll("g")
    //     .data(seriesNames)
    //     .enter()
    //     .append("g")
    //     .attr ("id",function(d,i){
    //         return media+"l"+i
    //     })

    // var drag = d3.behavior.drag().on("drag", moveLegend);
    // d3.select("#"+media+"legend").call(drag);
        
    // legend.append("text")

    //     .attr("id",function(d,i){
    //         return media+"t"+i
    //     })
    //     .attr("x",25)
    //     .attr("y",0)
    //     .attr("class",media+"subtitle")
    //     .text(function(d){
    //         return d;
    //     })
    // legend.append("line")
    //     .attr("stroke",function(d,i){
    //         return colours[i];  
    //     })
    //     .attr("x1",0)
    //     .attr("x2",20)
    //     .attr("y1",-(textOffset/2)+(textOffset/3))
    //     .attr("y2",-(textOffset/2)+(textOffset/3))
    //     .attr("class",media+"lines")

    // legend.attr("transform",function(d,i){
    //     if (legAlign=='hori') {
    //         var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
    //         if (i>0) {
    //             var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
    //         }
    //         else {gWidth=0};
    //         legendyOffset=legendyOffset+gWidth;
    //         return "translate("+(legendyOffset)+","+(gHeigt)+")";  
    //     }
    //     else {
    //         var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
    //         return "translate(0,"+((i*textOffset)+textOffset/2)+")"};
    // })

    // function pointer() {
    //     this.style.cursor='pointer'
    // }

    // function moveLegend() {
    //     var dX = d3.event.x; // subtract cx
    //     var dY = d3.event.y; // subtract cy
    //     d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    // }





}