
function makeChart(data,seriesNames,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    //var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });

    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered


    //sort the data in size of total size; comment this out if you want to preserve the original order
    data.sort(function(a, b) {
        return a.size-b.size;
    });


    //should auto-size this from label length - but for now, specify the gutters either side of bars
    var labelMarginL = 120;
    var labelMarginR = 40;


    //identify total size - used for y axis
     var totalSize = d3.sum(data, function(d){
        return d.size;
    })


    //identify the series which are part to whole elements [need the 'prop_' prefix]
    var propMatch = /prop_/;
    var components = []
    seriesNames.forEach(function(d){
        if (d.match(propMatch)){
            components.push(d)
        }
    })


    //create key
    var key = plot.append("g").attr("id","key");


    key.selectAll("rect")
        .data(components)
        .enter()
        .append("rect")
        .attr("fill",function(d,i){
            return colours[i];
        })
        .attr("width",plotWidth/10)
        .attr("height",plotHeight/40)
        .attr("y",subtitleYoffset+5)
        .attr("x",function(d,i){
            return labelMarginL+(i*(plotWidth/5))
        })

    key.selectAll("text")
        .data(components)
        .enter()
        .append("text")
        .attr("fill","black")
        .attr("y",subtitleYoffset)
        .attr("x",function(d,i){
            return labelMarginL+(i*(plotWidth/5))
        })
        .text(function(d){
            return d.split("prop_")[1]+(" (%)")
        })


    //prepare the stacks for the x axis 
   var xData = [];
   components.forEach(function(d,i){
        var values = []
        data.forEach(function(e,j){
            values.push({x:0,y:e[d]});
        })
        xData.push(values)
   })

   var xStack = d3.layout.stack();
   xStack(xData)

    var xScale = d3.scale.linear()
        .domain([0,100])
        .range([labelMarginL,plotWidth-(labelMarginR)])


    //append scale
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    plot.append("g")
        .attr("id","axis")
        .attr("class",media+"xAxis")
        .attr("transform","translate(0,"+(h-30)+")")
        .call(xAxis)


    //find out dimensions of key so that chart is offset below it
    var vOffset = (d3.select("#key").node().getBBox().height)+(d3.select("#key").node().getBBox().y)+10


    var yScale = d3.scale.linear()
        .domain([0,totalSize])
        .range([0,plotHeight-(vOffset+30)])

    var yData = data.map(function(d,i){
        return [{x:0,y:d.size}]
    })

    //stack the y axis data
    var yStack = d3.layout.stack();
    yStack(yData)


    var rows = [];
    yData.forEach(function(d,i){
        var rects = []
        xData.forEach(function(e,j){
            rects.push({height:d[0].y,y0:d[0].y0,width:e[i].y,x0:e[i].y0,cat:data[i].cat,total:data[i].size})
        })
        rows.push(rects) 
    })

    var groups = plot.append("g").attr("id","groups")
        .selectAll("g")
        .data(rows)
        .enter()
        .append("g")
        .attr("transform",function(d,i){

            var offset = i*2;//creates spacing between rows
            return "translate(0,"+(vOffset+yScale(d[0].y0)+offset)+")";
        })

    groups.append("text")
        .text(function(d){
            return d[0].cat
        })
        .attr("fill","black")
        .attr("text-anchor","end")
        .attr("x",labelMarginL-5)
        .attr("y",function(d){
            return yScale(d[0].height)/2+5
        })

    groups.append("text")
        .text(function(d){
            return d[0].total
        })
        .attr("fill","black")
        .attr("x",plotWidth-5)
        .attr("text-anchor","end")
        .attr("y",function(d){
            return yScale(d[0].height)/2+5
        })

    groups.selectAll("rect")
        .data(function(d){
            return d;
        })
        .enter()
        .append("rect")
        .attr("width",function(d){
            return Math.abs(xScale(d.width) - xScale(0)); 
        })
        .attr("x",function(d){
            return xScale(d.x0)
        })
        .attr("height",function(d){
            return yScale(d.height);
        })
        .attr("fill",function(d,i){
            return colours[i]
        })










    



        




    

}