//WHY DO TICKS HAVE A MAJOR AND MINOR TICK STYLE??
//HOW CAN WE DEAL WITH INTERVALS THAT ARE NOT ANNUAL -- LET'S JUST RELY ON DEFAULT XAXIS STUFF?
//WHY WERE THERE TWO AXIS, AS FAR AS I CAN SEE WE ONLY NEED ONE 
//NB HAVE SET CHARTHEIGHT TO DECIDE MAX CIRCLE, NOT CHART WIDTH  

function circlesTimelineChart(){

	let yScale;
	let xScale;
	let rScale;
	let maxCircle;
	let colours;
    let xAxis;

    function chartDrawer(parent){

    	parent.append("g")
    	    .attr('class', 'webfill')
            .attr('fill', (d, i) => colours[i] )
            .attr('stroke', (d,i) => colours[i])

    	let timeLine = parent.select("g");

    	timeLine.selectAll("circle")
	    	.data( d => d.values)
	    	.enter()
	    	.append('circle')
	    	.attr("id", d => d.date + d.value)
            .attr("r", d => rScale(d.value) )
            .attr("cx", (d, i) => xScale(d.date) )
            .attr("cy", 0 );

        //add labels to circles that need it 
        parent.append("g").selectAll("text")
        	.data( d => {
        		 return d.values.filter( e => e.label === 'yes' ) 
        		})    
        	.enter()
        	.append("text")
        	.attr("x", d =>  xScale(d.date))
        	.attr("y", d =>  0 - rScale(d.value) -12)
        	.text( d => `${d.name} (${d.date})`)
        	.attr("text-anchor", "middle")
        	.attr("fill", "black");

        //add connecting lines to labels
        timeLine.selectAll("line")
        	.data( d => {
        		return d.values.filter( e => e.label === 'yes') 
        	})
        	.enter()
        	.append("line")
        	.attr("x1", d => xScale(d.date))
        	.attr("x2", d => xScale(d.date))
        	.attr("y1", d => 0-rScale(d.value))
        	.attr("y1", d => 0-rScale(d.value) -10);

        //add x axis     
        parent.append("g")
            .attr("class", "axis")
            .call(xAxis)
            .selectAll('text')
            .attr("y", 15);

        //add chart subtitle 
        parent.append("text")
    		.attr("class", "websubtitle")
    			.text(d => d.key )
    		.attr('y', -(maxCircle*0.4) )
    }

    //setter methods for the closure
    chartDrawer.setRScale = (x)=>{
    	rScale = x;
    	return chartDrawer;
    }
    chartDrawer.setYScale = (x)=>{
    	yScale = x;
    	return chartDrawer;
    }
    chartDrawer.setXScale = (x)=>{
    	xScale = x;
    	return chartDrawer;
    }
    chartDrawer.setMaxCircle = (x)=>{
    	maxCircle = x;
    	return chartDrawer;
    }
    chartDrawer.setColours = (x)=>{
    	colours = x;
    	return chartDrawer;
    }
    chartDrawer.setXAxis = (x)=>{
        xAxis = x;
        return chartDrawer;
    }

    return chartDrawer;
};
