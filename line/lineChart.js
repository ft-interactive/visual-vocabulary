function lineChart() {
    //
    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =10;
    let includeMarker=(d)=> (d.marker==="yes");
    let markers = false;
    let curve =d3.curveLinear
    const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.lineWeb)
        .domain(seriesNames);
  
    function chart(parent){

        var lineData= d3.line()
            .curve(d3.curveLinear)
            .x(function(d,i) { 
                return xScale(d.date); 
            })
            .y(function(d) { 
                return yScale(d.value); 
            })

        parent.append("path")
            .attr("stroke",function (d){return colourScale(d.name)})
            .attr('d', function(d){
                return lineData(d.lineData); })

        if (markers) {
            parent.selectAll(".markers")
            .data(function(d) {
                let filtered=d.lineData.filter(includeMarker);
                return filtered
            })
            .enter()
            .append('circle')
            .classed("markers",true)
            .attr("cx",(d)=> xScale(d.date))
            .attr("cy",(d)=> yScale(d.value))
            .attr("r",rem*.4)
            .attr("fill",(d)=>{ return colourScale(d.name)} )
        }

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
    chart.includeMarker = (d)=>{
        includeMarker = d;
        return chart;
    }
    chart.markers = (d)=>{
        markers = d;
        return chart;
    }
    chart.curve = (d)=>{
        if(!d) return curve;
        curve = d;
        return chart;
    }
    chart.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='web') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    }

    return chart
}

function yLinearAxis() {
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

function xDateAxis() {
    let xScale = d3.scaleTime();
    let plotDim = {}
    let interval ="months"
    let rem=10
    let minorAxis = false

    function axis(parent) {
        var parseDate = d3.timeParse("%d/%m")

        const xAxis =d3.axisBottom()
            .tickSize(rem*0.75)
            .ticks(getTicks(interval))
            .tickFormat(tickFormat(interval))
            .scale(xScale)

        const xMinor=d3.axisBottom()
            .tickSize(rem*.5)
            .ticks(getTicksMinor(interval))
            .tickFormat("")
            .scale(xScale)

        const xLabel = parent.append("g")
            .attr("class","axis xAxis")
            .call(xAxis)
        xLabel.attr("transform","translate(0,"+(plotDim.height)+")");

        if (minorAxis) {
            const xLabelMinor = parent.append("g")
            .attr("class","axis xAxis")
            .call(xMinor)
            
            xLabelMinor.attr("transform","translate(0,"+(plotDim.height)+")");
        }

        let ticks = xLabel.selectAll(".tick");
        console.log("tick",ticks)
        ticks.each(function (d) {
            d3.select(this)
            .classed("baseline",true);
        })

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
    function getTicksMinor(interval) {
        return {
            "decade":d3.timeYear.every(1),
            "lustrum":d3.timeYear.every(1),
            "years":d3.timeMonth.every(1),
            "quarters":d3.timeMonth.every(1),
            "months":d3.timeWeek.every(1),
            "weeks":d3.timeDay.every(1),
            "days":d3.timeHour.every(1)
        }[interval]
    }

    function tickFormat(interval) {
        return {
            "decade":d3.timeFormat("%y"),
            "lustrum":d3.timeFormat("%y"),
            "years":d3.timeFormat("%y"),
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
    axis.minorAxis = (d)=>{
        minorAxis = d;
        return axis;
    }
    return axis
}

function drawHighlights() {
    let yScale=d3.scaleLinear();
    let xScale=d3.scaleTime();

    function highlights(parent){
        parent.append('rect')
            .attr('class',"highlights" )
            .attr("x", (d)=> xScale(d.begin))
            .attr("width", (d)=> xScale(d.end)-xScale(d.begin))
            .attr("y", (d)=> yScale.range()[1])
            .attr("height", (d)=> yScale.range()[0])
            .attr("fill","#fff1e0")
    }

    highlights.yScale = (d)=>{
        yScale = d;
        return highlights;
    }
    highlights.xScale = (d)=>{
        xScale = d;
        return highlights;
    }
    highlights.yRange = (d)=>{
        yScale.range(d);
        return highlights;
    };
    highlights.xRange = (d)=>{
        xScale.range(d);
        return highlights;
    };

    return highlights;
}
