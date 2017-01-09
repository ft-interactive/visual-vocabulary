
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
            .domain([xMin, XMax]);

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
                .data(data)
                    .enter()
                .append('g')
                    .attr('transform',(d,i)=>'translate('+margin.left+',' + (i*(plotHeight/data.length)+keyOffset) + ')')
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
                            .attr('x',d=>barScale(Math.min(0,d[valueLabel])))
                            .attr('width',d=> barScale(Math.abs(d[valueLabel])) - barScale(0))
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

            

            let colourScale = d3.scaleOrdinal()
                .domain(colourDomain)
                .range(colourRange);

            allVals.push(colourDomain);

            
            
if(swatch) {
            parent.selectAll('.swatch')
                .data(accumulate( colourDomain, linearScale.domain()[1] ))
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
                    .attr('fill', d=> colourScale(d.start));

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


            
// alert('Your min value is: '+allVals.min+', \nand your max value is: '+allVals.max);
if (typeof xAxisHighlight !== "undefined") {
   
plot.append('line')
                .attr('class',media+'axisHighlight')
                .attr('x1',barScale(xAxisHighlight))
                .attr('x2',barScale(xAxisHighlight))
                .attr('y1',0)
                .attr('y2',plotHeight)
                .attr('transform','translate('+margin.left+','+keyOffset+')')
                

}
   



swatchKey(data.columns,swatchColours,keyWidth,barHeight*.2);



function swatchKey(array,swatchColourRange,keyWidth,keyHeight) {

    let swatchNames = array.filter(function(d){

        return d != valueLabel & d != targetLabel & d != textLabel; 
    });

    let valNames = array.filter(function(d){
    
        return d == valueLabel |
        d== targetLabel;

    });


    swatchNames.reverse();
    swatchColourRange.reverse();

    let swatchWidth = keyWidth/swatchNames.length;

    



    let colourScale = d3.scaleOrdinal()
        .range(swatchColourRange)
        .domain(swatchNames);

    let valColourScale = d3.scaleOrdinal()
        .range([colours[0],'#000'])
        .domain(valNames)




    plot.selectAll('.swatchkey')
    .data(swatchNames)
    .enter()
    .append('g')
    .attr('transform','translate('+(w-margin.right)+','+keyOffset/2+')')
    .call(function(parent){

        parent.append('rect')
        .style('fill',d=> colourScale(d))
        .attr('height',keyHeight)
        .attr('width',swatchWidth)
        .attr('x',(d,i)=>0-((i+1)*swatchWidth))
        .attr('y',0)

        parent.append('text')
        .attr('class',media+'subtitle')
        .attr('x',(d,i)=>0-((i+1)*swatchWidth))
        .attr('y',-5)
        .attr('text-anchor','beginning')
        .text(d=>d)
    });

targetValue(valNames);

function targetValue(array) {

    let target = array.filter(function(d){

            return d == targetLabel;

    });

    let value =  array.filter(function(d){

            return d == valueLabel;

    });

plot.selectAll('.valueKey')
    .data(array)
    .enter()
    .append('g')
    .attr('transform',function(){
        if(media=='social'){
        return "translate("+0+","+keyOffset/2+")"
    } else {

        return "translate("+margin.left+","+keyOffset/2+")"

    }})
    .call(function(parent){

let valueGroup = parent.selectAll('.valueGroup')
    .attr('class','valueKey')
    .data(value)
    .enter()
    .append('g');

    valueGroup
    .append('text')
    .attr('class',media+'subtitle')
    .text(d=>d)
    .attr('dy',keyHeight)
    .attr('dx',swatchWidth*1.1)
    .style('fill',d=>valColourScale(d));

valueGroup
    .append('rect')
    .style('fill',d=>valColourScale(d))
    .attr('height',keyHeight)
    .attr('width',swatchWidth);

let targetGroup = parent.selectAll('targetGroup')
    .attr('class','targetKey')
    .data(target)
    .enter()
    .append('g');
    

  targetGroup
    .append('line')
    .attr('x1', swatchWidth*.66)
    .attr('x2', swatchWidth*.66)
    .attr('y1', keyHeight*-.2)
    .attr('y2',keyHeight*1.2)
    .attr('stroke',d=>valColourScale(d))
    .attr('stroke-width',3);

    targetGroup
    .append('text')
    .attr('class',media+'subtitle')
    .text(d=>d)
    .attr('dy',-keyHeight*.6)
    .style('fill',d=>valColourScale(d))



 });
};


}

}