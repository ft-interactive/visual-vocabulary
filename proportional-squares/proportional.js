
function makeChart(data,stylename,media,plotpadding,legAlign){

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
    var colours = d3.scaleOrdinal()
			.range(stylename.fillcolours)
			.domain(data.map(d=>d.name));

    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered

//	var yScale = d3.scaleLinear()
//	.range([plotHeight,0])
//	.domain([d3.max(data,d=>d.year),d3.min(data,d=>d.year)]);

	
	var sizeMax = d3.max(data,d=>d.value);
	
	var squareScale = d3.scaleSqrt()
	.range([0,Math.min(plotHeight,plotWidth)])
	.domain([0,sizeMax]);
	
	var yScale = d3.scaleSqrt()
	.range([Math.min(plotHeight,plotWidth),0])
	.domain([0,sizeMax]);
	
	var squaresGroup = plot.append('g')
	.attr('transform','translate('+margin.left+','+margin.top+')');
	
	var formatComma = d3.format(',');

	
squaresGroup.append('g')
	.selectAll('rect')
	.data(data)
	.enter()
	.append('rect')
	.attr('class',media+'squares')
	.attr('y',d=>yScale(+d.value))
	.attr('x',0)
	.attr('width',d=>squareScale(+d.value))
	.attr('height',d=>squareScale(+d.value))
	.attr('fill',d=>colours(d.name))


var labels = squaresGroup.selectAll('text')
	.data(data)
	.enter()
	.append('text')
	.attr("class",media+"labels")
	.text(d=>formatComma(d.value) + " " + d.name);

//var textOffset=d3.select('.'+media+'labels').style("font-size");
//   textOffset=Number(textOffset.replace(/[^\d.-]/g, ''));
	
	
	var labelxOffset=d3.select("."+media+"labels").node().getBBox().width,
	labelyOffset=d3.select("."+media+"labels").node().getBBox().height;

	
	labels.attr('x', function(d){
		var boxWidth = squareScale(d.value);
			if (boxWidth < (plotWidth/2)) {
			
			textOffset = boxWidth+margin.left+(yOffset/2);
		} else {
			
			textOffset = boxWidth-(labelxOffset+yOffset/2);
		}
		
		return textOffset;
		
		
	})
		.attr('y',d=>yScale(d.value)+labelyOffset);

    

}