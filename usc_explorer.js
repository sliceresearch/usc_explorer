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

/*
    presentationScene = [];
    presentationScene[0] = {list:"https://lyra.evl.uic.edu:9000/evl_Pictures/photos.txt",
            location:"https://lyra.evl.uic.edu:9000/evl_Pictures/"};
    presentationScene[1] = {list:"https://lyra.evl.uic.edu:9000/webcam2.txt",
            location:"ftp://ftp.evl.uic.edu/pub/INcoming/spiff/"};
    presentationScene[2] = {list:"https://lyra.evl.uic.edu:9000/webcam3.txt",
            location:"http://cdn.abclocal.go.com/three/wls/webcam/"};
    presentationScene[3] = {list:"https://lyra.evl.uic.edu:9000/posters/photos.txt",
            location:"https://lyra.evl.uic.edu:9000/posters/"};

    presentationScene[4] = {list:"https://sage.evl.uic.edu/evl_Pictures/photos.txt",
            location:"https://sage.evl.uic.edu/evl_Pictures/"};
*/


/* global d3, PresentationControl
	SAGE2_photoAlbumLoadTimer,
	SAGE2_photoAlbumFadeCount,
	SAGE2_photoAlbumCanvasBackground,
	presentationScene
*/

var usc_explorer = SAGE2_WebGLApp.extend({
	construct: function() {
		arguments.callee.superClass.construct.call(this);

		this.resizeEvents = "continuous"; //onfinish
		this.svg = null;

		// Need to set this to true in order to tell SAGE2 that you will be needing widget controls for this app
		this.enableControls = true;

		this.canvasBackground = "black";

		this.canvasWidth  = 800;
		this.canvasHeight = 600;

		this.loadTimer = 15; // default value to be replaced from photo_scrapbooks.js
		this.fadeCount = 10.0; // default value to be replaced from photo_scrapbooks.js

		var presentationScene = [];
	    
		// load timer is how long to show a single image in seconds before loading 
		// the next one or refreshing the current one
	    SAGE2_photoAlbumLoadTimer = 20;

		// fade count is how many frames it takes to fade between the old and new image
	    SAGE2_photoAlbumFadeCount = 20;

		// canvas background gives the color of the background of the window
	    SAGE2_photoAlbumCanvasBackground = "black";
	    
	    
		if (SAGE2_photoAlbumLoadTimer !== null) {
			this.loadTimer = SAGE2_photoAlbumLoadTimer;
		}

		if (SAGE2_photoAlbumFadeCount !== null) {
			this.fadeCount = SAGE2_photoAlbumFadeCount;
		}

		if (this.fadeCount == 0) {
			this.fadeCount = 1; // avoid divide by zero later on
		}

		if (SAGE2_photoAlbumCanvasBackground !== null) {
			this.canvasBackground = SAGE2_photoAlbumCanvasBackground;
		}

		this.URL1  = "";
		this.URL1a = "";
		this.URL1b = "";

		this.today = "";
		this.timeDiff = 0;

		this.bigList = null;

		this.okToDraw = this.fadeCount;
		this.forceRedraw = 1;

		this.fileName = "";
		this.listFileName = "";

		this.appName = "usc_explorer:";

		this.image1 = new Image();
		this.image2 = new Image();
		this.image3 = new Image();
		this.imageTemp = null;

		this.updateCounter = 0;

		this.listFileNamePhotos = "";
		this.listFileNameLibrary = "";

		this.state.imageSet = null;
		this.state.counter = 1;

	},

	////////////////////////////////////////
	// choose a specific image library from those loaded to cycle through

	chooseImagery: function(selection) {
		this.listFileNamePhotos = presentationScene[selection].list;
		this.listFileNameLibrary = presentationScene[selection].location;
	},

	////////////////////////////////////////

	initApp: function() {

		this.listFileCallbackFunc        = this.listFileCallback.bind(this);
		this.imageLoadCallbackFunc       = this.imageLoadCallback.bind(this);
		this.imageLoadFailedCallbackFunc = this.imageLoadFailedCallback.bind(this);

		this.image1.onload  = this.imageLoadCallbackFunc;
		this.image1.onerror = this.imageLoadFailedCallbackFunc;
		this.image2.onload  = this.imageLoadCallbackFunc;
		this.image2.onerror = this.imageLoadFailedCallbackFunc;
		this.image3.onload  = this.imageLoadCallbackFunc;
		this.image3.onerror = this.imageLoadFailedCallbackFunc;

		this.chooseImagery(this.state.imageSet);
		this.loadInList();
		
		
	},

	////////////////////////////////////////

	imageLoadCallback: function() {
		this.imageTemp = this.image2; // hold onto 2
		this.image2 = this.image1; // image2 is the previous image (needed for fading)

		this.okToDraw = this.fadeCount;
		this.image1 = this.image3; // image1 is now the new image
		this.image3 = this.imageTemp;
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
			console.log(this.appName + "listFileCallback - error");
			return;
		}

		if (localData === null) {
			console.log(this.appName + "list of photos is empty");
			return;
		}

		this.bigList = d3.csv.parse(localData);
		console.log(this.appName + "loaded in list of " + this.bigList.length + " images");

		this.update();
		this.drawEverything();
	},

	////////////////////////////////////////
	// blend from the current image to a new image if there is a new image to show

	drawEverything: function () {
		if ((this.okToDraw >= -this.fadeCount) || (this.forceRedraw > 0)) {
			//this.svg.selectAll("*").remove();
			this.forceRedraw = 0;

			var newWidth  = this.canvasWidth;
			var newHeight = this.canvasHeight;

			this.svg.select("#baserect")
				.attr("height", newHeight)
				.attr("width", newWidth);

			var windowRatio = this.canvasWidth / this.canvasHeight;
			var image1DrawWidth = this.canvasWidth;
			var image1DrawHeight = this.canvasHeight;
			var image2DrawWidth = this.canvasWidth;
			var image2DrawHeight = this.canvasHeight;

			if (this.image2 != "NULL") {
				// console.log("original image is " + this.image2.width + "," + this.image2.height);
				var image2x = this.image2.width;
				var image2y = this.image2.height;
				var image2ratio = image2x / image2y;

				// want wide images to be aligned to top not center
				if (image2ratio > windowRatio) {
					image2DrawWidth  =  this.canvasWidth;
					image2DrawHeight = this.canvasWidth / image2ratio;
				}

				// if (this.okToDraw > 1)
				// 	this.svg.select("#image2")
				// 	.attr("xlink:href", this.image2.src)
				// 	.attr("width",  image2DrawWidth)
				// 	.attr("height", image2DrawHeight);
				// else
				// 	this.svg.select("#image2")
				// 	.attr("xlink:href", this.image2.src)
				// 	.attr("opacity", (this.okToDraw+9) * 0.1)
				// 	.attr("width",  image2DrawWidth)
				// 	.attr("height", image2DrawHeight);
				// }
				if (this.okToDraw > 1) {
					this.svg.select("#image2")
						.attr("xlink:href", this.image2.src)
						.attr("opacity", 1)
						.attr("width", image2DrawWidth)
						.attr("height", image2DrawHeight);
				} else {
					this.svg.select("#image2")
						.attr("xlink:href", this.image2.src)
						.attr("opacity", Math.max(0.0, Math.min(1.0, (this.okToDraw + 9) / this.fadeCount)))
						.attr("width",  image2DrawWidth)
						.attr("height", image2DrawHeight);
				}
			}

			if (this.image1 != "NULL") {
				// current image
				var image1x     = this.image1.width;
				var image1y     = this.image1.height;
				var image1ratio = image1x / image1y;

				// want wide images to be aligned to top not center
				if (image1ratio > windowRatio) {
					image1DrawWidth  =  this.canvasWidth;
					image1DrawHeight = this.canvasWidth / image1ratio;
				}

				this.svg.select("#image1")
					.attr("xlink:href", this.image1.src)
					.attr("opacity", Math.max(0.0, Math.min(1.0, 1.0 - (this.okToDraw / this.fadeCount))))
					.attr("width",  image1DrawWidth)
					.attr("height", image1DrawHeight);
			}

			this.okToDraw -= 1.0;
		}


		// if enough time has passed grab a new image and display it

		if (isMaster) {
			this.updateCounter += 1;

			if (this.updateCounter > (this.loadTimer * this.maxFPS)) {
				this.update();
			}
		}
	},

	////////////////////////////////////////
	// the master loads in the text file containing ths list of images in this photo album

	loadInList: function() {
		if (isMaster) {
			this.listFileName = this.listFileNamePhotos;
			d3.text(this.listFileName, this.listFileCallbackFunc);
		}
	},

	////////////////////////////////////////
	// choose a random image from the current photo album
	// only the master should pick a new image (but right now each clients does)
	// if all the random numbers are in sync this will work - but not completely safe

	newImage: function() {
		if (this.bigList === null) {
			this.state.counter = 0;
		} else {
			this.state.counter = Math.floor(Math.random() * this.bigList.length);
		}
	},

	// move to the next photo album
	nextAlbum: function() {
		this.bigList = null;
		this.state.imageSet += 1;
		if (this.state.imageSet >= presentationScene.length) {
			this.state.imageSet = 0;
		}
		this.chooseImagery(this.state.imageSet);
		this.loadInList();
	},

	// choose a particular photo album
	setAlbum: function (albumNumber) {
		this.bigList = null;
		this.state.imageSet = +albumNumber;
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

			// randomly pick a new image to show from the current photo album
			// which can be showing the same image if the album represents a webcam

			this.newImage();

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

			this.fileName = this.listFileNameLibrary + escape(this.bigList[this.state.counter].name) +
				'?' + Math.floor(Math.random() * 10000000);

			this.broadcast("updateNode", {data: this.fileName});
		}
	},

	updateNode: function(data) {

		this.fileName = data.data;

		if (this.fileName === null) {
			console.log(this.appName + "no filename of new photo to load");
			return;
		}
		// console.log(this.appName + this.fileName);

		// ask for image3 to load in the new image

		///
		// this.imageTemp = this.image2; // hold onto 2
		// this.image2 = this.image1; // image2 is the previous image (needed for fading)

		//this.image3 = new Image(); // image3 is the new image to be loaded
		this.image3.src = this.fileName;
		// console.log(this.image1);
		// console.log(this.image2);
		// console.log(this.image3);
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
			.attr("preserveAspectRatio", "xMinYMin meet");

		this.forceRedraw = 1;
		this.drawEverything(); // need this to keep image while scaling etc
	},

	////////////////////////////////////////

	init: function(data) {
		this.SAGE2Init("div", data);

		this.resizeEvents = "continuous"; //onfinish
		this.svg = null;

		// Need to set this to true in order to tell SAGE2 that you will be needing widget controls for this app
		this.enableControls = true;

		this.canvasBackground = "black";

		this.canvasWidth  = 800;
		this.canvasHeight = 600;

		this.loadTimer = 15; // default value to be replaced from photo_scrapbooks.js
		this.fadeCount = 10.0; // default value to be replaced from photo_scrapbooks.js
		var path = this.resrcPath + 'presentation.json';
		
		if (SAGE2_photoAlbumLoadTimer !== null) {
			this.loadTimer = SAGE2_photoAlbumLoadTimer;
		}

		if (SAGE2_photoAlbumFadeCount !== null) {
			this.fadeCount = SAGE2_photoAlbumFadeCount;
		}

		if (this.fadeCount == 0) {
			this.fadeCount = 1; // avoid divide by zero later on
		}

		if (SAGE2_photoAlbumCanvasBackground !== null) {
			this.canvasBackground = SAGE2_photoAlbumCanvasBackground;
		}

		this.URL1  = "";
		this.URL1a = "";
		this.URL1b = "";

		this.today = "";
		this.timeDiff = 0;

		this.bigList = null;

		this.okToDraw = this.fadeCount;
		this.forceRedraw = 1;

		this.fileName = "";
		this.listFileName = "";

		this.appName = "usc_explorer:";

		this.image1 = new Image();
		this.image2 = new Image();
		this.image3 = new Image();
		this.imageTemp = null;

		this.updateCounter = 0;

		this.listFileNamePhotos = "";
		this.listFileNameLibrary = "";

		this.maxFPS = 30.0;
		this.element.id = "div" + data.id;

		// attach the SVG into the this.element node provided to us
		var box = "0,0," + this.canvasWidth + "," + this.canvasHeight;
		this.svg = d3.select(this.element).append("svg:svg")
			.attr("width",   data.width)
			.attr("height",  data.height)
			.attr("viewBox", box)
			.attr("preserveAspectRatio", "xMinYMin meet"); // new

		// console.log(this.imageLoadCallbackFunc);
		// console.log(this.imageLoadFailedCallbackFunc);

		this.svg.append("svg:rect")
				.style("stroke", this.canvasBackground)
				.style("fill", this.canvasBackground)
				.style("fill-opacity", 1.0)
				.attr("x",  0)
				.attr("y",  0)
				.attr("id", "baserect")
				.attr("width",  data.width)
				.attr("height", data.height);
		this.svg.append("svg:image")
				.attr("opacity", 1)
				.attr("x",  0)
				.attr("y",  0)
				.attr("id", "image2") //image1
				.attr("width",  data.width)
				.attr("height", data.height);
		this.svg.append("svg:image")
				.attr("opacity", 1)
				.attr("x",  0)
				.attr("y",  0)
				.attr("id", "image1") //image2
				.attr("width",  data.width)
				.attr("height", data.height);
		//this.svg.append("svg:image")
		//	.attr("opacity", 1)
		//	.attr("x",  0)
		//	.attr("y",  0)
		//	.attr("id", "image3")
		//	.attr("width",  data.width)
		//	.attr("height", data.height);

		// create the widgets
		console.log("creating controls");
		this.controls.addButton({type: "next", sequenceNo: 3, id: "Next"});

		// action:function(date){
		// 	// This is executed after the button click animation occurs.
		// 	this.nextAlbum();
		// }.bind(this)});

		var _this = this;
	    var path = this.resrcPath + 'presentation.json';
	    presentationScene = PresentationControl.loadImage(path);
	    
		for (var loopIdx = 0; loopIdx < presentationScene.length; loopIdx++) {
			var loopIdxWithPrefix = "0" + loopIdx;
			(function(loopIdxWithPrefix) {
				var albumButton = {
					textual: true,
					label: presentationScene[loopIdx].name,
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
			if (data.ctrlId === "Next") {
				this.nextAlbum();
			} else {
				this.setAlbum(data.ctrlId);
			}
			this.refresh(date);
		}
	}
});
