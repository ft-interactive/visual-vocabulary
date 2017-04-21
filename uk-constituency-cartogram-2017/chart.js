//requires d3-scale

function cartogramLayout(){
    let data = [];
    let layout = [];
    let joinedLayout = [];
    let dataKey = 'ons_id';
    let layoutKey = 'ons_id';
    let valueAccessor = d => d.value;
    let spaceScale = d=>d;
    let colourScale = d => '#'+((1<<24)*Math.random()|0).toString(16); //bitshift to a random hex colour


    function cartogram(parent){
        parent.selectAll('circle')
            .data(joinedLayout)
            .enter()
            .append('circle')
                .attr('cx', d=>spaceScale(d.x))
                .attr('cy', d=>spaceScale(d.y))
                .attr('fill', d=>colourScale( valueAccessor(d.data) ))
                .attr('r',spaceScale(0.4)); //the radius of the circles is set relative to the grid i.e. r=0.5 will prcisely fill the grid squares, the circle edges will touch
    }

    cartogram.colourScale = (x) => {
        if(x===undefined) return colourScale;
        colourScale = x;
        return cartogram;
    }

    cartogram.valueAccessor = (x) => {
        if(x===undefined) return valueAccessor;
        valueAccessor = x;
        return cartogram;
    }

    cartogram.spaceScale = (x) => {
        if(x===undefined) return spaceScale;
        spaceScale = x;
        return cartogram;
    }

    cartogram.data = (x) => {
        if(x===undefined) return data;
        data = x;
        joinedLayout = doLayout(data,layout,dataKey,layoutKey);
        return cartogram;
    }

    cartogram.layout = (x) => {
        if(x===undefined) return layout;
        layout = x;
        joinedLayout = doLayout(data,layout,dataKey,layoutKey);
        return cartogram;
    }

    cartogram.layoutDimensions = () => {
        return layout.reduce((result, current, i, a)=>({
                x:Math.max(current.x,result.x),
                y:Math.max(current.y,result.y), }),
            {x:0, y:0});
    }

    cartogram.joinOn = (dKey, lKey) => {
        dataKey = dKey;
        layoutKey = lKey;
        joinedLayout = doLayout(data,layout,dataKey,layoutKey);
        return cartogram;
    }

    return cartogram;
}

function doLayout(data, layout, dataKey, layoutKey){
    const dataLookup = makeLookup(data, (d)=>(d[dataKey]));
    return layout.map((d)=>({
        x:d.x,
        y:d.y,
        data:dataLookup[d[layoutKey]],
    }))
}

function makeLookup(arr, keyAccessor){
    const lookup = {};
    arr.forEach(function(d){
        const key = keyAccessor(d);
        lookup[key] = d;
    });
    return lookup;
}
