var stage = new Kinetic.Stage({
	container : 'container',
	width : 640,
	height : 400
});

var layer = new Kinetic.Layer();
/*
var rect = new Kinetic.Rect({
x : 239,
y : 75,
width : 100,
height : 50,
fill : 'green',
stroke : 'black',
strokeWidth : 4
});

// add the shape to the layer
layer.add(rect);
*/
// add the layer to the stage
stage.add(layer);

$.ajax({
	url : "../tests/mapaTeste.mm",
	dataType : "xml",
	success : function(data) {
		var map = data.firstChild;
		var rootNode = map.firstElementChild;
		var node = new Node(rootNode);
//		alert(node.getText());
//		alert(node.getId());

		var map = new Map(layer, rootNode);
		map.drawMap();
		/*$(data).find('node').each(function(){
		 var id = $(this).attr('ID');
		 alert(id);
		 });*/
		layer.batchDraw();
	}
});

function NodePosition(x,y) {
	this.x = x;
	this.y = y;
	
	
}

function Map(layer, rootNode) {
	this.rootNode = new Node(rootNode);
	alert(layer.getWidth());
	var position = new NodePosition(stage.getWidth()/2 -100, stage.getHeight()/2 -40);
	this.rootNode.setNodePosition(position);
	this.layer = layer;

	this.drawMap = function() {
		this.rootNode.draw(layer);
	};
}

function Node(xmlNode) {
	this.node = xmlNode;
	this.position = null;

	this.getId = function() {
		return $(this.node).attr("ID");
	};
	this.getText = function() {
		return $(this.node).attr("TEXT");
	};
	this.getCreatedTime = function() {
		return $(this.node).attr("CREATED");
	}
	this.getModifiedTime = function() {
		return $(this.node).attr("MODIFIED");
	}
	this.children = function() {
		var sonNode = this.node.children;
		//return new Node(sonNode);
		return sonNode;
	}
	this.setNodePosition = function( nodePosition ){
		this.position = nodePosition;
	}
	
	this.draw = function(layer) {
		var drawableNode = this;
		var complexText = new Kinetic.Text({
			x : this.position.x,
			y : this.position.y,
			text : drawableNode.getText(),
			fontSize : 18,
			fontFamily : 'Calibri',
			fill : '#555',
			width : 380,
			padding : 20,
			align : 'center'
		});

		var rect = new Kinetic.Rect({
			x : this.position.x,
			y : this.position.y,
			stroke : '#555',
			strokeWidth : 5,
			fill : '#ddd',
			width : complexText.getWidth()+10,
			height : complexText.getHeight(),
			shadowColor : 'black',
			shadowBlur : 10,
			shadowOffset : [10, 10],
			shadowOpacity : 0.2,
			cornerRadius : 10
		});

		layer.add(rect);
		layer.add(complexText);
	}
	
};