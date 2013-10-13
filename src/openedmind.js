// ------ Main ---------
var imageObjTextEditor = new Image();
imageObjTextEditor.src = '../src/omimages/text-editor.png';

var imageZoom = new Image();
imageZoom.src = '../src/omimages/zoom.png';
var imageZoomOutSprite = new Kinetic.Image({
	image : imageZoom,
	x : 0,
	y : 0,
	width : 30, //'destiantion Width'
	height : 30, //'destination Height'
	crop : [0, 0, 30, 30]
});
var imageZoomInSprite = new Kinetic.Image({
	image : imageZoom,
	x : 30,
	y : 0,
	width : 60, //'destiantion Width'
	height : 30, //'destination Height'
	crop : [30, 0, 60, 30]
});

var stage = new Kinetic.Stage({
	container : 'container',
	width : $('#container').width(),
	height : $('#container').height(),
	draggable : true
});

var backgroundLayer = new Kinetic.Layer();
var layer = new Kinetic.Layer();
var fixedOptionsLayer = new Kinetic.Layer({
	draggable : false
});
var editLayer = new Kinetic.Layer();

var selectedNode = new Node();

var backgroundImage = new Image();
backgroundImage.onload = function() {
	console.log("backgroung image load");
	var position = new Position(stage.getWidth() / 2 - 370, stage.getHeight() / 2 - 390);
	var image = new Kinetic.Image({
		x : position.x,
		y : position.y,
		image : backgroundImage
	});

	backgroundLayer.add(image);
	backgroundLayer.draw();
};
backgroundImage.src = '../src/omimages/bg_theme.png';

fixedOptionsLayer.add(imageZoomInSprite);
fixedOptionsLayer.add(imageZoomOutSprite);

stage.add(backgroundLayer);
stage.add(layer);
stage.add(fixedOptionsLayer);
stage.add(editLayer);

//FIXME: it is moving with the stage.
fixedOptionsLayer.draw();

var mindMap = new MindMap("../tests/mapaTeste.mm");

//Classes Definitions
function Position(x, y) {
	this.x = x;
	this.y = y;
}

function Dimension(w, h) {
	this.width = w;
	this.height = h;
}

function MindMap(url) {
	this.url = url;
	this.xmlRootDocument = null;
	this.map = null;

	//Everytime we create a new MindMap, lets clear all layers
	//	stage.clear();

	this.save = function() {
		$.ajax({
			type : "POST",
			url : "someAddress.php",
			processData: false,
			data : window.mindMap.xmlRootDocument
		});
	}

	this.redrawAll = function() {
		layer.destroyChildren();
		editLayer.clear();

		var xmlRootMap = this.xmlRootDocument.firstChild;
		var xmlRootNode = xmlRootMap.firstElementChild;

		this.map = new Map(xmlRootNode);
		this.map.draw();
		layer.batchDraw();
		
		this.save();
	};

	$.ajax({
		url : this.url,
		dataType : "xml",
		success : function(data) {
			window.mindMap.xmlRootDocument = data;
			var xmlRootMap = data.firstChild;
			var xmlRootNode = xmlRootMap.firstElementChild;

			//		alert(node.getText());
			//		alert(node.getId());
			window.mindMap.map = new Map(xmlRootNode);
			window.mindMap.map.draw();
			layer.batchDraw();
		}
	});

}

function Map(xmlRootNode) {
	this.rootNode = new Node(xmlRootNode);
	var centeredPositionInStage = new Position(stage.getWidth() / 2 - 100, stage.getHeight() / 2 - 40);
	this.rootNode.setNodePosition(centeredPositionInStage);

	this.draw = function() {
		this.drawMap(this.rootNode);
	};

	this.drawMap = function(node) {
		//this.printNode(node);
		node.draw();
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

		layer.add(line);
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

	this.setText = function(text) {
		$(this.xmlNode).attr("TEXT", text);
		this.text.setText(text);
		mindMap.redrawAll();
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

	this.draw = function() {
		layer.add(this.drawableElement);
	};

	//Constructor

	this.drawableElement = new Kinetic.Group({
		//draggable: true,
		x : this.position.x,
		y : this.position.y
	});

	this.text = new Kinetic.Text({
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
		width : this.text.getWidth() + 5,
		height : this.text.getHeight(),
		shadowColor : 'black',
		shadowBlur : 5,
		shadowOffset : [5, 5],
		shadowOpacity : 0.2,
		cornerRadius : 5
	});

	this.drawableElement.add(this.rect);
	this.drawableElement.add(this.text);

	/*
	 this.drawableElement.on('mouseover', function() {
	 editLayer.removeChildren();

	 //alert(imageObjTextEditor.naturaltHeight);

	 var imageTextEditor = new Kinetic.Image({
	 x : this.getPosition().x + this.clickedNode.getWidth() - 25, // - imageObjTextEditor.naturalWidth,
	 y : this.getPosition().y + this.clickedNode.getHeight() / 4, // - imageObjTextEditor.naturaltHeight)/2,
	 image : imageObjTextEditor
	 });

	 imageTextEditor.on('click', function() {
	 //$("#dialog").dialog("open");
	 var txt = prompt("gimme your text", "drawableElement");
	 alert(txt);
	 });

	 editLayer.add(imageTextEditor);
	 editLayer.batchDraw();
	 console.log("OVER");
	 });
	 */
	this.drawableElement.on('mouseover touchstart', function() {
		stage.setDraggable(false);
		//console.log("mouseover");
	});

	this.drawableElement.on('mouseout touchend', function() {
		stage.setDraggable(true);
		//console.log("mouseout");
	});

	this.drawableElement.clickedNode = this;
	this.selectNode = function() {
		selectedNode.rect.setStroke("#555");
		//selectedNode.rect.setStrokeWidth(2)
		console.log("Node" + this.clickedNode.getId() + " SELECTED :" + this.clickedNode.getText());
		this.clickedNode.rect.setStroke("#F00");
		//this.clickedNode.rect.setStrokeWidth(6);
		selectedNode = this.clickedNode;

		editLayer.removeChildren();

		var imageTextEditor = new Kinetic.Image({
			x : this.getPosition().x + this.clickedNode.getWidth() - 25, // - imageObjTextEditor.naturalWidth,
			y : this.getPosition().y + this.clickedNode.getHeight() / 4, // - imageObjTextEditor.naturaltHeight)/2,
			image : imageObjTextEditor
		});

		imageTextEditor.on('click touchend', function() {
			//$("#dialog").dialog("open");
			var txt = prompt("gimme your text", selectedNode.getText());
			selectedNode.setText(txt);
		});

		editLayer.add(imageTextEditor);
		editLayer.batchDraw();
		layer.batchDraw();
	};

	this.drawableElement.on('click touchend', this.selectNode);

};

$("#dialog").dialog({
	autoOpen : false,
	show : {
		effect : "blind",
		duration : 200
	},
	hide : {
		effect : "explode",
		duration : 200
	}
});

