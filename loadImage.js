var path    = require('path');

function loadImage(scene) {
    var path = require('path');
    path.join(__dirname, '/public/uploads/apps/usc_explorer/', 'presentation.json');
 //   var jsonObj = require();
    console.log(__dirname);
 
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
    
    for(var i=0; i<0; i++){
    	
    };
}
