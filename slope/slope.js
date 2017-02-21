//the slopechart factory
function slopeChart(){
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleOrdinal();
    const colourScale = d3.scaleOrdinal()
        .range(['#00000020', gChartcolour.basic[1]])
        .domain(['','highlight']);

    let colourProperty = 'group';
    let includeLabel = (d)=>true;
    let labelTextStart = (d) => 'start text';
    let labelTextEnd = (d) => 'end text';
    let highlightColour = '#F00';
    let dotRadius = 5;

    function chart(parent){

        parent.append('line')
            .attrs({
                'x1':xScale(xScale.domain()[0]),
                'x2':xScale(xScale.domain()[1]),
                'y1':d=>yScale(d[xScale.domain()[0]]),
                'y2':d=>yScale(d[xScale.domain()[1]]),
                'stroke':d=>colourScale(d[colourProperty]),
            });

        const labeled = parent.filter(includeLabel)

//start circle...
        labeled.append('circle')
            .attrs({
                'cx':xScale(xScale.domain()[0]),
                'cy':d=>yScale(d[xScale.domain()[0]]),
                'r':dotRadius,
                'fill':d=>colourScale(d[colourProperty]),
                'stroke':'none',
            });

        labeled.append('text')
            .attrs({
                'class':'highlighted-label',
                'text-anchor':'end',
                'y':d=>yScale(d[xScale.domain()[0]]),
                'dy':5,
                'dx':-dotRadius*1.5,
            })
            .text(labelTextStart);

//end circle...
        labeled.append('circle')
            .attrs({
                'class':'highlighted-circle',
                'cx':xScale(xScale.domain()[1]),
                'cy':d=>yScale(d[xScale.domain()[1]]),
                'r':dotRadius,
                'fill':d=>colourScale(d[colourProperty]),
                'stroke':'none',
            });

        labeled.append('text')
            .attrs({
                'class':'highlighted-label',
                'y':d=>yScale(d[xScale.domain()[1]]),
                'x':xScale(xScale.domain()[1]),
                'dy':5,
                'dx':dotRadius*1.5,
            })
            .text(labelTextEnd);

        parent.append('text')

    }

    chart.labelTextStart = (f)=>{
        labelTextStart = f;
        return chart;
    };

    chart.labelTextEnd = (f)=>{
        labelTextEnd = f;
        return chart;
    };

    chart.includeLabel = (f)=>{
        includeLabel = f;
        return chart;
    };

    chart.xDomain = (x)=>{
        xScale.domain(x);
        return chart;
    };

    chart.yDomain = (x)=>{
        yScale.domain(x);
        return chart;
    };

    chart.xRange = (x)=>{
        xScale.range(x);
        return chart;
    };

    chart.yRange = (x)=>{
        yScale.range(x);
        return chart;
    };

    chart.dotRadius = (x)=>{
        dotRadius = x;
        return chart;
    }

    chart.colourRange = (x)=>{
        colourScale.range(x);
        return chart;
    }

    chart.colourDomain = (x)=>{
        colourScale.domain(x);
        return chart;
    }

    chart.colourProperty = (x)=>{
        colourProperty = x;
        return chart;
    }

    chart.xScale = (x)=>{
        if(!x) return xScale;
        xScale = x;
        return chart;
    }

    chart.yScale = (x)=>{
        if(!x) return yScale;
        yScale = x;
        return chart;
    }

    return chart;
}


function slopeAxes(){

    let xScale = d3.scaleOrdinal();
    let yScale = d3.scaleLinear();
    let startLabel = 'start';
    let endLabel = 'end';
    let tickFormatter = d=>d3.format(',')(d);


    function axes(parent){

        const container = parent.append('g')
            .attr('class','axes')

        container.append('text')
            .text(startLabel)
            .attrs({
                'text-anchor': 'end',
                'dx':-5,
                'dy':-10,
                'class': 'xaxis-label',
            });

        container.append('text')
            .text(endLabel)
            .attrs({
                'x':xScale.range()[1],
                'dx':5,
                'dy':-10,
                'class': 'xaxis-label',
            });

        container.selectAll('g.tick')
            .data(yScale.ticks())
                .enter()
            .append('g')
                .attrs({
                    'class':'tick',
                    'transform':(d)=>'translate(0,'+yScale(d)+')',
                })
            .call(function(tick){
                tick.append('line')
                    .attrs({
                        'x1':0,
                        'y1':0,
                        'x2':xScale.range()[1],
                        'y2':0,
                        'stroke':'#000'
                    })

                tick.append('text')
                    .attrs({
                        'text-anchor':'end',
                        'x':xScale.range()[1],
                        'dy':-5,
                        'dx':-10,
                    })
                    .text(tickFormatter)
                    

            });
    }

    axes.startLabel = (x)=>{
        startLabel = x;
        return axes;
    }

    axes.endLabel = (x)=>{
        endLabel = x;
        return axes;
    }

    axes.xScale = (x)=>{
        xScale = x;
        return axes;
    }

    axes.yScale = (x)=>{
        yScale = x;
        return axes;
    }


    return axes;
}
