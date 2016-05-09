function bubbleChart(data, stylename, media, plotpadding,legAlign, smallCircle, largeCircle, textOffset, yHighlight,xLabel,yLabel){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

   //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var plotWidth=w-margin.left-margin.right;
    var plotHeight=h-margin.top-margin.bottom;
    var colours=stylename.fillcolours;


    //parse the data
    data.forEach(function(d){
        d.x = +d.x;
        d.y = +d.y;
        d.size = +d.size;
    })

    //work out extents and default scale
    var xExtent = d3.extent(data,function(d){
        return d.x;
    })
    var yExtent = d3.extent(data,function(d){
        return d.y;
    })
    var sizeExtent = d3.extent(data,function(d){
        return d.size;
    })

    //comment these lines out to accept d3 default values
    //xExtent=[0,90000];//set just one custom scale value - e.g. start the x axis at zero
    //xExtent[1]=90000;
    //yExtent=[0,70];//set both values like this

    //determine categories
    var cats = d3.nest()
        .key(function(d){return d.cat})
        .entries(data)
        .map(function(d){return d.key});

    //scales
    var xScale=d3.scale.linear()
        .domain(xExtent)
        .range([margin.left,w-(margin.right)]);
    var yScale=d3.scale.linear()
        .domain(yExtent)
        .range([h-margin.bottom,margin.top])

    //analyse stage space to determine appropriate sizes for circles
    var minDimension = Math.min(h,w)
    var minCircleRadius = minDimension/smallCircle;
    var maxCircleRadius = minDimension/largeCircle;
    var circleScale = d3.scale.sqrt()
        .domain(sizeExtent)
        .range([minCircleRadius,maxCircleRadius]);

    //x axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickSize(yOffset/2)
        .ticks(5);
    plot.append("g")
        .attr("transform","translate(0,"+(h-margin.bottom)+")")
        .attr("class",media+"xAxis")
        .call(xAxis)

    //calculate ticksize
    var tickSize;
    if (media=="soc"){
        tickSize=10;
    }   else    {
        tickSize=-(w-(margin.right+margin.left)+10);
    }

    //y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickSize(tickSize)
        .ticks(6);
    plot.append("g")
    .attr("transform","translate("+margin.left+",0)")
        .attr("class",media+"yAxis")
        .call(yAxis)

    //identify 0 line if there is one
    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==yHighlight;
        }).classed(media+"origin",true);

    plot.append("text")
            .attr("class",media+"subtitle")
            .attr("text-anchor", "end")
            .attr("x", plotWidth)
            .attr("y", plotHeight)
            .text(xLabel);

    //now create the actual data dots
    var dots = plot.append("g")
        .attr("id",media+"bubbles")

    dots.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("id",function(d){
            return d.name;
        })
        .attr("class",function(d,i){
            if(d.label=="yes"){
                return media+"circlehighlight"
            }
            else {return media+"circle"}
        })
        .attr("cx",function(d){
            return xScale(d.x);
        })
        .attr("cy",function(d){
            return yScale(d.y);
        })
        .attr("r",function(d,i){
            return circleScale(d.size)
        })
        .style("fill", function(d,i){return colours[cats.indexOf(d.cat)]})
        .on("mouseover",pointer)
        .on("click",function(d){
            var elClass = d3.select(this)
            if (elClass.attr("class")==media+"circle") {
                elClass.moveToFront()
                d3.select(this).attr("class",media+"circlehighlight")
                dots.append("text")
                    .datum(d)
                    .attr('id',function(d){
                        return (media+d.name).replace(/\s/g, '');
                    })
                    .attr("x",function(d){
                    return xScale(d.x);
                    })
                    .attr("y",function(d){
                    return yScale(d.y)-circleScale(d.size)-3;
                    })
                    .text(function(d){
                        return d.name+' '+d.size
                    })
                    .attr("class",media+"label")
                    .on("mouseover",pointer)
            var drag = d3.behavior.drag().on("drag", moveLabel);
            d3.selectAll("."+media+"label").call(drag);
            }
            else{var el=d3.select(this)
                el.attr("class",media+"circle")
                var textEl=d3.select(("#"+media+d.name).replace(/\s/g, ''))
                textEl.remove()
            }
        })

        //create text labels for those that need it
        dots.selectAll("text")
            .data(function(){
                return data.filter(function(e){
                    return e.label=="yes"
                })
            })
            .enter()
            .append("text")
            .on("mouseover",pointer)
            .attr("x",function(d){
                return xScale(d.x);
            })
            .attr("y",function(d){
                return yScale(d.y)-circleScale(d.size)-3;
            })
            .attr("class",media+"label")
            .attr('id',function(d){
                return (media+d.name).replace(/\s/g, '');
            })
            .text(function(d){
                return d.name+' '+d.size
            })


    var drag = d3.behavior.drag().on("drag", moveLabel);
    d3.selectAll("."+media+"label").call(drag);

    //create a legend first
    if (cats[0]!="") {
        var legendyOffset=0
        var legend = plot.append("g")
            .attr("id",media+"legend")
            .on("mouseover",pointer)
            .selectAll("g")
            .data(cats)
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
            .attr("x",yOffset/2-yOffset/5+5)
            .attr("y",yOffset/5)
            .attr("class",media+"subtitle")
            .text(function(d){
                return d;
            })

        legend.append("circle")
            .attr("cx",0)
            .attr("cy",0)
            .attr("r",yOffset/2-yOffset/5)
            .style("fill", function(d,i){return colours[i]})

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
                return "translate(0,"+((i*yOffset+margin.top)+yOffset/2)+")"};
        })

    }

    d3.selection.prototype.moveToFront = function() { 
                return this.each(function() { 
                this.parentNode.appendChild(this); 
                }); 
    };

    function pointer() {
        this.style.cursor='pointer'
    }

    function moveLabel() {
        var dX = d3.event.x-(w/3);// subtract cx
        var dY = d3.event.y-(h/2);// subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }

    function moveLegend() {
        var dX = d3.event.x-(w/3);// subtract cx
        var dY = d3.event.y-(h/2);// subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }




}