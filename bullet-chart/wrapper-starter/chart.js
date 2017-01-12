
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    // var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    let w=plot.node().getBBox().width;
    let h=plot.node().getBBox().height;
    let margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    const colours=stylename.fillcolours;
    let plotWidth = w-(margin.left+margin.right);
    let plotHeight = h-(margin.top+margin.bottom+keyHeight);
    

    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

         
        
    const barHeight = (plotHeight/data.length)*.8;


    let scaleFactor = .3;


    let keyWidth = 0;

    console.log(media)

    if(media!='social') {
         keyWidth = (plotWidth/data.length)*2;
    } else {
        keyWidth = (plotWidth/data.length)*2.75
    };

        


        let keyOffset = keyHeight*2 +margin.top

        
        let allVals = [];

        // let swatchKey = {};

        let barScale = d3.scaleLinear()
            .range([0, plotWidth])
            .domain([xMin, xMax]);

       let xAxisLabels = plot.append('g')
                .attr('class',media+'xAxis')
                .attr('transform','translate('+margin.left+','+(plotHeight+keyOffset)+')')
                .call(d3.axisBottom(barScale)
                    .ticks(numTicksX)
                    .tickSize(-plotHeight));

       let swatchColours = colours.slice(0).splice(2,3);   

       

            

        let colourAxis = colourAxisLayout()
            .barHeight(barHeight)
            .domainLabels(scaleBands)
            .colourRange(swatchColours)
            .linearScale(barScale);

        
            plot.append('g')
                .attr('width', plotWidth)
                .attr('height', plotHeight)
            .selectAll('.bar')
                // .data(data.filter(function(d){
                //     return d.region != 'key'
                // }))
                    .data(data)
                    .enter()
                .append('g')
                    .attr('transform',(d,i)=>'translate('+margin.left+',' + (i*(plotHeight/data.length)+keyOffset) + ')')
                    .attr('class','bar')
                    .each(drawBars);


function drawBars(datum){
                        let parent = d3.select(this);
                        parent.call(colourAxis);
                        
                        parent.append('text')
                            .text(d=> {if(d[textLabel]!='key')
                                {return d[textLabel]}
                            })
                            .attr('y', (barHeight *.625))
                            .attr('text-anchor','end')
                            .attr('class',media+'subtitle')
                            .attr('dx',-5)

                        parent.append('rect')
                            .attr('x',d=>barScale(Math.min(0,d[valueLabel])))
                            .attr('class','bar')
                            .attr('width',d=> barScale(Math.abs(d[valueLabel])) - barScale(0))
                            .attr('height', barHeight/2)
                            .attr('y', barHeight/4)
                            .attr('fill',colours[0])
                            .attr('transform',d=> { if (d.region== 'key'){
                                return 'scale('+scaleFactor+') translate('+margin.left*(1/scaleFactor)+','+0+')';}})


                        parent.append('line')
                            .attr('x1', d => barScale(d[targetLabel]))
                            .attr('x2', d => barScale(d[targetLabel]))
                            .attr('y1', barHeight*.1)
                            .attr('y2', barHeight*.9)
                            .attr('stroke','#000')
                            .attr('stroke-width',5)
                            .attr('transform',d=> { if (d.region== 'key'){
                                return 'scale('+scaleFactor+') translate('+margin.left*(1/scaleFactor)+','+0+')';}})

                    parent.append('text')
                    .attr('class',media+'legend')
                    .attr('x',d=> barScale(Math.min(0,d[valueLabel])))
                    .style('fill',colours[0])
                    .text(d=> { if (d.region=='key') { return valueLabel}})
                    .attr('text-anchor','end')
                    .attr('transform',d=> { if (d.region== 'key'){
                                return 'translate('+(margin.left*.98)+','+(barHeight*scaleFactor*.9)+')';}});

                    parent.append('text')
                    .attr('class',media+'legend')
                    .attr('x',d=> barScale(Math.min(0-scaleFactor/2,(d[valueLabel]))))
                    .style('fill','#000')
                    .text(d=> { if (d.region=='key') { return targetLabel}})
                    .attr('text-anchor','beginning')
                    .attr('transform',d=> { if (d.region== 'key'){
                                return 'translate('+barScale(d[targetLabel])+','+(barHeight*scaleFactor+barHeight/3.2)+')';}});

                }


    console.log(keyData.region)


    plot.selectAll('key')
    .data([keyData])
    .enter()
    .each(drawBars)
    .selectAll('.bar')


 

    function colourAxisLayout(){
        let domainLabels = [];
        let colourRange = [];
        let linearScale = d3.scaleLinear();
        let barHeight = 10;
        

        

        function axisLayout(parent){
            
            let data = parent.datum();

            let region = data.region;


            
            let colourDomain = domainLabels.map(function(d){
                return Number(data[d]);
            });

            

            let colourScale = d3.scaleOrdinal()
                .domain(colourDomain)
                .range(colourRange);

            allVals.push(colourDomain);

            
            
if(swatch) {




            parent.selectAll('.swatch')
            .attr('class',d=>media+d.region)
                .data(d=>accumulate( colourDomain, linearScale.domain()[1],d.region))
                .enter()
                    .append('rect')
                    .attr('class',media+'swatch')
                    .attr('width', function(d){
                        if(xMin <= 0)
                            {
                                return linearScale((d.end+xMin) - d.start)
                            } else {
                                return linearScale(d.end - d.start)
                            }
                    })
                    .attr('height', barHeight)
                    .attr('x', d => linearScale(d.start))
                    .attr('fill', d=> colourScale(d.start))
                    .attr('transform',d=> { if (d.name== 'key'){
                                return 'scale('+scaleFactor+') translate('+margin.left*(1/scaleFactor)+','+0+')';}});

                    
                    parent.selectAll('swatchlabel')
                    .data(d=>accumulate( colourDomain, linearScale.domain()[1],d.region))
                    .enter()
                    .filter(function(d){
                        return d.name == 'key'
                    })
                    .append('text')
                    .attr('class',media+'legend')
                    .attr('x', d => linearScale(d.start)*scaleFactor)
                    .attr('text-anchor',(d,i)=> {if(media=='social'){return['end','middle','beginning'][i]}})
                    .text((d,i)=>scaleBands[i])
                    .attr('transform',d=> { if (d.name== 'key'){
                                return 'translate('+margin.left+','+(barHeight*-.075)+')';}});

                }      
        
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

    };

    function accumulate(a, endValue, name){
        return a.reduce(function(accumulator, value, index, array){ 
            let start = value;
            let end = endValue;
            let id = name;

            console.log(name)
            
            if(index < array.length - 1 ){
                end = array[index+1];   
            }
            accumulator.push({ start:start, end:end, name:id});
            return accumulator;
        }, []);
    }

    allVals = [].concat.apply([],allVals);

            allVals = {

                    min:d3.min(allVals),
                    max:d3.max(allVals)
                };


            
// alert('Your min value is: '+allVals.min+', \nand your max value is: '+allVals.max);
if (typeof xAxisHighlight !== "undefined") {
   
plot.append('line')
                .attr('class',media+'axisHighlight')
                .attr('x1',barScale(xAxisHighlight))
                .attr('x2',barScale(xAxisHighlight))
                .attr('y1',0)
                .attr('y2',plotHeight)
                .attr('transform','translate('+margin.left+','+keyOffset+')')
                

};









   



}