// SAGE2 is available for use under the SAGE2 Software License
//
// University of Illinois at Chicago's Electronic Visualization Laboratory (EVL)
// and University of Hawai'i at Manoa's Laboratory for Advanced Visualization and
// Applications (LAVA)
//
// See full text, terms and conditions in the LICENSE.txt included file
//
// Copyright (c) 2014

////////////////////////////////////////
// simple photo slideshow
// Written by Andy Johnson - 2014
////////////////////////////////////////

/* global d3, PresentationControl
	SAGE2_photoAlbumLoadTimer,
	SAGE2_photoAlbumFadeCount,
	SAGE2_photoAlbumCanvasBackground,
	presentationScene
*/

var usc_explorer = SAGE2_App.extend({
	construct: function() {
		arguments.callee.superClass.construct.call(this);

		this.resizeEvents = "continuous"; //onfinish
		this.svg = null;

		// Need to set this to true in order to tell SAGE2 that you will be needing widget controls for this app
		this.enableControls = true;

		this.canvasBackground = "green";

		this.loadTimer = 15; // default value to be replaced from photo_scrapbooks.js
		this.fadeCount = 10.0; // default value to be replaced from photo_scrapbooks.js

		this.presentationScene = [];
		this.imageSet = [];
		this.sound = "";
		this.images = [];
	    
		// load timer is how long to show a single image in seconds before loading 
		// the next one or refreshing the current one
	    SAGE2_photoAlbumLoadTimer = 20;

		// fade count is how many frames it takes to fade between the old and new image
	    SAGE2_photoAlbumFadeCount = 1
	    
		if (SAGE2_photoAlbumLoadTimer !== null) {
			this.loadTimer = SAGE2_photoAlbumLoadTimer;
		}

		if (SAGE2_photoAlbumFadeCount !== null) {
			this.fadeCount = SAGE2_photoAlbumFadeCount;
		}

		if (this.fadeCount == 0) {
			this.fadeCount = 1; // avoid divide by zero later on
		}

		this.today = "";
		this.timeDiff = 0;

		this.bigList = null;
		this.audio = null;

		this.okToDraw = this.fadeCount;
		this.forcegreenraw = 1;

		this.fileName = "";
		this.listFileName = "";

		this.appName = "usc_explorer:";

		this.updateCounter = 0;

		this.listFileNamePhotos = "";
		this.listFileNameLibrary = "";

		this.state.imageSet = null;
		this.state.counter = 1;

	},

	////////////////////////////////////////
	// choose a specific image library from those loaded to cycle through

	chooseImagery: function(selection) {
		this.imageSet = PresentationControl.getScene(selection, this.resrcPath);
		this.sound = PresentationControl.getSceneSound(selection, this.resrcPath);
	},

	////////////////////////////////////////

	initApp: function() {
		this.listFileCallbackFunc        = this.listFileCallback.bind(this);
		this.imageLoadCallbackFunc       = this.imageLoadCallback.bind(this);
		this.imageLoadFailedCallbackFunc = this.imageLoadFailedCallback.bind(this);


		this.chooseImagery(0);
		this.loadInList();
	},

	////////////////////////////////////////

	imageLoadCallback: function() {
		// can be used for fading
		
	//	this.imageTemp = this.image2; // hold onto 2
	//	this.image2 = this.image1; // image2 is the previous image (needed for fading)

		this.okToDraw = this.fadeCount;
	//	this.image1 = this.image3; // image1 is now the new image
	//	this.image3 = this.imageTemp;
		// console.log(this.appName + "imageLoadCallback");
	},

	imageLoadFailedCallback: function() {
		console.log(this.appName + "image load failed on " + this.fileName);
		this.update();
	},

	////////////////////////////////////////
	// send the list of images in the current image library to all of the client nodes

	listFileCallback: function(error, data) {
		this.broadcast("listFileCallbackNode", {error: error, data: data});
	},

	listFileCallbackNode: function(data) {
		var error = data.error;
		var localData = data.data;

		if (error) {
			console.log(this.appName + "listFileCallback - error" + error);
			return;
		}

		if (localData === null) {
			console.log(this.appName + "list of photos is empty");
			return;
		}

		// load scene's image list
		this.bigList = d3.csv.parse(localData);
	//	console.log(localData);
		console.log(this.appName + "loaded in list of " + this.bigList.length + " images");

		this.update();
		this.drawEverything();
		
	},
		
	////////////////////////////////////////
	//play music

	playSound: function () {
		if (this.audio != null){
			this.audio.pause();
    		this.audio.currentTime = 0.0;
		}
		this.audio = new Audio(this.sound);
		this.audio.play();
	},
	
	
	////////////////////////////////////////
	// draw a sceve from presentation

	drawEverything: function () {
		if ((this.okToDraw >= -this.fadeCount) || (this.forcegreenraw > 0)) {
			//this.svg.selectAll("*").remove();

			this.forcegreenraw = 0;
			
			var newWidth  = this.canvasWidth;
			var newHeight = this.canvasHeight;

			this.svg.select("#baserect")
				.attr("height", newHeight)
				.attr("width", newWidth);
			
			var width = 0;
			for (var i = 0; i < this.imageSet.length; i++){
				
				if (this.images[i] != "NULL") {
					
					this.svg.select("#image" + i)
						.attr("xlink:href", this.images[i].src)
						.attr("x",  width)
						.attr("y",  0)
						.attr("preserveAspectRatio", "none")
						.attr("width",  this.canvasWidth/this.imageSet[i].width)
						.attr("height", '100%');
				}
				width += this.canvasWidth/this.imageSet[i].width;
			}

			this.okToDraw -= 1.0;
		}


		// if enough time has passed grab a new image and display it
	//	if (isMaster) {
	//		this.updateCounter += 1;
	//		if (this.updateCounter > (this.loadTimer * this.maxFPS)) {
	//			this.update();
	//		}
//		}
	},

	////////////////////////////////////////
	// the master loads ths list of images for the current scene

	loadInList: function() {
		if (isMaster) {
			this.playSound();
			
			this.images = [];
			this.svg.selectAll("*").remove(); // clean svg
			this.svg.append("svg:rect")
					.style("stroke", this.canvasBackground)
					.style("fill", this.canvasBackground)
					.style("fill-opacity", 1.0)
					.attr("x",  0)
					.attr("y",  0)
					.attr("id", "baserect")
					.attr("width",  this.canvasWidth)
					.attr("height", '100%');
			
			for (var i = 0; i < this.imageSet.length; i++){
				var image = new Image();
				this.images.push(image);
				image.onload  = this.imageLoadCallbackFunc;
				image.onerror = this.imageLoadFailedCallbackFunc;
				image.id = "image" + i;
				
			//	console.log(image);
				
				image.src = this.imageSet[i].image;

				this.svg.append("svg:image")
					.attr("opacity", 1)
					.attr("x",  0)
					.attr("y",  0)
					.attr("id", image.id)
			}
		}
	},

	// move to the next scene
	nextAlbum: function() {
		this.listFileCallbackFunc        = this.listFileCallback.bind(this);
		this.imageLoadCallbackFunc       = this.imageLoadCallback.bind(this);
		this.imageLoadFailedCallbackFunc = this.imageLoadFailedCallback.bind(this);
		
		this.state.imageSet += 1;
		if (this.state.imageSet >= this.scenesNumber) {
			this.state.imageSet = 0;
		}
		this.chooseImagery(this.state.imageSet);
		this.loadInList();
	},

	// choose a particular scene
	setAlbum: function (albumNumber) {

		this.state.imageSet = +albumNumber -1;
		this.chooseImagery(this.state.imageSet);
		this.loadInList();
	},

	////////////////////////////////////////
	// update tries to load in a new image (set in the newImage function)
	// this image may be a completely new image (from a file)
	// or a more recent version of the same image from a webcam

	update: function() {
		if (isMaster) {
			// console.log(this.appName + "UPDATE");

			// reset the timer counting towards the next image swap
			this.updateCounter = 0;


			// if there is no big list of images to pick from then get out
			if (this.bigList === null) {
				console.log(this.appName + "list of photos not populated yet");
				return;
			}

			// if there is no image name for that nth image then get out
			if (this.bigList[this.state.counter] === null) {
				console.log(this.appName + "cant find filename of image number " + this.state.counter);
				return;
			}

			// escape makes a string url-compatible
			// except for ()s, commas, &s, and odd characters like umlauts and graves

			// this also appends a random number to the end of the request to avoid browser caching
			// in case this is a single image repeatedly loaded from a webcam

			// ideally this random number should come from the master to guarantee identical values across clients
			
		//	console.log(PresentationControl.pres.scenes[this.state.counter].frames[0].image);
			
			 //var path1 = this.resrcPath + 'park.jpg';
			this.fileName = this.listFileNameLibrary + escape(this.bigList[this.state.counter].name);
		//	console.log(this.fileName);
			this.broadcast("updateNode", {data: this.fileName});
		}
	},

	updateNode: function(data) {

		this.fileName = data.data;

		if (this.fileName === null) {
			console.log(this.appName + "no filename of new photo to load");
			return;
		}
	},

	////////////////////////////////////////
	// if the window gets reshaped then update my drawing area

	updateWindow: function () {
		this.canvasWidth  = this.element.clientWidth;
		this.canvasHeight = this.element.clientHeight;

		var box = "0,0," + this.canvasWidth + "," + this.canvasHeight;

		this.svg.attr("width", this.canvasWidth)
			.attr("height", this.canvasHeight)
			.attr("viewBox", box)
			.attr("preserveAspectRatio", "none");

		this.forcegreenraw = 1;
		this.drawEverything(); // need this to keep image while scaling etc
	},

	////////////////////////////////////////

	init: function(data) {
		this.SAGE2Init("div", data);

		this.resizeEvents = "continuous"; //onfinish
		this.svg = null;

		// Need to set this to true in order to tell SAGE2 that you will be needing widget controls for this app
		this.enableControls = true;

		this.canvasBackground = "green";

		this.canvasWidth  = 2800;
		this.canvasHeight = 1600;

		this.loadTimer = 15; // default value to be replaced from photo_scrapbooks.js
		this.fadeCount = 30.0; // default value to be replaced from photo_scrapbooks.js
		var path = this.resrcPath + "Files/" + 'presentation.json';
		
		if (SAGE2_photoAlbumLoadTimer !== null) {
			this.loadTimer = SAGE2_photoAlbumLoadTimer;
		}

		if (SAGE2_photoAlbumFadeCount !== null) {
			this.fadeCount = SAGE2_photoAlbumFadeCount;
		}

		if (this.fadeCount == 0) {
			this.fadeCount = 1; // avoid divide by zero later on
		}

		this.today = "";
		this.timeDiff = 0;

		this.bigList = null;

		this.okToDraw = this.fadeCount;
		this.forcegreenraw = 1;

		this.fileName = "";
		this.listFileName = "";

		this.appName = "usc_explorer:";

		this.updateCounter = 0;

		this.listFileNamePhotos = [];
		this.listFileNameLibrary = "";

		this.maxFPS = 30.0;
		this.element.id = "div" + data.id;

		var _this = this;
	    var path = this.resrcPath + "Files/" + 'presentation.json';
	    
		PresentationControl.loadImage(path);
	    presentationScene = PresentationControl.getList();
	    
	    this.imageSet = PresentationControl.getScene(0, this.resrcPath);
	    
		// attach the SVG into the this.element node provided to us
		var box = "0,0," + this.canvasWidth + "," + this.canvasHeight;
		this.svg = d3.select(this.element).append("svg:svg")
			.attr("width",   this.canvasWidth)
			.attr("height",  '100%')
			.attr("viewBox", box)
			.attr("preserveAspectRatio", "none"); // do not change image

		// create the widgets
		console.log("creating controls");
		this.controls.addButton({type: "next", sequenceNo: 3, id: "Next"});

		// action:function(date){
		// 	// This is executed after the button click animation occurs.
		// 	this.nextAlbum();
		// }.bind(this)});
	    this.scenesNumber = PresentationControl.getNumberOfScenes();
	    
		for (var loopIdx = 0; loopIdx < this.scenesNumber; loopIdx++) {
			var loopIdxWithPrefix = loopIdx;
			
		//	console.log(PresentationControl.getSceneName(loopIdx));
			(function(loopIdxWithPrefix) {
				var albumButton = {
					textual: true,
					label: PresentationControl.getSceneName(loopIdx),
					fill: "rgba(250,250,250,1.0)",
					animation: false
				};

				_this.controls.addButton({type: albumButton, sequenceNo: 5 + loopIdx, id: loopIdxWithPrefix});/* action:function(date){
				this.setAlbum(loopIdxWithPrefix);
				}.bind(_this) });*/
			}(loopIdxWithPrefix));
		}

		this.controls.finishedAddingControls(); // Important

		this.initApp();

		this.update();
		this.draw_d3(data.date);
	},

	load: function(date) {
		// pass
	},

	draw_d3: function(date) {
		this.updateWindow();
	},

	draw: function(date) {
		this.drawEverything();
	},

	resize: function(date) {
		this.svg.attr('width',  this.element.clientWidth  + "px");
		this.svg.attr('height', this.element.clientHeight + "px");

		this.updateWindow();
		this.refresh(date);
	},

	event: function(eventType, pos, user, data, date) {
	//	console.log(data.identifier);
		if (eventType === "pointerPress" && (data.button === "left")) {
			// pass
		}
		if (eventType === "pointerMove") {
			// pass
		}
		if (eventType === "pointerRelease" && (data.button === "left")) {
			this.nextAlbum();
			this.refresh(date);
		} else if (eventType === "widgetEvent") {
			//if (data.ctrlId === "Next") {
		//		this.nextAlbum();
		//	} else {
				this.setAlbum(data.identifier);
		//	}
			this.refresh(date);
		}
	}
});
