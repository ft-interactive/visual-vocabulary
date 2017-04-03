function lineChart() {

    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();
    let plotDim = {}
    let seriesNames = [];
    let yAxisAlign = "right"

    function chart(parent){
        //console.log("domain",yScale.domain(),"range",yScale.range());
        //console.log ("xScale", xScale)
        console.log ("plotDim", plotDim)

    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        yScale = d;
        return chart;
    }
    chart.yAxisAlign = (d)=>{
        if(!d) return yAxisAlign;
        yAxisAlign = d;
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
    chart.xScale = (d)=>{
        if(!d) return xScale;
        xScale = d;
        return chart;
    }
    chart.xDomain = (d)=>{
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d)=>{
        xScale.range(d);
        return chart;
    };
    chart.plotDim = (d)=>{
        if(!d) return plotDim;
        plotDim = d;
        return chart;
    }


    return chart
}

function yLinearAxis() {
    let yScale = d3.scaleLinear();
    let yAxisAlign="right"
    let yLabelOffset=0;
    let tickSize = 5;
    let yAxisHighlight = 0;
    let numTicksy=2

    function axis(parent) {

        const yAxis =getAxis(yAxisAlign)
            .ticks(numTicksy)
            .scale(yScale)
        
        const yLabel = parent.append("g")
            .attr("class","axis yAxis")
            .call(yAxis)

        //Calculate width of widest .tick text
        parent.selectAll(".yAxis text").each(
            function(){
                yLabelOffset=Math.max(this.getBBox().width,yLabelOffset);
            })
        //Use this to amend the tickSIze and re cal the vAxis
        yLabel.call(yAxis.tickSize(tickSize-yLabelOffset))

        //position label on right hand axis
        if(yAxisAlign=="right") {
            yLabel.selectAll("text")
            .attr("dx",yLabelOffset)
        }
        //translate if a left axis
        if (yAxisAlign=="left") {
            yLabel.attr("transform","translate("+(tickSize-yLabelOffset)+","+0+")")
        }
        //identify 0 line if there is one
        let originValue = 0;
        let origin = parent.selectAll(".tick").filter(function(d, i) {
                return d==originValue || d==yAxisHighlight;
            }).classed("baseline",true);
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
        if(d===undefined) return yLabelOffset
        yLabelOffset=d;
        return axis;
    }
    axis.tickSize = (d)=>{
        if(d===undefined) return tickSize
        tickSize=d;
        return axis;
    }
    axis.yAxisHighlight = (d)=>{
        yAxisHighlight = d;
        return axis;
    }
    axis.numTicksy = (d)=>{
        numTicksy = d;
        return axis;
    }
    axis.yAxisAlign = (d)=>{
        if(!d) return yAxisAlign;
        yAxisAlign = d;
        return axis;
    }

    return axis

    function getAxis(alignment){
        return{
            "left": d3.axisLeft(),
            "right":d3.axisRight()
        }[alignment]
    }
}

function xDateAxis() {
    let xScale = d3.scaleTime();
    let plotDim = {}

    function axis(parent) {
        const xAxis =d3.axisBottom()
            .tickSize(5)
            .ticks(10)
            .scale(xScale)

        const xLabel = parent.append("g")
            .attr("class","axis yAxis")
            .call(xAxis)
        xLabel.attr("transform","translate(0,"+(plotDim.height)+")")

    console.log(plotDim)


    }

    axis.xScale = (d)=>{
        xScale = d;
        return axis;
    }
    axis.plotDim = (d)=>{
        plotDim = d;
        return axis;
    }
    return axis

}