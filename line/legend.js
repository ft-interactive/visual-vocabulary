function drawLegend() {
	let seriesNames=[]
	const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.lineWeb)
        .domain(seriesNames);
    let rem=10

	function legend(parent) {
		console.log(seriesNames);
		console.log(rem)


	}

	legend.seriesNames = (d)=>{
        seriesNames = d;
        return legend;
    }

    legend.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='web') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return legend;
    }

    legend.rem = (d)=>{
        rem = d;
        return legend;
    }


	return legend
}