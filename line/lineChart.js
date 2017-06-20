function lineChart() {
    //
    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =10;
    let markers = false;
    let includeAnnotations = (d)=> (d.annotate !="" && d.annotate !=undefined);
    let annotate = false;
    let interpolation =d3.curveLinear
    const colourScale = d3.scaleOrdinal()
        // .range(gChartcolour.lineWeb)
        .domain(seriesNames);
  
    function chart(parent){

        var lineData= d3.line()
            .curve(interpolation)
            .x(function(d,i) { 
                return xScale(d.date); 
            })
            .y(function(d) { 
                return yScale(d.value); 
            })

        parent.append("path")
            .attr("stroke",function (d){return colourScale(d.name)})
            .attr('d', function(d){
                return lineData(d.lineData); })

        if (markers) {
            parent.selectAll(".markers")
            .data(function(d) {
               if(markers) {
                    return d.lineData
                }
            })
            .enter()
            .append('circle')
            .classed("markers",true)
            .attr('id' ,(d)=> 'date: ' + d.date + ' value: ' + d.value)
            .attr("cx",(d)=> xScale(d.date))
            .attr("cy",(d)=> yScale(d.value))
            .attr("r",rem*.25)
            .attr("fill",(d)=>{ return colourScale(d.name)} )
        }
    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        yScale = d;
        return chart;
    }
    chart.yAxisAlign = (d)=>{
        if(!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    }
    chart.yDomain = (d)=>{
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d)=>{
        yScale.range(d);
        return chart;
    };

    chart.seriesNames = (d)=>{
        seriesNames = d;
        return chart;
    }
    chart.xScale = (d)=>{
        if(!d) return xScale;
        xScale = d;
        return chart;
    }
    chart.xDomain = (d)=>{
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d)=>{
        xScale.range(d);
        return chart;
    };
    chart.plotDim = (d)=>{
        if(!d) return plotDim;
        plotDim = d;
        return chart;
    }
    chart.rem = (d)=>{
        if(!d) return rem;
        rem = d;
        return chart;
    }
    chart.annotate = (d)=>{
        annotate = d;
        return chart;
    }
    chart.markers = (d)=>{
        markers = d;
        return chart;
    }
    chart.interpolation = (d)=>{
        if(!d) return interpolation;
        interpolation = d;
        return chart;
    }
    chart.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='webS' || d==='webM' || d==='webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    }

    return chart
}

function drawHighlights() {
    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();

    function highlights(parent){
        parent.append('rect')
            .attr('class',"highlights" )
            .attr("x", (d)=> xScale(d.begin))
            .attr("width", (d)=> xScale(d.end)-xScale(d.begin))
            .attr("y", (d)=> yScale.range()[1])
            .attr("height", (d)=> yScale.range()[0])
            .attr("fill","#fff1e0")
    }

    highlights.yScale = (d)=>{
        yScale = d;
        return highlights;
    }
    highlights.xScale = (d)=>{
        xScale = d;
        return highlights;
    }
    highlights.yRange = (d)=>{
        yScale.range(d);
        return highlights;
    };
    highlights.xRange = (d)=>{
        xScale.range(d);
        return highlights;
    };

    return highlights;
}

function drawAnnotations() {
    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();

    function annotations(parent){
    
        parent.append("line")
            .attr("class","annotation")
            .attr("x1", (d)=> xScale(d.date))
            .attr("x2",(d)=> xScale(d.date))
            .attr("y1",yScale.range()[0])
            .attr("y2",yScale.range()[1]-5)

        parent.append("text")
            .attr("class","annotation")
            .attr("text-anchor","middle")
            .attr("x",function(d){return xScale(d.date)})
            .attr("y",yScale.range()[1]-(rem/2))
            .text(function(d){
                return d.annotate
            })
    }

    annotations.yScale = (d)=>{
        yScale = d;
        return annotations;
    }
    annotations.xScale = (d)=>{
        xScale = d;
        return annotations;
    }
    annotations.yRange = (d)=>{
        yScale.range(d);
        return annotations;
    };
    annotations.xRange = (d)=>{
        xScale.range(d);
        return annotations;
    };
    annotations.rem = (d)=>{
        if(!d) return rem;
        rem = d;
        return annotations;
    }
    return annotations;
}

