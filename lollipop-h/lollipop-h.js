//the lollipop h chart factory 
function lollipopHChart(){
	let xScale;
	let yScale;
	let dataExtent;
	let dotSize;
	let colour;

	function drawChart(parent){
		//create lines 
		parent.append("line")
			.attr("x1", d => {
				return d.value>0 ? xScale(d3.max([0, dataExtent[0]] )) : xScale(d.value);
			})
			.attr("x2", d => {
				return d.value>0 ? xScale(d.value) : xScale(0);
			})
			.attr("y1", d => yScale(d.name))
			.attr("y2", d => yScale(d.name))
			.attr("stroke", colour)
			.attr("stroke-width", 4);

		//create dots
		parent.append("circle")
			.attr("cx", d => {
				return xScale(d.value)
			})
			.attr("cy", d => yScale(d.name))
			.attr("r", dotSize)
			.attr("fill", colour);

	}
	drawChart.setXScale = (x) =>{
		xScale = x;
		return drawChart;
	}
	drawChart.setYScale = (x) => {
		yScale = x;
		return drawChart;
	}
	drawChart.setDataExtent = (x) => {
		dataExtent = x;
		return drawChart;
	}
	drawChart.setDotSize = (x) => {
		dotSize = x;
		return drawChart;
	}
	drawChart.setColour = (x) => {
		colour = x;
		return drawChart;
	}
	return drawChart;
}

function lollipopHAxes(){
	let xAxis;
	let yAxis;
	let yLabelPosition;

	function drawAxes(parent){

		//add X Axis
		parent.append("g")
			.attr("class", "axes")
			.attr("id", "x-axis")
			.call(xAxis);

		//add Y Axis	
		parent.append("g")
			.attr("class", "axes")
			.attr("id", "y-axis")
			.call(yAxis);

		//remove horizontal bar of X Axis 
		parent.selectAll(".domain").remove()

		//position Y Axis labels 
		parent.select('#y-axis')
			.selectAll("text")
	        .attr("x", yLabelPosition.x )
	        .attr("y", yLabelPosition.y )
	}

	drawAxes.setYAxis = (x) => {
		yAxis = x;
		return drawAxes;
	}
	drawAxes.setXAxis = (x) => {
		xAxis = x;
		return drawAxes;
	}
	drawAxes.setYLabelPosition = (x) => {
		yLabelPosition = x;
		return drawAxes;
	}

	return drawAxes;
}

