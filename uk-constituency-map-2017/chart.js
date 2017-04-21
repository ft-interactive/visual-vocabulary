function choroplethFactory(){
    let topology;
    let path;
    let projection;
    let dataLookup = {};
    let dataAccessor = (d)=>( d.value );
    let dataScale = (d)=>{
        if(d.value > 0){
            return '#fff';
        }
        return '#000';
    };
    let topologyIDProperty = d=>d.id;
    let dataIDProperty = d=>d.id;
    let subunits = 'constituencies'

    function choropleth(parent){
        const features = topojson.feature(topology, topology.objects[subunits]).features;
        parent.append('path')
            .data(features)
            .enter()
            .append('path')
                .attr('d',(d)=>{
                    return path(d);
                })
                .attr('fill',(d)=>{
                    const id = topologyIDProperty( d );
                    const value = dataAccessor( dataLookup[id] );
                    return dataScale( value );
                });
    }

    choropleth.data = (x) => {
        if(x===undefined) return dataset;
        dataLookup = makeLookup(x,dataIDProperty);
        return choropleth;
    }

    choropleth.dataAccessor = (x) => {
        if(x===undefined) return dataAccessor;
        dataAccessor = x;
        return choropleth;
    };

    choropleth.dataIDProperty = (x) => {
        if(x===undefined) return dataIDProperty;
        dataIDProperty = x;
        return choropleth;
    }

    choropleth.dataScale = (x) => {
        if(x===undefined) return dataScale;
        dataScale = x;
        return choropleth;
    };

    choropleth.path = ()=>{
        return path;
    };

    choropleth.projection = (x) => {
        if(x===undefined) return projection;
        projection = x;
        path = d3.geoPath(projection);
        return choropleth;
    };

    choropleth.topology = (x) => {
        if(x===undefined) return topology;
        topology = x;
        return choropleth
    };

    return choropleth;
}

function makeLookup(arr, keyAccessor){
    const lookup = {};
    arr.forEach(function(d){
        const key = keyAccessor(d);
        lookup[key] = d;
    });
    return lookup;
}
