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
    stylesheet.id=media+"styles"
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
            .call(wrap,width - (margin.left + margin.right),margin.left,media+"title");
        
        var subYOffset = d3.select("#"+media+"header").node().getBBox().height;
        
        header.append("text")
            .attr("id",media+"Subtitle")
            .attr("class", media+"subtitle")
            .attr("x", margin.left)
            .attr("y", subYOffset+subtitleYoffset+titleYoffset+margin.top)
            .text(subtitle)
            .attr("dy",0)
            .call(wrap,width - (margin.left + margin.right),margin.left,media+"subtitle");

        //adds the hat and basline to the print version only
        if(media=="print") {
            header.append("path")
            .attr("class",media+"hat")
            .attr("d","M 0.5,"+(titleYoffset+margin.top)+" L0.5,0.5 "+(width-0.5)+",0.5 "+(width-0.5)+","+(titleYoffset+margin.top))
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
            .selectAll("tspan")
            .data(sourcelines)
            .enter()
            .append("tspan")
            .attr("class", media+"source")
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
            .attr("transform", "translate(" + (width - 29) + "," + (height - 16) + ")")
            .attr("class", media+"logo")
            .append("path")
            .attr("d", "M0,16h7.6v-0.6c-0.5,0-0.9,0-1.2-0.1c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.1-0.3-0.3-0.4-0.6c-0.1-0.2-0.1-0.6-0.1-1V8.2h1.2c1.1,0,1.9,0.2,2.3,0.5c0.5,0.3,0.8,0.9,1,1.9h0.6V5H9.8C9.7,5.6,9.5,6,9.3,6.3c-0.2,0.3-0.5,0.5-1,0.6C7.9,7,7.3,7.1,6.5,7.1H5.3V2c0-0.3,0.1-0.5,0.2-0.7c0.1-0.1,0.3-0.2,0.7-0.2h2.4c0.8,0,1.4,0,1.9,0.1c0.5,0.1,0.9,0.2,1.2,0.4c0.3,0.2,0.6,0.4,0.7,0.7c0.2,0.3,0.3,0.7,0.5,1.1h0.7L13.4,0H0v0.6c0.4,0,0.8,0.1,1,0.1c0.2,0,0.4,0.1,0.6,0.3C1.8,1.1,1.9,1.3,2,1.5c0.1,0.2,0.1,0.6,0.1,1v10.9c0,0.4,0,0.8-0.1,1c-0.1,0.2-0.2,0.4-0.4,0.6c-0.2,0.1-0.4,0.2-0.6,0.3c-0.2,0-0.6,0.1-1,0.1V16z M14.2,3.5H15c0.3-0.9,0.6-1.5,1-1.8c0.4-0.4,1.1-0.5,1.9-0.5h2v12.3c0,0.4,0,0.8-0.1,1c-0.1,0.2-0.2,0.4-0.4,0.6c-0.2,0.1-0.4,0.2-0.7,0.3c-0.3,0-0.6,0.1-1.1,0.1V16h7.7v-0.6c-0.5,0-0.9,0-1.1-0.1c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.1-0.3-0.3-0.4-0.6c-0.1-0.2-0.1-0.6-0.1-1V1.2h2c0.8,0,1.5,0.2,1.9,0.5c0.4,0.4,0.8,1,1,1.8h0.8L28.5,0H14.6L14.2,3.5z");  
        }

        if(media=="social") {
            footer.append("g")
            .attr("transform", "translate(" + (width - 58-25) + "," + (height-58-25) + ")") 
            .attr("class", media+"logo")
            .append("path")
            .attr("d","M58,57.9973405 L0,57.9973405 L0,0 L58,0 L58,57.9973405 L58,57.9973405 Z M14.8337695,21.716398 L16.7885154,21.716398 C20.1794011,21.716398 21.7208987,22.4864308 22.259758,25.5684032 L23.2611689,25.5684032 L23.2611689,16.3216677 L22.259758,16.3216677 C21.7593595,19.057289 20.872717,19.791316 16.7885154,19.791316 L14.8337695,19.791316 L14.8337695,11.5075306 C14.8337695,10.4275616 15.1031992,10.1597686 16.2952771,10.1597686 L20.2640965,10.1597686 C25.3877606,10.1597686 26.3901943,11.0830306 27.3150929,14.0109555 L28.3938344,14.0109555 L28.2379458,8.2328454 L6.35768051,8.2328454 L6.35768051,9.23487002 C8.86171916,9.3492293 9.59308666,9.65671052 9.59308666,12.3960142 L9.59308666,30.268181 C9.59308666,33.0052344 8.86171916,33.3129202 6.28075906,33.4291207 L6.28075906,34.4307361 L18.6853656,34.4307361 L18.6853656,33.4291207 C15.5641141,33.3131248 14.833565,33.0052344 14.833565,30.268181 L14.833565,21.716398 L14.8337695,21.716398 Z M53.0160629,8.23264082 L30.0554196,8.23264082 L29.522493,14.0130013 L30.83875,14.0130013 C31.6797714,11.1818419 32.9160382,10.1597686 35.6798914,10.1597686 L38.9159113,10.1597686 L38.9159113,30.2679764 C38.9159113,33.0050298 38.1841346,33.3127156 35.2179535,33.4289161 L35.2179535,34.4305316 L47.8547564,34.4305316 L47.8547564,33.4289161 C44.887757,33.3129202 44.1557758,33.0050298 44.1557758,30.2679764 L44.1557758,10.159564 L47.3905682,10.159564 C50.1558534,10.159564 51.3935523,11.1816373 52.2327325,14.0127967 L53.5489895,14.0127967 L53.0160629,8.23264082 L53.0160629,8.23264082 ZM58,57.9973405 L0,57.9973405 L0,0 L58,0 L58,57.9973405 L58,57.9973405 Z M14.8337695,21.716398 L16.7885154,21.716398 C20.1794011,21.716398 21.7208987,22.4864308 22.259758,25.5684032 L23.2611689,25.5684032 L23.2611689,16.3216677 L22.259758,16.3216677 C21.7593595,19.057289 20.872717,19.791316 16.7885154,19.791316 L14.8337695,19.791316 L14.8337695,11.5075306 C14.8337695,10.4275616 15.1031992,10.1597686 16.2952771,10.1597686 L20.2640965,10.1597686 C25.3877606,10.1597686 26.3901943,11.0830306 27.3150929,14.0109555 L28.3938344,14.0109555 L28.2379458,8.2328454 L6.35768051,8.2328454 L6.35768051,9.23487002 C8.86171916,9.3492293 9.59308666,9.65671052 9.59308666,12.3960142 L9.59308666,30.268181 C9.59308666,33.0052344 8.86171916,33.3129202 6.28075906,33.4291207 L6.28075906,34.4307361 L18.6853656,34.4307361 L18.6853656,33.4291207 C15.5641141,33.3131248 14.833565,33.0052344 14.833565,30.268181 L14.833565,21.716398 L14.8337695,21.716398 Z M53.0160629,8.23264082 L30.0554196,8.23264082 L29.522493,14.0130013 L30.83875,14.0130013 C31.6797714,11.1818419 32.9160382,10.1597686 35.6798914,10.1597686 L38.9159113,10.1597686 L38.9159113,30.2679764 C38.9159113,33.0050298 38.1841346,33.3127156 35.2179535,33.4289161 L35.2179535,34.4305316 L47.8547564,34.4305316 L47.8547564,33.4289161 C44.887757,33.3129202 44.1557758,33.0050298 44.1557758,30.2679764 L44.1557758,10.159564 L47.3905682,10.159564 C50.1558534,10.159564 51.3935523,11.1816373 52.2327325,14.0127967 L53.5489895,14.0127967 L53.0160629,8.23264082 L53.0160629,8.23264082 Z")

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

        var holder=p.append("div")
        holder.append("button")
        .attr("class","button")
        .text("Save "+media+" as PNG")
        .attr("float", "left")
        .on("click", savePNG);

        function savePNG(){
            console.log("Save "+media+"chart");
            saveSvgAsPng(document.getElementById(media+"chart"), media+"chart.png");
        }
        
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
function wrap(text, width,x, media) {
    text.each(function() {
        var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}