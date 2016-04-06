'use strict';

function printFrame(styles, media) {
    //build a string from the styles variable held on styles.js
    //Note that the media variable is placed at the begining of each
    //class to make it unique to the chart type, such as web or print
    var HTML="";
    for(var i = 0; i < styles.length; i++){
        HTML=HTML+("."+media+styles[i].class)
    }
    //Creats a new empty css stylesheet dynamically
    var stylesheet = document.createElement('style');
    stylesheet.type = 'text/css';
    //Places in the string built above to create the styles
    stylesheet.innerHTML = HTML
    //Adds it to the head of the document
    document.getElementsByTagName('head')[0].appendChild(stylesheet);
    
    var width = 600,
        height = 200,
        titleYoffset = 15,
        subtitleYoffset = 10,
        margin = {top: 50, left: 50, bottom: 50, right: 20},
        title = "Title goes here",
        subtitle,// = "Subtitle goes here",
        source = "Source: add source,|chart author and relevant footnotes",
        footnote;

    function frame(p) {
        
        var chart = p.append("svg")
            .attr("id","printchart")
            .attr("class","framefill")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height);
        
        var header = chart.append("g")
            .attr("id","header-prt");
        
        //headers - title and subtitle
        header.append("text")
            .attr("id","webTitle")
            .attr("class", media+"title")
            .attr("x", margin.left)
            .attr("y", titleYoffset)
            .text(title)
            .attr("dy",0)
            .call(wrap,width - (margin.left + margin.right),margin.left);
        
        var subYOffset = chart.select("#header-prt").node().getBBox().y + chart.select("#header-prt").node().getBBox().height;
        
        console.log("subtitleYoffset on print",subYOffset+subtitleYoffset)
        header.append("text")
            .attr("id","prtSubtitle")
            .attr("class", media+"subtitle")
            .attr("x", margin.left)
            .attr("y", subYOffset+subtitleYoffset)
            .text(subtitle)
            .attr("dy",0)
            .call(wrap,width - (margin.left + margin.right),margin.left);
        
        //add the hat!
        header.append("path")
            .attr("class",media+"hat")
            .attr("d","M0,"+titleYoffset+" L0,0 "+width+",0 "+width+","+titleYoffset)
        
        var contentOffsetTop = chart.select("#header-prt").node().getBBox().y + chart.select("#header-prt").node().getBBox().height;
        
        //footers - source/footnote and logo
        var footer = chart.append("g");
        
        //use vertical
        var sourcelines = source.split("|");
        
        footer.append("text")
            .attr("id","prtFooter")
            .attr("class", media+"source")
            .selectAll("tspan")
            .data(sourcelines)
            .enter()
            .append("tspan")
            .text(function(d){
                return d;
            })
            .attr("x",margin.left)
            .attr("dy","1.1em");
        
        //now we can layout the text in right place
        d3.select("#prtFooter").attr("y",function(){
            return height-d3.select(this).node().getBBox().height-5
        })
        
        
        var footerHeight = footer.node().getBBox().height;
        var footerExtent = footerHeight+footer.node().getBBox().y;
        var footerGap = height - footerExtent;
        var contentHeight = height - (contentOffsetTop+footerHeight+footerGap+5)
        
        //now we can reveal the content area...by filling in the space between header and footer
        var canvas = chart.append("g")
            .attr("class", media+"chartholder")
            .attr("transform","translate("+margin.left+","+contentOffsetTop+")");
        canvas.append("rect")
            .attr("id","chart-rect")
            .attr("width", width - (margin.left + margin.right))
            .attr("height", contentHeight)
            
        
    }

    frame.width = function (n) {
		if (!n) return width;
		width = n;
		return frame;
	};
    
    frame.height = function (n) {
		if (!n) return height;
		height = n;
		return frame;
	};
    
    frame.margin = function (n) {
		if (!n) return margin;
		margin = n;
		return frame;
	};
    
    frame.title = function (n) {
		if (!n) return title;
		title = n;
		return frame;
	};
    
    frame.subtitle = function (n) {
		if (!n) return subtitle;
		subtitle = n;
		return frame;
	};
    
    frame.source = function (n) {
		if (!n) return source;
		source = n;
		return frame;
	};
    
    frame.footnote = function (n) {
		if (!n) return footnote;
		footnote = n;
		return frame;
	};
    
return frame;
    
}

//wrap text function adapted from Mike Bostock
function wrap(text, width,x) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
}