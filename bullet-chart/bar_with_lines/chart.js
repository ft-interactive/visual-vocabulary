function makeChart(data, stylename, media, plotpadding, legAlign, yAlign) {

    var titleYoffset = d3.select("#" + media + "Title").node().getBBox().height
    var subtitleYoffset = d3.select("#" + media + "Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var colNames = Object.keys(data[0]).filter(function(d) {
        return d != 'cat';
    });

    

    
    //Select the plot space in the frame from which to take measurements
    var frame = d3.select("#" + media + "chart")
    var plot = d3.select("#" + media + "plot")

    var yOffset = d3.select("#" + media + "Subtitle").style("font-size");
    yOffset = Number(yOffset.replace(/[^\d.-]/g, ''));

    //Get the width,height and the marginins unique to this chart
    var w = plot.node().getBBox().width;
    var h = plot.node().getBBox().height;
    var margin = plotpadding.filter(function(d) {
        return (d.name === media);
    });
    margin = margin[0].margin[0]
    var colours = stylename.fillcolours;
    var plotWidth = w - (margin.left + margin.right);
    var plotHeight = h - (margin.top + margin.bottom);


    if(qualitativeShading===false){
        colNames = colNames.slice(0,2);
    };
    

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
        return d == originValue || d == xAxisHighlight;
    }).classed(media + "origin", true);

    var seriesNames = data.map(d => d.cat);


    function getBarColIndex(lineColIndex) {

        if (lineColIndex == 1) {
            
            barColIndex = 0;

        } else if (lineColIndex == 0) {

            barColIndex = 1;

        } else {

            alert('invalid lineColIndex');
        }
        
        return (barColIndex)
    };

var barColIndex = getBarColIndex(lineColIndex);


     function getMeGroups(el) {

        var filteredCols = colNames.filter(d => d != 'low' && d != 'medium' && d != 'high');

        var bands = filteredCols.map(function(name) {

            return {
                name: name,
                cat:el.cat,
                value: +el[name]
            }
        });

        return bands

    };

  var plotData = data.map(function(d) {
        return {
            cat: d.cat,
            groups: getMeGroups(d)
        }
    });

     function getStacks(el) {
        var posCumulative=0;
        var negCumulative=0;
        var baseX=0
        var baseX1=0

        var bands = colNames.filter(d => d == 'low' || d == 'medium' || d == 'high');

         bands=bands.map(function(name,i) {
            if(el[name]>0){
                baseX1=posCumulative
                posCumulative = posCumulative+(+el[name]);
                baseX=posCumulative;
            }
            if(el[name]<0){
                baseX1=negCumulative
                negCumulative = negCumulative+(+el[name]);
                baseX=negCumulative;
                if (i<1){baseY=0;baseX1=negCumulative}
            }
            return {
                name: name,
                x1: +baseX,
                x:+baseX1,
                width:+el[name]
            }
        });

       return bands
    };



var bothExtent = [];


plotData.forEach(function(d){
    
    bothExtent.push(d.groups[barColIndex].value)
    bothExtent.push(d.groups[lineColIndex].value)
    
    });

  bothExtent=(d3.extent(bothExtent,d=>d));

  var bothMin = d3.min(bothExtent,d=>d),
  bothMax= d3.max(bothExtent,d=>d)

     var stackData = data.map(function(d) {
        return {
            cat: d.cat,
            groups: getStacks(d),
            total:d3.sum(getStacks(d), function(d) { return d.width; })
        }
    });

var stackExtent = [];

var numGroups = stackData[0].groups.length -1;

console.log(numGroups)

stackData.forEach(function(d){

    
    stackExtent.push(d.total)
    for(var i = 0; i < d.groups.length; i++){
        stackExtent.push(d.groups[i].x)
        d.groups[0].x = bothMin
        d.groups[numGroups].width = bothMax;
    }
    
    });


stackExtent=d3.extent(stackExtent,d=>d);

console.log(stackData)


var allxRange = bothExtent.concat(stackExtent);

var calculated_xMax = 2 * Math.round(d3.max(allxRange)/2);
var calculated_xMin = d3.min(allxRange.concat(0));



    if (typeof xMax !== 'undefined') {
        xMax = xMax;
    } else {
        xMax = calculated_xMax;
    };


    if (typeof xMin !== 'undefined') {
        xMin = xMin;
    } else {
        xMin = calculated_xMin;
    };





    



    var xScale = d3.scale.linear()
        .range([0, plotWidth])
        .domain([xMin, xMax]);


    var yScale = d3.scale.ordinal()
        .domain(data.map(d => d.cat))
        .rangeBands([0, plotHeight], .3);


    var yScale1 = d3.scale.ordinal()
        .domain(seriesNames)
        .rangeBands([0, yScale.rangeBand()]);

    var xAxis = d3.svg.axis()
        .ticks(numTicksx)
        .tickSize(plotHeight)
        .orient('bottom')
        .scale(xScale);

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(yScale);

    var xLabels = plot.append('g')
        .attr("class", media + "xAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .call(xAxis);

    var yLabel = plot.append("g")
        .attr("class", media + "yAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .call(yAxis);

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
        return d == originValue || d == xAxisHighlight;
    }).classed(media + "origin", true);



