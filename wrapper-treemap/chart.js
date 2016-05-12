
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
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
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);

    var colours = d3.scale.ordinal()
      .range(stylename.fillcolours);
    
    // console.log(plotWidth,colours,plotHeight,data)
    // console.log(margin)
    //you now have a chart area, inner margin data and colour palette - with titles pre-rendered
    var dataset=nest(data);
    console.log(dataset);

    var treemap = d3.layout.treemap()//defines a potential treemap to be drawn
        .size([plotWidth, plotHeight])//sets the width and height as defined abouve
        .sticky(true)
        .sort(function(a, b) { return a.value - b.value; })//Sorts biggest rects to the left
        .value(function(d) { 
            return d.value; })//gets the value for the group rect
        .children(function(d){
            return d.values;//gets the value for each smaller item rect within the group rect
        });
    var treeData = treemap(dataset);//tells the treemap what data to use, In this case the variable dataset that has been passed into the function as 'data'


    var tree=plot.append('g')//appends an svg group item for each group in the dataset
        .attr({
            transform: 'translate(' + (margin.left) + ',' + margin.top + ')'//positions the svg
        });

    var node = tree
        .selectAll(".node")//selects all the potential rect with the node class
        .data(treeData)
        .enter()//adds a g for each item of data
        .append("g")
            .on("click",function(d){
                        var el = d3.select(this);
                        var label=el.select('text')
                        if (label.text()=="") {
                            label.text(function(d){return d.item +" "+d.value;})
                        }
                        else label.text(function(d){return ""})
                    })
            .attr("id",function(d){if(d.children){
                return d.key+" "+d.value
                }
                else {return d.group+" "+d.item+" "+d.value}
            })
            .attr({
                "class": media+"node",//assigns class name node
                transform: function(d){ 
                    return 'translate('+d.x+','+(d.y)+')'//works out their position
                }
            })
        .call(function(parent){//adds a rectangle into the g element and define height widht etc
            parent.append('rect')
                .attr("x",0)
                .attr("y",0)
                .attr("width",function(d){ return d.dx })
                .attr("height",function(d){ return d.dy })
                .style("stroke", "white")
                .style("fill",function(d){
                    //before defining the fill style checks to see if this is a group rect that has smaller rect in it. if so then it has a colour of none as it would be drawn over the small rect and you would not be able to see them
                    if(d.children){
                        return "none"
                    }
                    //if theis is a smaller rect within a group then returans a colour depending on the group name as defined on the colour scale at the top
                    else {return colours(d.group)}
                })
                .on("mouseover",pointer)

            parent.append('text')//adds a text beox and put the 'item' value in it and the 'value' value
                .attr("class", media+"label")
                .attr("x",5 )
                .attr("y",yOffset)
                .text(function(d){
                    if (d.label=="yes"){
                        return d.item +" "+d.value;
                    }
                })

            function pointer() {
                this.style.cursor='pointer'
            };
        });//End of call function

    //create a legend first
    var legdata=dataset.children.filter(function(el){return el.key});
    legdata.sort(function(a, b) { return b.value - a.value; })

    var legendyOffset=0
    var legend = plot.append("g")
        .attr("id",media+"legend")
        .on("mouseover",pointer)
        .selectAll("g")
        .data(legdata)
        .enter()
        .append("g")
        .attr ("id",function(d,i){
            return media+"l"+i
        })

    var drag = d3.behavior.drag().on("drag", moveLegend);
    d3.select("#"+media+"legend").call(drag);
        
    legend.append("text")

        .attr("id",function(d,i){
            return media+"t"+i
        })
        .attr("x",25)
        .attr("y",0)
        .attr("class",media+"subtitle")
        .text(function(d){
            return d.key;
        })

    legend.append("rect")
        .attr("x",0)
        .attr("y",-yOffset/1.4)
        .attr("width",15)
        .attr("height",yOffset/1.4)
        .style("fill", function(d,i){return colours(d.key)})

    legend.attr("transform",function(d,i){
        if (legAlign=='hori') {
            var gHeigt=d3.select("#"+media+"l0").node().getBBox().height;
            if (i>0) {
                var gWidth=d3.select("#"+media+"l"+(i-1)).node().getBBox().width+15; 
            }
            else {gWidth=0};
            legendyOffset=legendyOffset+gWidth;
            return "translate("+(legendyOffset)+","+(gHeigt)+")";  
        }
        else {
            var gHeight=d3.select("#"+media+"l"+(i)).node().getBBox().height
            return "translate(0,"+((i*yOffset)+yOffset/2)+")"};
    })

    function pointer() {
        this.style.cursor='pointer'
    };

    function moveLegend() {
        console.log(this.getBBox().width)
        var dX = d3.event.x-(this.getBBox().width/2);// subtract cx
        var dY = d3.event.y-(this.getBBox().height);// subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }

    function nest(data) {
        return {
            "key":"Groups", 
            "values":d3.nest()
                .key(function (d) { return d.group})
                .entries(data)
        };
    }
    

}