var stage = new Kinetic.Stage({
	container : 'container',
	width : 1024,
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

function Position(x,y) {
	this.x = x;
	this.y = y;	
}
function Dimension(w, h){
	this.width = w;
	this.height = h;
}

function Map(layer, rootNode) {
	this.rootNode = new Node(rootNode);
	var position = new Position(stage.getWidth()/2 -100, stage.getHeight()/2 -40);
	this.rootNode.setNodePosition(position);
	this.layer = layer;

	this.draw = function() {
		this.drawMap(this.rootNode);
		
	};
	
	this.drawMap = function( node ){
		this.printNode(node);
		node.draw(this.layer);
		var nodeHeight =  this.countHeightOfANode ( node );
		var nodePositionReference = new Position(node.position.x, node.position.y);
		nodePositionReference.x = nodePositionReference.x + node.getWidth() + 40;
		nodePositionReference.y = nodePositionReference.y - nodeHeight/2;
		
		var xmlChildren = node.xmlChildrenArray();
		for( var i=0; i<xmlChildren.length; i++ ){
			var childNode = new Node( xmlChildren[i] );
			var childNodeHeight = this.countHeightOfANode( childNode );
			
			var positionOfChildNode = new Position( nodePositionReference.x, 
							nodePositionReference.y + childNodeHeight/2 );
			childNode.setNodePosition( positionOfChildNode );
			nodePositionReference.y = nodePositionReference.y + childNodeHeight;
			
			//this.printNode(childNode);
			this.drawMap(childNode);
			//childNode.draw(layer);
		}
	}
	
	this.printNode = function (node){
		console.log(node.getText()+"("+node.position.x+","+node.position.y+")"+">"+this.countHeightOfANode(node));
	}
	
	this.countHeightOfANode = function(node) {
		var spacing = 5;
		var ct = 0;
		if( node.getXmlNode().childElementCount == 0 ){
			return node.getHeight();
		}else{
			var xmlChildren = node.xmlChildrenArray();
			for( var i=0; i < xmlChildren.length; i++ ){
				ct = ct + this.countHeightOfANode(new Node( xmlChildren[i] )) +spacing;
			}
		}
		return ct;	
	};
}

function Node(xmlNode) {
	this.xmlNode = xmlNode;
	this.position = new Position(0,0);
	
	this.getXmlNode = function () {
		return this.xmlNode;
	};
	
	this.getId = function() {
		return $(this.xmlNode).attr("ID");
	};
	this.getText = function() {
		var text = $(this.xmlNode).attr("TEXT");
		if( typeof text === 'undefined' )
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
	
	this.setNodePosition = function( newPosition ){
		this.position = newPosition;
		this.drawableElements[0].setX(this.position.x);
		this.drawableElements[0].setY(this.position.y);
		this.drawableElements[1].setX(this.drawableElements[0].getX());
		this.drawableElements[1].setY(this.drawableElements[0].getY())	;
	};
	
	this.getWidth = function(){
		return this.drawableElements[1].getWidth();
	};
	
	this.getHeight = function(){
		return this.drawableElements[1].getHeight();
	};
	
	this.draw = function(layer) {
		layer.add(this.drawableElements[1]);
		layer.add(this.drawableElements[0]);
	};
	
//Constructor
	this.drawableElements =new Array();
	this.drawableElements[0]= new Kinetic.Text({
			x : this.position.x,
			y : this.position.y,
			text : this.getText(),
			fontSize : 18,
			fontFamily : 'Calibri',
			fill : '#555',
			//width : this.dimension.width,
			padding : 10,
			align : 'center'
		});

	this.drawableElements[1] = new Kinetic.Rect({
			x : this.position.x,
			y : this.position.y,
			stroke : '#555',
			strokeWidth : 5,
			fill : '#ddd',
			width : this.drawableElements[0].getWidth()+5,
			height : this.drawableElements[0].getHeight(),
			shadowColor : 'black',
			shadowBlur : 5,
			shadowOffset : [5, 5],
			shadowOpacity : 0.2,
			cornerRadius : 5
		});
};

