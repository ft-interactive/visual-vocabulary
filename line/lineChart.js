function lineChart() {
	let seriesNames = [];
	let yAxisAlign = 'right';
	let yMax=100
	let yMin=0

    function chartDrawer(parent){
        parent.append('text')
            .text('CHART');


	}

	chartDrawer.yMax = (d)=>{
    	yMax = d;
    	return chartDrawer;
    }

    chartDrawer.yMin = (d)=>{
    	yMin = d;
    	return chartDrawer;
    }

    chartDrawer.seriesNames = (d)=>{
    	seriesNames = d;
    	return chartDrawer;
    }

    chartDrawer.yAxisAlign = (d)=>{
    	yAxisAlign = d;
    	return chartDrawer;
    }

	return chartDrawer
}