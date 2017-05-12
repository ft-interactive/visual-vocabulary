function yaxislinear() {
    let yScale = d3.scaleLinear();
    let yAxisAlign = "right"
    let yLabelOffset = 0;
    let tickSize = 5;
    let yAxisHighlight = 0;
    let numTicksy = 2

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
        let origin = yLabel.selectAll(".tick").filter(function(d, i) {
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