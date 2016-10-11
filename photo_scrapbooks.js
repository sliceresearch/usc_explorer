// list of photo albums to view


   // var presentationControl = require('./presentationControl.js');
   // var pControl = new presentationControl();
    presentationScene = [];
    presentationScene = presentationControl.loadImage()
    

// load timer is how long to show a single image in seconds before loading 
// the next one or refreshing the current one

    SAGE2_photoAlbumLoadTimer = 20;

// fade count is how many frames it takes to fade between the old and new image
    SAGE2_photoAlbumFadeCount = 20;

// canvas background gives the color of the background of the window
    SAGE2_photoAlbumCanvasBackground = "black";


