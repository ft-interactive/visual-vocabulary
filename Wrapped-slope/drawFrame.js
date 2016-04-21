'use strict';

function drawFrame(styles, media,titley,suby) {
    //build a string from the styles variable held on styles.js
    //Note that the media variable is placed at the begining of each
    //class to make it unique to the chart type, such as web or print
    var HTML="";
    for(var i = 0; i < styles.length; i++){
        HTML=HTML+("\n."+media+styles[i].class)
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
        titleYoffset = titley,
        subtitleYoffset = suby,
        margin = {top: 50, left: 50, bottom: 50, right: 20},
        title = "Title goes here",
        subtitle,// = "Subtitle goes here",
        source = "Source: add source,|chart author and relevant footnotes",
        footnote;

    function frame(p) {
        
        var chart = p.append("svg")
            .attr("id",media+"chart")
            .attr("class","chart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height);

        chart.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", media+"background");

        if(media=="video") {
            var boxOffset=20
            chart.append("rect")
            .attr("id",media+"Titlebox")
            .attr("class", media+"titleframe")
            .attr("x", margin.left-boxOffset)
            .attr("y", 73)
            .attr("width", width-margin.left-margin.right+(boxOffset*2))
            .attr("height", 110);
        }
        
        var header = chart.append("g")
            .attr("id",media+"header");
        
        //headers - title and subtitle
        header.append("text")
            .attr("id",media+"Title")
            .attr("class", media+"title")
            .attr("x", margin.left)
            .attr("y", titleYoffset+margin.top)
            .text(title)
            .attr("dy",0)
            .call(wrap,width - (margin.left + margin.right),margin.left);
        
        header.append("text")
            .attr("id",media+"Subtitle")
            .attr("class", media+"subtitle")
            .attr("x", margin.left)
            .attr("y", subtitleYoffset+titleYoffset+margin.top)
            .text(subtitle)
            .attr("dy",0)
            .call(wrap,width - (margin.left + margin.right),margin.left);

        //adds the hat and basline to the print version only
        if(media=="print") {
            header.append("path")
            .attr("class",media+"hat")
            .attr("d","M 0.5,"+(titleYoffset+margin.top)+" L1,0 "+(width-0.5)+",0 "+(width-1)+","+(titleYoffset+margin.top))
            chart.append("path")
            .attr("class",media+"hat")
            .attr("d","M 0.5,"+(height-0.5)+" L"+(width-0.5)+","+(height-0.5)+"")
        };
        
        var contentOffsetTop = chart.select("#"+media+"header").node().getBBox().y + chart.select("#"+media+"header").node().getBBox().height;
        
        //footers - source/footnote and logo
        var footer = chart.append("g");
        
        //use vertical
        var sourcelines = source.split("|");
        
        footer.append("text")
            .attr("id",media+"Footer")
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
        d3.select("#"+media+"Footer")
            .attr("y",function(){
            return height-d3.select(this).node().getBBox().height-margin.bottom
            })
        
        //logo 
        if(media=="web") {
            footer.append("g")
            .attr("transform", "translate(" + (width - 30 - margin.left) + "," + (height - 16-margin.bottom) + ")")
            .attr("class", media+"logo")
            .append("path")
            .attr("d", "M0,16h7.6v-0.6c-0.5,0-0.9,0-1.2-0.1c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.1-0.3-0.3-0.4-0.6c-0.1-0.2-0.1-0.6-0.1-1V8.2h1.2c1.1,0,1.9,0.2,2.3,0.5c0.5,0.3,0.8,0.9,1,1.9h0.6V5H9.8C9.7,5.6,9.5,6,9.3,6.3c-0.2,0.3-0.5,0.5-1,0.6C7.9,7,7.3,7.1,6.5,7.1H5.3V2c0-0.3,0.1-0.5,0.2-0.7c0.1-0.1,0.3-0.2,0.7-0.2h2.4c0.8,0,1.4,0,1.9,0.1c0.5,0.1,0.9,0.2,1.2,0.4c0.3,0.2,0.6,0.4,0.7,0.7c0.2,0.3,0.3,0.7,0.5,1.1h0.7L13.4,0H0v0.6c0.4,0,0.8,0.1,1,0.1c0.2,0,0.4,0.1,0.6,0.3C1.8,1.1,1.9,1.3,2,1.5c0.1,0.2,0.1,0.6,0.1,1v10.9c0,0.4,0,0.8-0.1,1c-0.1,0.2-0.2,0.4-0.4,0.6c-0.2,0.1-0.4,0.2-0.6,0.3c-0.2,0-0.6,0.1-1,0.1V16z M14.2,3.5H15c0.3-0.9,0.6-1.5,1-1.8c0.4-0.4,1.1-0.5,1.9-0.5h2v12.3c0,0.4,0,0.8-0.1,1c-0.1,0.2-0.2,0.4-0.4,0.6c-0.2,0.1-0.4,0.2-0.7,0.3c-0.3,0-0.6,0.1-1.1,0.1V16h7.7v-0.6c-0.5,0-0.9,0-1.1-0.1c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.1-0.3-0.3-0.4-0.6c-0.1-0.2-0.1-0.6-0.1-1V1.2h2c0.8,0,1.5,0.2,1.9,0.5c0.4,0.4,0.8,1,1,1.8h0.8L28.5,0H14.6L14.2,3.5z");  
        }

        if(media=="social") {
            footer.append("g")
            .attr("transform", "translate(" + (width - 500 - margin.left) + "," + (height - 500-margin.bottom) + ")") 
            .attr("class", media+"logo")
            .append("path")
            .attr("d","M364.001238,507 L337,507 L337,480 L364.001238,480 L364.001238,507 L364.001238,507 Z M343.905692,490.109821 L344.815702,490.109821 C346.39429,490.109821 347.111917,490.468301 347.362776,491.903078 L347.828972,491.903078 L347.828972,487.598366 L347.362776,487.598366 C347.129821,488.871903 346.717055,489.213621 344.815702,489.213621 L343.905692,489.213621 L343.905692,485.3572 C343.905692,484.854432 344.031122,484.729764 344.58608,484.729764 L346.433719,484.729764 C348.818982,484.729764 349.285654,485.159578 349.71623,486.52264 L350.218426,486.52264 L350.145853,483.832707 L339.959746,483.832707 L339.959746,484.299188 C341.125472,484.352427 341.465952,484.495571 341.465952,485.770823 L341.465952,494.091006 C341.465952,495.36521 341.125472,495.50845 339.923936,495.562546 L339.923936,496.028836 L345.698759,496.028836 L345.698759,495.562546 C344.245696,495.508545 343.905597,495.36521 343.905597,494.091006 L343.905597,490.109821 L343.905692,490.109821 Z M361.681023,483.832612 L350.991958,483.832612 L350.74386,486.523593 L351.356628,486.523593 C351.748156,485.205579 352.323686,484.729764 353.610366,484.729764 L355.116858,484.729764 L355.116858,494.090911 C355.116858,495.365115 354.776188,495.508355 353.395316,495.56245 L353.395316,496.028741 L359.278236,496.028741 L359.278236,495.56245 C357.896983,495.50845 357.556218,495.365115 357.556218,494.090911 L357.556218,484.729669 L359.062138,484.729669 C360.349485,484.729669 360.925682,485.205484 361.316353,486.523498 L361.929121,486.523498 L361.681023,483.832612 L361.681023,483.832612 Z")

        }

        var footerHeight = footer.node().getBBox().height;
        var footerExtent = footerHeight+footer.node().getBBox().y;
        var footerGap = height - footerExtent;
        var contentHeight = height - (contentOffsetTop+footerHeight+footerGap+5)
        
        //now we can reveal the content area...by filling in the space between header and footer
        var plot = chart.append("g")
            .attr("class", media+"chartholder")
            .attr("id", media+"plot")
            .attr("transform","translate("+margin.left+","+contentOffsetTop+")");
        plot.append("rect")
            .attr("id",media+"Chart")
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