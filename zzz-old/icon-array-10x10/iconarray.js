d3.layout.iconArray = function (){
	var blockWidth = 10, blockHeight,
		blockGap = 2, //if a block is filled make another block
		verticalFirst = false;

	function layout(data){
		return data.map(function(d,i){
			var pos = position(i);
			pos.data = d;
			return pos
		});
	}

	function position(itemNum){
		if( !blockHeight ) blockHeight = blockWidth;
		var blockSize = blockWidth * blockHeight;
		var blockNum = Math.floor( itemNum / blockSize );
		if(verticalFirst){
			return {
				x: Math.floor( itemNum/blockHeight ) + (blockGap * blockNum), // - blockWidth * blockNum,
				y: itemNum%blockHeight,// + (blockGap + blockHeight) * blockNum,
			};
		}
		return {
			x: itemNum%blockWidth + (blockGap + blockWidth) * blockNum,
			y: Math.floor( itemNum/blockWidth ) - blockHeight * blockNum,
		};
	}

	layout.position = function(itemNum){
		return position(itemNum);
	};

	layout.maxDimensions = function(numItems){ //find out how big the layout will be for a given array size
		var pos = position(numItems)
		pos.x = Math.max(pos.x, blockWidth);
		pos.y = Math.max(pos.y, blockWidth);
		pos.max = Math.max(pos.x, pos.y);
		return pos;
	};

	layout.verticalFirst = function(b){
		if(!b) return verticalFirst;
		verticalFirst = b;
		return layout;
	};

	layout.blockWidth = function(w){
		if(!w) return blockWidth;
		blockWidth = w;
		return layout;
	};

	layout.blockHeight = function(h){
		if(!h) return blockHeight;
		blockHeight = h;
		return layout;
	};

	layout.blockArea = function(){
		return blockHeight * blockWidth;
	}

	layout.blockGap = function(g){
		if(!g) return blockGap;
		blockGap = g;
		return layout;
	};

	return layout;
}