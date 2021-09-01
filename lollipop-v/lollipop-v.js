// the lollipop v chart factory
function lollipopVChart(){

	let xScale;
	let yScale;
	let dataExtent;
	let dotSize;
	let colour;
	let originValue;

	function drawChart(parent){

		//create lines
		parent.append("line")
			.attr("y1", d =>{ 
				if(isPositive(d.value)) return yScale(d3.max([0, dataExtent[0]]))
				return yScale(d.value)
			 })
			.attr("y2", d => {
				if(isPositive(d.value)) return yScale(d.value)
				return yScale(0) 
			})
			.attr("x1", d => {
				return xScale(d.name) + (xScale.step() / 2);
			} )
			.attr("x2", d => xScale(d.name) + (xScale.step() / 2))
			.attr("stroke", colour)
			.attr("stroke-width", 4);

		//create dots
		parent.append("circle")
			.attr("cy", d => yScale(d.value))
			.attr("cx", d => xScale(d.name) + (xScale.step() / 2))
			.attr("r", dotSize)
			.attr("fill", colour);

		function isPositive(num){
			return num > 0;
		}
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
};

function lollipopVAxes(){
	let xAxis;
	let yAxis;
	let xScale;
	let yScale;
	let yHighlight;
	let originValue = 0;
	let yAlign;
	let chartsize;
	let margins;
	let yLabelOffset;

	function makeAxes(parent){
		const axisX = parent.append("g")
			.attr("class", "axes")
			.attr("id", "x-axis")
			.call(xAxis);	

		const axisY = parent.append("g")
			.attr("class", "axes")
			.attr("id", "y-axis")
			.call(yAxis);

		//position Y axis labels	
		axisY.selectAll('text')
			.attr("transform", () => {

			if(yAlign =="right"){
				console.log(yLabelOffset);
				return `translate(${yLabelOffset},0)` 
			}
			else{
				console.log('margin-left', margins.left)
				console.log('chartwidth', chartsize.width)
				return `translate(${0 - (chartsize.width * 1.05 + yLabelOffset)}, 0)`
			}
		})

		//position X axis labels
		axisX.selectAll('text')
			.attr("transform", (x) => {
				return `translate(0, -25)`
			})

		//identify a yAxis highlight line if there is one
		const origin = parent.selectAll(".tick")
			.filter( (d,i) => d == originValue || d == yHighlight )
			.classed("highlight", true); 	
	}


	makeAxes.setYAxis = (x) => {
		yAxis = x;
		return makeAxes;
	}
	makeAxes.setXAxis = (x) => {
		xAxis = x;
		return makeAxes;
	}
	makeAxes.setXScale = (x) => {
		xScale = x;
		return makeAxes;
	}
	makeAxes.setYScale = (x) => {
		yScale = x;
		return makeAxes;
	}
	makeAxes.setYHighlight = (x) => {
		yHighlight = x;
		return makeAxes;
	}
	makeAxes.setYAlign = (x) => {
		yAlign = x;
		return makeAxes;
	}
	makeAxes.setChartSize = (x) => {
		chartsize = x;
		return makeAxes;
	}
	makeAxes.setMargins = (x) => {
		margins = x;
		return makeAxes;
	}
	makeAxes.setYLabelOffset = (x) => {
		yLabelOffset = x;
		return makeAxes;
	}
	
	return makeAxes;
}



