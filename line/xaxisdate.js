function xaxisdate() {
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
            .tickSize(rem*.3)
            .ticks(getTicksMinor(interval))
            .tickFormat("")
            .scale(xScale)

        const xLabel = parent.append("g")
            .attr("class","axis xAxis")
            .call(xAxis)
        xLabel.attr("transform","translate(0,"+(plotDim.height)+")");

        if (minorAxis) {
            const xLabelMinor = parent.append("g")
            .attr("class","axis baseline")
            .call(xMinor)
            
            xLabelMinor.attr("transform","translate(0,"+(plotDim.height)+")");
        }

        let ticks = xLabel.selectAll(".tick");
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