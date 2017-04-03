function lineChart() {

    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =10

    function chart(parent){

        var lineData= d3.line()
            .x(function(d,i) { 
                return xScale(d.date); 
            })
            .y(function(d) { 
                return yScale(d.value); 
            })

       parent.append("path")
            .attr("stroke","#FFFFFF")
            .attr("stroke-width",3)
            .attr('d', function(d){
                console.log(d)
                return lineData(d.lineData); })


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
    chart.rem = (d)=>{
        if(!d) return rem;
        rem = d;
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
    let interval ="months"
    let rem=10

    function axis(parent) {
        var parseDate = d3.timeParse("%d/%m")

        const xAxis =d3.axisBottom()
            .tickSize(rem*0.75)
            .ticks(getTicks(interval))
            .tickFormat(tickFormat(interval))
            .scale(xScale)

        const xLabel = parent.append("g")
            .attr("class","axis xAxis")
            .call(xAxis)
        xLabel.attr("transform","translate(0,"+(plotDim.height)+")");

        let ticks=parent.selectAll(".xAxis line").each(
            function (d) {
                return d})
            .classed("baseline",true);

    }

    function getTicks(interval) {
        return {
            "decade":d3.timeYear.every(10),
            "lustrum":d3.timeYear.every(5),
            "years":d3.timeYear.every(1),
            "quarters":d3.timeMonth.every(3),
            "months":d3.timeMonth.every(1),
            "weeks":d3.timeWeek.every(1),
            "days":d3.timeDay.every(1)
        }[interval]
    }

    function tickFormat(interval) {
        return {
            "decade":d3.timeFormat("%Y"),
            "lustrum":d3.timeFormat("%Y"),
            "years":d3.timeFormat("%Y"),
            "quarters":d3.timeFormat("%b"),
            "months":d3.timeFormat("%b"),
            "weeks":d3.timeFormat("%b"),
            "days":d3.timeFormat("%d")
        }[interval]
    }

    axis.xScale = (d)=>{
        xScale = d;
        return axis;
    }
    axis.plotDim = (d)=>{
        plotDim = d;
        return axis;
    }
    axis.interval = (d)=>{
        interval = d;
        return axis;
    }
    axis.rem = (d)=>{
        rem = d;
        return axis;
    }
    return axis

}