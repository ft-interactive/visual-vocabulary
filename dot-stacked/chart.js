
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign,seriesNames){

  console.log(data)

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

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

     //console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered


var innerMargin={left:plotWidth*.15,top:20}

    //some globals for chart configuration
    var numRows = 5;
    var divisor = 1;

    var yScale = d3.scale.ordinal()
      .domain(data.map(function(d){
        return d.date;
      }))
      .rangeBands([0,plotHeight],0)

    var maxValue = d3.max(data.map(function(d){
      return d.total;
    }))

    var maxCols = (maxValue/divisor)/numRows
    var colIndex = d3.range(maxCols)
    var xDotScale = d3.scale.ordinal()
      .domain(colIndex)
      .rangeBands([innerMargin.left,plotWidth*0.9],0.9)

    var yDotScale = d3.scale.ordinal()
      .domain(d3.range(numRows))
      .rangeBands([0,yScale.rangeBand()/2])

    var stacks = plot.selectAll("g").data(data).enter().append("g")
      .attr("transform",function(d){
          return "translate(0,"+(innerMargin.top+yScale(d.date))+")";
      })

    //create circles for the stack
    stacks.each(function(d,i){
      var circlerange = d3.range(d.total/divisor);
      d3.select(this).selectAll("circle").data(circlerange).enter().append("circle")
        .attr("r",yDotScale.rangeBand()/2)
        .attr("id",function(d){
          return "circle"+i+"_"+d;
        })
        .attr("cx",function(d,i){
            return xDotScale(Math.floor(d/numRows))
        })
        .attr("cy",function(d,i){
            return yDotScale(d % numRows)
        })
        .attr("fill","gray")
    })

    //colour circles according to source
    stacks.each(function(d,i){

      var ranges = seriesNames.map(function(e,j){
        return d[e]/divisor//number of shapes to be coloured for each group
      })

      console.log(ranges)

      var index = 0;
      stackIndex=[0]

      seriesNames.forEach(function(obj,k){
        if (k>0){
          index=index+ranges[k-1];
          stackIndex.push(index)
        }
      })

      for (i=0;i<seriesNames.length;i++){
        var selecty = d3.select(this).selectAll("circle").filter(function(y,z){
          if (i<seriesNames.length-1){
          return z>=stackIndex[i]&&z<stackIndex[i+1]
        } else {
          return z>=stackIndex[i];
        }
        })
        selecty.attr("fill",colours[i])
      }
    })

        stacks.append("text")
          .text(function(d){
            return d.date
          })
        .attr("class",media+"title")
        .attr("y",innerMargin.top-20)

        stacks.append("text")
            .text(function(d){
            return d.prepack+" prepack"
        })
        .attr("class",media+"subtitle")
        .attr("y",innerMargin.top)

        var key = plot.append("g")
            .attr("id","key")
            .selectAll("g")
            .data(seriesNames)
            .enter()
            .append("g")

        key.append("circle")
            .attr("r",yDotScale.rangeBand()/2.5)
            .attr("fill",function(d,i){
                return colours[i]
            })
            .attr("cx",function(d,i){
                return margin.left+(i*70)
            })
            .attr("cy",h-margin.bottom)

        key.append("text")
            .text(function(d){
                return d;
            })
            .attr("y",h-margin.bottom+(yDotScale.rangeBand()/2))
            .attr("x",function(d,i){
                return margin.left+(yDotScale.rangeBand()/1.5)+(i*70)
            })
            .attr("class",media+"subtitle")



}
