//the slopechart factory
function slopeChart(){
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleOrdinal();
    const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.basicLineWeb)
        .domain(['','highlight']);

    let colourProperty = 'group';
    let includeLabel = (d)=>true;
    let labelTextStart = (d) => 'start text';
    let labelTextEnd = (d) => 'end text';
    let highlightColour = '#F00';
    let dotRadius = 5;
    let lineClasser = (d)=>{
    	if(d[colourProperty]){
    		return 'highlight-line';
    	}
    	return 'background-line';
    };

    function chart(parent){

        parent.append('line')
            .attrs({
                'x1':xScale(xScale.domain()[0]),
                'x2':xScale(xScale.domain()[1]),
                'y1':d=>yScale(d[xScale.domain()[0]]),
                'y2':d=>yScale(d[xScale.domain()[1]]),
                'stroke':d=>colourScale(d[colourProperty]),
                'class':lineClasser
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

    chart.colourPaletteWeb = (x) =>{
        if(x===true){
            colourScale.range(gChartcolour.basicLineSocial);
        }
        return chart;
    }

    chart.colourPalette = (x) =>{
        console.log(x)
    	if(x==='social' || x==='video'){
            colourScale.range(gChartcolour.basicLineSocial);
        } else if (x==='web') {
    		colourScale.range(gChartcolour.basicLineWeb);
        } else if (x==='print') {
            colourScale.range(gChartcolour.basicLinePrint);
        }

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
    let yTicks;
    let yTickHighlight = 100;
    let startLabel = 'start';
    let endLabel = 'end';
    let tickFormatter = d=>d3.format(',')(d);
    let colourInverse = false;
    let tickOffset = 5;
    let labelOffset = 5;
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
                'text-anchor': 'start',
                'dx':-5,
                'dy':labelOffset,
                'class': 'xaxis-label',
                'fill':tickColour
            });

        container.append('text')
            .text(endLabel)
            .attrs({
                'x':xScale.range()[1],
                'text-anchor': 'end',
                'dx':5,
                'dy':labelOffset,
                'class': 'xaxis-label',
                'fill':tickColour
            });

        if(yTicks === undefined){
        	yTicks = yScale.ticks();
        }

        container.selectAll('g.tick')
            .data(yTicks)
                .enter()
            .append('g')
                .attrs({
                    'class':'y-axis tick',
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
                        'dy':tickOffset,
                        'dx':0,
                        'fill':tickColour,
                    })
                    .text(tickFormatter)


            });

        let numticks = container.selectAll('.y-axis.tick').size();
        let base = container.selectAll('.y-axis.tick').filter(function(d, i) {
           if (i === numticks - 1 || d === yTickHighlight ) {
            return d;
           }
           return d === 0
        })
        console.log(base)
        base.classed("base",true);

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

    axes.labelOffset = (x)=>{
        labelOffset = x;
        return axes;
    }

    axes.tickOffset = (x)=>{
        tickOffset = x;
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

    axes.yTickHighlight = (x)=>{
    	yTickHighlight = x;
    	return axes;
    }

    axes.labelFormatter = (x)=>{
    	labelFormatter = x;
    	return axes;
    }

    return axes;
}
