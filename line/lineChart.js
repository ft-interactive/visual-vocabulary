function lineChart() {

    let yScale=d3.scaleLinear()
    let seriesNames = [];
    let yAxisAlign = 'right';

    function chart(parent){
        console.log("domain",yScale.domain(),"range",yScale.range());


    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        xScale = d;
        return chart;
    }

    chart.yDomain = (d)=>{
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d)=>{
        yScale.range(d);
        return chart;
    };

    chart.seriesNames = (d)=>{
        seriesNames = d;
        return chart;
    }

    chart.yAxisAlign = (d)=>{
        yAxisAlign = d;
        return chart;
    }

    return chart
}

function yLinearAxis() {
    let yScale = d3.scaleLinear();
    let yAxisAlign="right"
    let yLabelOffset=200;
    let tickSize = 5;

    function axis(parent) {
        const yAxis = parent.append("g")
            .attr("class","yAxis")
            .call(d3.axisRight(yScale))

        yLabelOffset= d3.selectAll(".yAxis text").node().getBBox().height
        console.log("axis width", yLabelOffset)

        yAxis.call(d3.axisRight(yScale)
            .tickSize(100))


    }


    axis.yScale = (d)=>{
        yScale = d;
        return axis;
    }
    axis.yAxisAlign = (d)=>{
        yAxisAlign=d;
        return axis;
    }
    axis.yLabelOffset = (d)=>{
        yLabelOffset=d;
        return axis;
    }
    axis.tickSize = (d)=>{
        tickSize=d;
        return axis;
    }

    return axis
}