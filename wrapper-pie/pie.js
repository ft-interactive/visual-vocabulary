function pieChart(data, stylename, media, chartpadding,legAlign, innerRadious, labels, textOffset){

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
    var colours= d3.scale.ordinal()
      .range(stylename.fillcolours);

    var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius((radius-10)/100*innerRadious);

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
        .enter()
        .append("g")
        .attr("class", media+"fill")
        .attr("id", function(d) { return d.data.category+"-"+d.data.value; });

    g.append("path")
        .attr("class", media+"fill")
        .on("mouseover", pointer)
        .on("click",function(d){
                    console.log("click")
                    var elClass = d3.select(this)
                    if (elClass.attr("class")==media+"fill") {
                        d3.select(this).attr("class",media+"highlight");
                        d3.select(this).style("fill",colours.range()[1])
                    }
                    else{var el=d3.select(this)
                        el.attr("class",media+"fill");
                        d3.select(this).style("fill",colours.range()[0])
                    }
                })
        .attr("d", arc)
        .style("fill", function(d,i){return colours.range()[0]})

    if (labels) {
        g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class", media+"labels")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.category; });
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