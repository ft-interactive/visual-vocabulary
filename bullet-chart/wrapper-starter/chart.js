
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

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
    var colours=stylename.fillcolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

        const valueLabel = 'value %';
        const targetLabel = 'target %';
        const textLabel = 'region';   
        
        const barHeight = (plotHeight/data.length)*.8;
        
        let allVals = [];

        let barScale = d3.scaleLinear()
            .range([0, plotWidth])
            .domain([0, 20]);
            

        let colourAxis = colourAxisLayout()
            .barHeight(barHeight)
            .domainLabels(['low','medium','high'])
            .colourRange(colours.splice(2,5))
            .linearScale(barScale);

        
            plot.append('svg')
                .attr('width', plotWidth)
                .attr('height', plotHeight)
            .selectAll('.bar')
                .data(data)
                    .enter()
                .append('g')
                    .attr('transform',(d,i)=>'translate('+margin.left+',' + (i*(plotHeight/data.length)) + ')')
                    .attr('class','bar')
                    .each(function(datum){
                        let parent = d3.select(this);
                        parent.call(colourAxis);
                        
                        parent.append('text')
                            .text(d=>d[textLabel])
                            .attr('y', (barHeight *.625))
                            .attr('text-anchor','end')
                            .attr('class',media+'subtitle')
                            .attr('dx',-5)

                        parent.append('rect')
                            .attr('width',d => barScale(d[valueLabel]))
                            .attr('height', barHeight/2)
                            .attr('y', barHeight/4)
                            .attr('fill',colours[0]);

                        parent.append('line')
                            .attr('x1', d => barScale(d[targetLabel]))
                            .attr('x2', d => barScale(d[targetLabel]))
                            .attr('y1', barHeight*.1)
                            .attr('y2', barHeight*.9)
                            .attr('stroke','#000')
                            .attr('stroke-width',5);
                    });
 

    function colourAxisLayout(){
        let domainLabels = [];
        let colourRange = [];
        let linearScale = d3.scaleLinear();
        let barHeight = 10;


        function axisLayout(parent){
            
            let data = parent.datum();

            
            let colourDomain = domainLabels.map(function(d){
                return Number(data[d]);
            });

            console.log(colourDomain)

            let colourScale = d3.scaleOrdinal()
                .domain(colourDomain)
                .range(colourRange);

            allVals.push(colourDomain);
            

            parent.selectAll('.swatch')
                .data(accumulate( colourDomain, linearScale.domain()[1] ))
                .enter()
                    .append('rect')
                    .attr('width', d => linearScale(d.end - d.start))
                    .attr('height', barHeight)
                    .attr('x', d => linearScale(d.start))
                    .attr('fill', d=> colourScale(d.start));
        
        }

        axisLayout.domainLabels = function(a){
            if(!a) return domainLabels;
            domainLabels = a;
            return axisLayout;
        }

        axisLayout.colourRange = function(a){
            if(!a) return colourRange;
            colourRange = a;
            return axisLayout;
        }

        axisLayout.linearScale = function(scale){
            if(!scale) return linearScale;
            linearScale = scale;
            return axisLayout;
        }

        axisLayout.barHeight = function(x){
            if(!x) return barHeight;
            barHeight = x;
            return axisLayout;
        }

        return axisLayout;

    

    }

    function accumulate(a, endValue){
        return a.reduce(function(accumulator, value, index, array){ 
            let start = value;
            let end = endValue;
            
            if(index < array.length - 1 ){
                end = array[index+1];   
            }
            accumulator.push({ start:start, end:end });
            return accumulator;
        }, []);
    }

    allVals = [].concat.apply([],allVals);

            allVals = {

                    min:d3.min(allVals),
                    max:d3.max(allVals)
                };

            
 alert('Your min value is: '+allVals.min+', \nand your max value is: '+allVals.max);

plot.append('g')
.attr('class',media+'xAxis')
.attr('transform','translate('+margin.left+','+plotHeight+')')
.call(d3.axisBottom(barScale)
    .ticks(numTicksX))




    

}