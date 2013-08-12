
var stage = new Kinetic.Stage({
	container : 'container',
	width : $('#container').width(),
	height : $('#container').height(),
	draggable: true
});

var layer = new Kinetic.Layer();


var selectedNode = new Node();
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

		//		alert(node.getText());
		//		alert(node.getId());

		var map = new Map(layer, rootNode);
		map.draw();
		/*$(data).find('node').each(function(){
		 var id = $(this).attr('ID');
		 alert(id);
		 });*/
		layer.batchDraw();
	}
});

function Position(x, y) {
	this.x = x;
	this.y = y;
}

function Dimension(w, h) {
	this.width = w;
	this.height = h;
}

function Map(layer, rootNode) {
	this.rootNode = new Node(rootNode);
	var position = new Position(stage.getWidth() / 2 - 100, stage.getHeight() / 2 - 40);
	this.rootNode.setNodePosition(position);
	this.layer = layer;

	this.draw = function() {
		this.drawMap(this.rootNode);

	};

	this.drawMap = function(node) {
		//this.printNode(node);
		node.draw(this.layer);
		var nodeHeight = this.countHeightOfANode(node);
		var nodePositionReference = new Position(node.position.x, node.position.y);
		nodePositionReference.x = nodePositionReference.x + node.getWidth() + 40;
		nodePositionReference.y = nodePositionReference.y - nodeHeight / 2;

		var xmlChildren = node.xmlChildrenArray();
		for (var i = 0; i < xmlChildren.length; i++) {

			//ignore everything thats not node
			if (xmlChildren[i].nodeName.toLowerCase() != "node")
				continue;

			var childNode = new Node(xmlChildren[i]);
			var childNodeHeight = this.countHeightOfANode(childNode);

			var positionOfChildNode = new Position(nodePositionReference.x, nodePositionReference.y + childNodeHeight / 2);
			childNode.setNodePosition(positionOfChildNode);
			nodePositionReference.y = nodePositionReference.y + childNodeHeight;

			this.drawConnections(node, childNode);

			this.drawMap(childNode);
		}
	}

	this.drawConnections = function(nodeFrom, nodeTo) {

		var positionFrom = new Position(nodeFrom.getPosition().x, nodeFrom.getPosition().y);
		positionFrom.x = positionFrom.x + nodeFrom.getWidth();
		positionFrom.y = positionFrom.y + nodeFrom.getHeight() / 2;

		var positionTo = new Position(nodeTo.getPosition().x, nodeTo.getPosition().y);
		positionTo.y = positionTo.y + nodeTo.getHeight() / 2;

		var line = new Kinetic.Line({
			points : [positionFrom.x, positionFrom.y, positionTo.x, positionTo.y],
			stroke : 'red'
		});

		this.layer.add(line);
	}

	this.printNode = function(node) {
		console.log(node.getText() + "(" + node.position.x + "," + node.position.y + ")" + ">" + this.countHeightOfANode(node));
	}

	//Used by the logic that displays de map
	this.countHeightOfANode = function(node) {
		var spacing = 5;
		var ct = 0;
		if (node.getXmlNode().childElementCount == 0) {
			return node.getHeight();
		} else {
			var xmlChildren = node.xmlChildrenArray();
			for (var i = 0; i < xmlChildren.length; i++) {
				//ignore everything thats not node
				if (xmlChildren[i].nodeName.toLowerCase() != "node")
					continue;

				ct = ct + this.countHeightOfANode(new Node(xmlChildren[i])) + spacing;
			}
		}
		return ct;
	};
}

function Node(xmlNode) {
	this.xmlNode = xmlNode;
	this.position = new Position(0, 0);

	this.getXmlNode = function() {
		return this.xmlNode;
	};

	this.getId = function() {
		return $(this.xmlNode).attr("ID");
	};
	this.getText = function() {
		var text = $(this.xmlNode).attr("TEXT");
		if ( typeof text === 'undefined')
			return "UNDEFINED TEXT";
		return text;
	};
	this.getCreatedTime = function() {
		return $(this.xmlNode).attr("CREATED");
	};
	this.getModifiedTime = function() {
		return $(this.xmlNode).attr("MODIFIED");
	};
	this.xmlChildrenArray = function() {
		var sonxmlNode = this.xmlNode.children;
		//return new Node(sonNode);
		return sonxmlNode;
	};

	this.setNodePosition = function(newPosition) {
		this.position = newPosition;
		this.drawableElement.setX(this.position.x);
		this.drawableElement.setY(this.position.y);
	};

	this.getPosition = function() {
		return this.position;
	}

	this.getWidth = function() {
		return this.rect.getWidth();
	};

	this.getHeight = function() {
		return this.rect.getHeight();
	};

	this.draw = function(layer) {
		layer.add(this.drawableElement);
	};

	//Constructor
	
	this.drawableElement = new Kinetic.Group({
		//draggable: true,
		x : this.position.x,
		y : this.position.y
	});
	
	text = new Kinetic.Text({
		text : this.getText(),
		fontSize : 18,
		fontFamily : 'Calibri',
		fill : '#555',
		//width : this.dimension.width,
		padding : 10,
		align : 'center'
	});

	this.rect = new Kinetic.Rect({
		stroke : '#555',
		strokeWidth : 2,
		fill : '#ddd',
		width : text.getWidth() + 5,
		height : text.getHeight(),
		shadowColor : 'black',
		shadowBlur : 5,
		shadowOffset : [5, 5],
		shadowOpacity : 0.2,
		cornerRadius : 5
	});
	
	this.drawableElement.add(this.rect);
	this.drawableElement.add(text);
	
	this.drawableElement.on('mouseover touchstart', function(){
		stage.setDraggable(false);
		console.log("mouseover");
	});
	
	this.drawableElement.on('mouseout touchend', function(){
		stage.setDraggable(true);
		console.log("mouseout");
	});
	
	this.drawableElement.clickedNode = this;
	this.selectNode = function() {
		selectedNode.rect.setStroke("#555");
		selectedNode.rect.setStrokeWidth(2)
		
		console.log( "Node"+this.clickedNode.getText()+" SELECTED" );
		this.clickedNode.rect.setStroke("#F00");
		this.clickedNode.rect.setStrokeWidth(6);
		
		selectedNode = this.clickedNode;
		
		layer.batchDraw();
	};
	
	this.drawableElement.on('click touchend', this.selectNode );
	
	
};

