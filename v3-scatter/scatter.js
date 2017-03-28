function scatterChart(){
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.basicLineWeb)
        .domain(['','highlight']);

    let colourProperty = 'group';
    let includeLabel = (d)=>true;
    let labelTextStart = (d) => 'x Variable';
    let labelTextEnd = (d) => 'y Variable';
    let highlightColour = '#F00';
    let dotRadius = 5;
    let lineClasser = (d)=>{
        if(d[colourProperty]){
            return 'highlight-line';
        }
        return 'background-line';
    };


    function chart(parent){

           parent.append('circle')
            .attrs({
                'cx':d=>xScale(d.x),
                'cy':d=>yScale(d.y),
                'r':dotRadius
            }) 

        const labeled = parent.filter(includeLabel)
/*
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
                'class': 'highlighted-circle',
                'cx': xScale(xScale.domain()[1]),
                'cy': d=>yScale(d[xScale.domain()[1]]),
                'r': dotRadius,
                'fill': d=>colourScale(d[colourProperty]),
                'stroke': 'none',
            });

        labeled.append('text')
            .attrs({
                'class': 'highlighted-label',
                'y': d=>yScale(d[xScale.domain()[1]]),
                'x': xScale(xScale.domain()[1]),
                'dy': 5,
                'dx': dotRadius*1.5,
            })
            .text(labelTextEnd);*/

        //parent.append('text')

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

    chart.colourInverse = (x) =>{
        if(x === true){
            colourScale.range( gChartcolour.basicLineSocial );
        }else{
            colourScale.range( gChartcolour.basicLineWeb );
        };
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


function scatterAxes(){

    let xScale = d3.scaleLinear();
    let yScale = d3.scaleLinear();
    let yTicks;
    let startLabel = 'start';
    let endLabel = 'end';
    let tickFormatter = d=>d3.format(',')(d);
    let colourInverse = false;
    let tickColour = ()=>{
        if (colourInverse){ 
            return '#FFF'
        }
        return '#000'
    };


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

        if(yTicks === undefined){
            yTicks = yScale.ticks();
        }

        container.selectAll('g.tick')
            .data(yTicks)
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
                        'stroke':tickColour
                    })

                tick.append('text')
                    .attrs({
                        'text-anchor':'end',
                        'x':xScale.range()[1],
                        'dy':-5,
                        'dx':-10,
                        'fill':tickColour,
                    })
                    .text(tickFormatter)
                    

            });
    }

    axes.startLabel = (x)=>{
        startLabel = x;
        return axes;
    }

    axes.colourInverse = (x)=>{
        colourInverse = x;
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

    axes.yTicks = (x)=>{
        yTicks = x;
        return axes;
    }

    axes.labelFormatter = (x)=>{
        labelFormatter = x;
        return axes;
    }

    return axes;
}