if(qualitativeShading) {

 

     var stacks = plot.selectAll("."+media+"stack")
         .data(stackData)
         .enter().append("g")
         .attr("class", media+"stacks")
         .attr("transform",d=> "translate(0," + (yScale(d.cat))+ ")")
         .call(function(parent){
             parent.selectAll('rect')
             .data(d=>d.groups)
             .enter().append('rect')
             .attr("height", yScale.rangeBand())
             .attr("x",d=>xScale(Math.min(d.x, d.x1)))
             .attr("y", d=>yScale(d.cat))
             .attr("width",function(d){ if(d.name=='medium'){
                return xScale(d.width)-xScale(0) 
            } else if (d.name == 'high') {

                return xScale(d.width)+xScale(bothMax)

            } else {
                return xScale(d.width)-xScale(bothMin)
            }
        })
             .style("fill", (d,i)=>colours[i+2])
             .style('opacity',.4)
             .attr("transform",function(){return "translate("+(margin.left)+","+(margin.top)+")"}); 

         }); 

        }; 


    var rectsGroup = plot.selectAll('.'+media+'bars')
        .data(plotData)
        .enter().append("g")
        .attr("class", media+"bars")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .call(parent =>
        parent.selectAll('rect')
        .data(d=>d.groups.filter(d=>d.name==colNames[barColIndex]))
        .enter()
        .append('rect')
        .attr('x', d => xScale(Math.min(0,d.value)))
        .attr('y', d => yScale(d.cat)+yScale.rangeBand()*.2)
        .attr('height', yScale.rangeBand()*.60)
        .attr('width', d => xScale(Math.abs(d.value)) - xScale(0))
        .style('fill', colours[0])
    );


    var linesGroup = plot.selectAll('.'+media+'lines')
    .data(plotData)
    .enter().append('g')
    .attr('class',media+'lines')
    .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
    .call(parent=>
        parent.selectAll('rect')
        .data(d=>d.groups.filter(d=>d.name==colNames[1]))
        .enter().append('rect')
        .attr('x', d => xScale(d.value))
        .attr('y', d => yScale(d.cat) - yScale.rangeBand() * .1)
        .attr('height', yScale.rangeBand()*1.2)
        .attr('width', plotWidth /  (yScale.rangeBand()*2))
        .style('fill', colours[1])
        )





    //Add labels so that the preflight script in illustrator will work
    d3.selectAll(".printxAxis text")
        .attr("id", "xAxisLabel")
    d3.selectAll(".printyAxis text")
        .attr("id", "yAxisLabel")
    d3.selectAll(".printyAxis line")
        .attr("id", "yAxisTick")
    d3.selectAll(".printxAxis line")
        .attr("id", "xAxisTick")
    d3.selectAll(".printminorAxis line")
        .attr("id", "minorTick")

    d3.selectAll(".domain").remove()

    //create a legend first
    var legendyOffset = 0
    var legend = plot.append("g")
        .attr("id", media + "legend")
        .on("mouseover", pointer)
        .selectAll("g")
        .data(colNames)
        .enter()
        .append("g")
        .attr("id", function(d, i) {
            return media + "l" + i
        })

    var drag = d3.behavior.drag().on("drag", moveLegend);
    d3.select("#" + media + "legend").call(drag);

    legend.append("text")

    .attr("id", function(d, i) {
            return media + "t" + i
        })
        .attr("x", yOffset + yOffset / 5)
        .attr("y", 0)
        .attr("class", media + "subtitle")
        .text(function(d) {
            return d;
        })

    legend.append("rect")
        .attr("x", 0)
        .attr("y", -yOffset + yOffset / 3)
        .attr("width", (yOffset / 100) * 85)
        .attr("height", (yOffset / 100) * 70)
        .style("fill", function(d, i) {
            return colours[i]
        })

    legend.attr("transform", function(d, i) {
        if (legAlign == 'hori') {
            var gHeigt = d3.select("#" + media + "l0").node().getBBox().height;
            if (i > 0) {
                var gWidth = d3.select("#" + media + "l" + (i - 1)).node().getBBox().width + 15;
            } else {
                gWidth = 0
            };
            legendyOffset = legendyOffset + gWidth;
            return "translate(" + (legendyOffset) + "," + (gHeigt) + ")";
        } else {
            var gHeight = d3.select("#" + media + "l" + (i)).node().getBBox().height
            return "translate(0," + ((i * yOffset) + yOffset / 2) + ")"
        };
    })

    function colculateTicksize(align, offset) {
        if (align == "right") {
            return w - margin.left - offset
        } else {
            return w - margin.right - offset
        }
    }

    function pointer() {
        this.style.cursor = 'hand'
    }

    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");

    }



}