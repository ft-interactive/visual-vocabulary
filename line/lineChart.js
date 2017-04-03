function lineChart() {

    let yScale=d3.scaleLinear()
    let seriesNames = [];
    let yAxisAlign = "right"

    function chart(parent){
        console.log("domain",yScale.domain(),"range",yScale.range());


    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        xScale = d;
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
        console.log(parent)
        console.log(yLabelOffset)
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

function yLinearAxis() {

    }