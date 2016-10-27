(function () { 'use strict';

var scene = [];

var presScene = [];
var scenes = [];


// constructor
var PresentationControl = function() {

	this.pres = null
//	this.scene = this.loadImage(path);
		
}

PresentationControl.loadImage = function(path) {
    
    var present = null;
    // load presentation.json
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 || xhr.status === 0 ) {
				var jsonObject = JSON.parse( xhr.responseText );
				present = Presentation.fromJson (xhr.responseText);
			}
		}
	};

	xhr.open( "GET", path, false );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );


	scene[0] = {list:"https://lyra.evl.uic.edu:9000/sagewalls/photos.txt",
		location:"https://lyra.evl.uic.edu:9000/sagewalls/",
		name:"sage"};
	scene[1] = {list:"https://lyra.evl.uic.edu:9000/webcam2.txt",
		location:"ftp://ftp.evl.uic.edu/pub/INcoming/spiff/",
		name:"pond"};
	scene[2] = {list:"https://lyra.evl.uic.edu:9000/webcam3.txt",
		location:"http://cdn.abclocal.go.com/three/wls/webcam/",
		name:"chi"};
	scene[3] = {list:"https://lyra.evl.uic.edu:9000/posters/photos.txt",
		location:"https://lyra.evl.uic.edu:9000/posters/",
		name:"movie"};
	scene[4] = {list:"https://sage.evl.uic.edu/evl_Pictures/photos.txt",
		location:"https://sage.evl.uic.edu/evl_Pictures/",
		name:"evl"};
	console.log(present);		            	
	this.pres = present;
}

PresentationControl.prototype.setPresentation = function(presentation) {
	this.pres = presentation;
};

PresentationControl.getList = function() {

	return scene;
};

PresentationControl.getNumberOfScenes = function() {

	return this.pres.scenes.length;
};

PresentationControl.getSceneName = function(id) {
	return this.pres.scenes[id].scene;
};

PresentationControl.getScene = function(selection, path) {
	// return a set of frames
	var frame = this.pres.scenes[selection].getFrames();
	presScene = [];
	for (var i = 0; i < frame.length; i++){
		if (frame[i].source == 1){
			var imagePath = path + frame[i].image;
			console.log(path);
		} else {
			var imagePath = frame[i].image;
		}
		presScene.push(imagePath);
	}
	console.log(presScene);
	return presScene;
};

var Presentation = function (name, author, copyright, scenes){
    this.name = name;
    this.author = author;
    this.copyright = copyright;
    this.scenes = scenes;
};

Presentation.fromJson = function (json){
    var obj = JSON.parse (json);
	var frames = [];
	for (var i = 0; i < obj.scenes.length; i++){
			var scene = new Scene(obj.scenes[i].scene, obj.scenes[i].frames, obj.scenes[i].north, obj.scenes[i].east, obj.scenes[i].south, obj.scenes[i].west)
			scenes.push(scene);
			frames = [];
			for (var j = 0; j < obj.scenes[i].frames.length; j++){
					var frame = new Frame(obj.scenes[i].frames[j].image, obj.scenes[i].frames[j].source, obj.scenes[i].frames[j].video, obj.scenes[i].frames[j].width, obj.scenes[i].frames[j].hight)
					frames.push(frame);
					scene.frames = frames;
			}
	}
    
    return new Presentation (obj.name, obj.author, obj.copyright, scenes);
};


var Scene = function (scene, frames, north, east, south, west){
    this.scene = scene;
    this.frames = frames;
    this.north = north;
    this.east = east;
	this.south = south;
	this.west = west;
}

Scene.prototype.getFrames = function (){
	return this.frames;
};

var Frame = function (image, source, video, width, hight){
    this.image = image;
    this.source = source;
    this.video = video;
    this.copyright = width;
    this.hight = hight;
};

// export as AMD module / Node module / browser variable
if (typeof define === 'function' && define.amd) define(PresentationControl);
else if (typeof module !== 'undefined'){ 
	module.exports = new PresentationControl();
}
else window.PresentationControl = PresentationControl;

}());	


