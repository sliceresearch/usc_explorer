(function () { 'use strict';
var scenes = [], p_frames = [], clips = [];
// constructor
var PresentationControl = function() {
	
}

PresentationControl.loadImage = function (path) {
    var scene = [];
    
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
            
    // load presentation.json
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 || xhr.status === 0 ) {
				var jsonObject = JSON.parse( xhr.responseText );

				scenes = jsonObject.scenes;
				p_frames = jsonObject.frames;
				clips = jsonObject.clips;	
				var pres = Presentation.fromJson (xhr.responseText);
				console.log(pres);

			}
		}
	};

	xhr.open( "GET", path, true );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );
	
    return scene;
}

var Presentation = function (name, author, copyright, scenes){
    this.name = name;
    this.author = author;
    this.copyright = copyright;
    this.scenes = [];
    this.scenes = scenes;
};

Presentation.fromJson = function (json){
    var obj = JSON.parse (json);
    var json = JSON.stringify(obj.scenes);
	var scenes = [];
	var frames = [];	
	for (var i = 0; i < obj.scenes.length; i++){
			var scene = new Scene(obj.scenes[i].scene, obj.scenes[i].frames, obj.scenes[i].north, obj.scenes[i].east, obj.scenes[i].south, obj.scenes[i].west)
			scenes.push(scene);
			for (var j = 0; j < obj.scenes[i].frames.length; j++){
					var frame = new Frame(obj.scenes[i].frames[j].image, obj.scenes[i].frames[j].video, obj.scenes[i].frames[j].width, obj.scenes[i].frames[j].hight)
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
};

var Frame = function (image, video, width, hight){
    this.image = image;
    this.video = video;
    this.copyright = width;
    this.hight = hight;
};

// export as AMD module / Node module / browser variable
if (typeof define === 'function' && define.amd) define(PresentationControl);
else if (typeof module !== 'undefined') module.exports = new PresentationControl();
else window.PresentationControl = PresentationControl;

}());	


