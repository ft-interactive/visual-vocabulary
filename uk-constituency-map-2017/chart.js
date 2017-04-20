function choropleth(){
    let topology;
    let path;
    let projection;
    let dataset = [];
    let dataAccessor = (d)=>( d.value );
    let dataScale = (d)=>{
        if(d.value > 0){
            return '#fff';
        }
        return '#000';
    };
    let subunits = 'constituencies'

    function map(parent){
        const features = topojson.feature(topology, topology.objects[subunits]).features;
        parent.append('path')
            .data(features)
            .enter()
            .append('path')
                .attr('d',(d)=>{
                    return path(d);
                });
    }

    map.data = (x) => {
        if(x===undefined) return dataset;
        dataset = x;
        return map;
    }

    map.dataAccessor = (x) => {
        if(x===undefined) return dataAccessor;
        dataAccessor = x;
        return map;
    };

    map.dataScale = (x) => {
        if(x===undefined) return dataScale;
        dataScale = x;
        return map;
    };

    map.path = ()=>{
        return path;
    };

    map.projection = (x) => {
        if(x===undefined) return projection;
        projection = x;
        path = d3.geoPath(projection);
        return map;
    };

    map.topology = (x) => {
        if(x===undefined) return topology;
        topology = x;
        return map
    };

    return map;
}
