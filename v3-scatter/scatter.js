function scatterChart(){

    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let colourScale = d3.scaleOrdinal();

    let includeLabel = (d)=>true;
    let labelTextStart = (d) => 'x Variable';
    let labelTextEnd = (d) => 'y Variable';
    let highlightColour = '#F00';
    let dotRadius = 5;


    function chart(parent){

            colourScale.domain(this.groups)
                .range(gChartcolour.categorical)

           parent.append('circle')
            .attrs({
                'id':d=>d.name,
                'cx':d=>xScale(d.x),
                'cy':d=>yScale(d.y),
                'fill-opacity':0.7,
                'fill':d=>colourScale(d.group),
                'r':dotRadius
            }) 

        const labeled = parent.filter(includeLabel)
            .append('text')
            .attrs({
                'class':'highlighted-label',
                'text-anchor':'middle',
                'x':d=>xScale(d.x),
                'y':d=>yScale(d.y),
                'dy':-8,
                'dx':0,
            })
            .text(function(d){
                return d.name
            });

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

    chart.groups = (x)=>{
        groups = x;
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
    let xTicks;
    /*let startLabel = 'start';
    let endLabel = 'end';*/
    let tickFormatter = d=>d3.format(',')(d);
    let colourInverse = false;
    let tickColour = ()=>{
        if (colourInverse){ 
            return '#FFF'
        }
        return '#000'
    };


    function axes(parent){

        const xContainer = parent.append('g')
            .attr('class','axes')

        const yContainer = parent.append('g')
            .attr('class','axes')

        if(yTicks === undefined){
            yTicks = yScale.ticks();
        }

        yContainer.selectAll('g.tick')
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
                        'x':xScale.range()[0],
                        'dy':5,
                        'dx':-5,
                        'fill':tickColour,
                    })
                    .text(tickFormatter)
            });


            //now to generate x axis

            if(xTicks === undefined){
                xTicks = xScale.ticks();
            }

            xContainer.selectAll('g.tick')
            .data(xTicks)
                .enter()
            .append('g')
                .attrs({
                    'class':'tick',
                    'transform':(d)=>'translate('+xScale(d)+',0)',
                })
            .call(function(tick){
                tick.append('line')
                    .attrs({
                        'x1':0,
                        'y1':0,
                        'x2':0,
                        'y2':yScale.range()[1],
                        'stroke':tickColour
                    })

                tick.append('text')
                    .attrs({
                        'text-anchor':'middle',
                        'x':0,
                        'y':yScale.range()[1],
                        'dy':15,
                        'dx':0,
                        'fill':tickColour,
                    })
                    .text(tickFormatter)
            });

    }

    axes.colourInverse = (x)=>{
        colourInverse = x;
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