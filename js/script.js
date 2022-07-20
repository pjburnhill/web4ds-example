/***
* 
* WEB4DV
* THREE.js plug-in for 4Dviews volumetric video sequences
*
* Version: 3.1.0
* Release date: October 2021
*
* Copyright: 4D View Solutions SAS
* Authors: M.Adam & T.Groubet
*
*****************************************
* INSTRUCTIONS:
*
* 1. INSTALLATION
*	1.1 Add the "web4dv" folder on your webserver
*
*	1.2 In your HTML file, add the following calls before the </body> tag, respecting this order:
*		- <script src="threejs/three.js"></script>
        - <script src="threejs/WebGL.js"></script>
*		
*	1.3 Also, create a .js file (like script.js) for creating your THREE.js scene
*       - ADD the line import WEB4DS from 'yourpath/web4dv/web4dvImporter.js'
*
*	1.4 Now you can use WEB4DV constructor in your [script.js] file, when building your scene.
*
*****************************************
* 2. USE
*	2.1 In the script where you build your own THREE.js scene, ADD the following object constructor:
		- var yourModel = new WEB4DS(stringId,stringUrlSequenceDesktop, stringUrlSequenceMobile, stringUrlSequenceAudio, arrayPosition[int x,int y,int z], sceneTHREEObject, cameraTHREEObject);
*	
*		2.1.1 Explanations:
*			stringId -> is the unique string you want to identify this specific sequence
*			stringUrlSequenceDesktop -> is the string URL to the .4ds file as DESKTOP version
*			stringUrlSequenceMobile -> is the string URL to the .4ds file as MOBILE version
*			stringUrlSequenceAudio -> is the string URL to the .wav file as AUDIO version
*			arrayPosition -> is an array of 3 int values for x, y, z positions
*			sceneTHREEObject -> the THREE.js scene object where you'd like to load your sequence
*			cameraTHREEObject -> the THREE.js camera object added to the scene (needed for the audio)
*
*	2.2 Now, ADD in your [script.js]:  yourModel.load(); or implement it on a event trigger (click, hover, ..)
*
*	NOTE: For the moment, only ONE sequence can be played at a time
*
******************************************
* 3. WEB4DV METHODS, FUNCTIONS & VARIABLES
*	3.1 METHODS
*		yourModel.load(callback) -> method that will load (start downloading .4ds file data) AND then play your sequence. You can (optional) use a callback function when loaded, like the initTimeline() in this example
*		yourModel.pause() ->
*		yourModel.play() ->
*		yourModel.mute() -> audio muting
*		yourModel.unmute() -> audio unmuting
*		yourModel.destroy() -> function that will stop 4DS model loaded, clear the meshes cache and reset the placeholder(s)
*       yourModel.keepChunksInCache(boolean) -> whether your want to cache the sequence (!! MEMORY CONSUMING !!) or live decoding
*       yourModel.isLoaded() -> boolean, return true when a sequence is loaded, false if not
*
*	3.3 VARIABLES
*		yourModel.currentFrame -> int, the actual frame number of the sequence being played
*		yourModel.sequenceTotalLength -> int, the total number of frame of the loaded sequence
*		yourModel.sequenceDecodedFrames -> int, the number of meshes currently in the buffer (ready to display)
*		yourModel.model4D -> the THREE.js object representing the mesh. See model4D_Three.js for details
*
*
******************************************
* 4. PERFORMANCES
*
*	4DS files go from 720p to 2880p texture resolution, that imply different filesize.
*
*	720p 4DS file benefit of an average of 4MB per second, which is in the 4G network speed range, and will be easily accessible by most of your viewers, even on mobile phone (ie: Android phone)
*
*	Of course, feel free to customize your code to detect network speed and point to larger 4DS file.
*
*	Finally, you should always include a Desktop url AND a Mobile url so viewer on mobile phone (Android) will have better performances.
*
***/

export var renderer;
var canvas = document.getElementById('canvas4D');
var container = canvas.parentNode;
var context;

import WEB4DS from '../web4dv/web4dvImporter.js'


// Check WebGL compatibility
if (WEBGL.isWebGL2Available())
{
    context = canvas.getContext('webgl2');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
}
else if(WEBGL.isWebGLAvailable())
{
    context = canvas.getContext('webgl');
    renderer = new THREE.WebGLRenderer();
}
else
{
    var warning = WEBGL.getWebGLErrorMessage();
    container.appendChild( warning );
}

// Set Scene
var scene = new THREE.Scene();

// Set Models
var gridHelper = new THREE.GridHelper( 10, 10, new THREE.Color("rgb(234, 58, 135)"), new THREE.Color("rgb(118, 129, 173)") );
scene.add( gridHelper );

// Set Camera
var camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 100);
camera.position.set(0, 2, 5);
var controls = new THREE.OrbitControls(camera, container);
controls.target = new THREE.Vector3(0, 0, 0);
scene.add(camera);

// Set Lights
var light = new THREE.DirectionalLight(0x777799, 2);
light.position.set(0, 1, 1).normalize();
scene.add(light);

var light2 = new THREE.DirectionalLight(0x776655, 2);
light2.position.set(0, -1, -1).normalize();
scene.add(light2);

var lightA = new THREE.AmbientLight( 0x505050 );
scene.add( lightA );

// Set Renderer dimensions & append to HTML
renderer.setSize(container.offsetWidth, container.offsetHeight);
document.body.appendChild(renderer.domElement);


/************************
* START 4Dviews' WEB4DV *
************************/
// 4Dviews: Constructor(s)
const sequences4D = []
let current4DSequence = null;

let model4DS01 = new WEB4DS('business', 'https://dev.fourdviews.com/ltd/business_man_-_speech_2_-_take_2_15_00fps_FILTERED_DESKTOP_720.4ds',
							'https://dev.fourdviews.com/ltd/business_man_-_speech_2_-_take_2_15_00fps_FILTERED_MOBILE_720.4ds',
							'https://dev.fourdviews.com/ltd/business_man_-_speech_2_-_take_2.mp3',
							[0, 0, 0], renderer, scene, camera)
let model4DS02 = new WEB4DS('basket', 'https://www.4dviews.com/model/basket/basket-solo_10sec_20FPS_DESKTOP_720.4ds',
							'https://www.4dviews.com/model/basket/basket-solo_10sec_20FPS_MOBILE_720.4ds',
							'', [2, 0, 1], renderer, scene, camera)

sequences4D.push(model4DS01)
sequences4D.push(model4DS02)

sequences4D[0].load(true, false)
current4DSequence = sequences4D[0]
//current4DSequence.keepsChunksInCache(true)

/**********************
* END 4Dviews' WEB4DV *
**********************/


/*****************************************
* EXAMPLE 4Dviews' WEB4DV function calls *
*****************************************/

var buttonLoad = document.getElementById('btnLoad');
    buttonLoad.addEventListener('click', function(){
		sequences4D[0].destroy( function() {
			sequences4D[0].load(true, true);
		});
		current4DSequence = sequences4D[0]
    });
var buttonDestroy = document.getElementById('btnDestroy');
    buttonDestroy.addEventListener('click', function(){
		sequences4D[0].destroy();
		current4DSequence = null
		clearTimeline();
    });
var buttonDestroyLoad = document.getElementById('btnDestroyLoad');
    buttonDestroyLoad.addEventListener('click', function(){
		sequences4D[0].destroy();
		clearTimeline();
		sequences4D[1].load(true, true);
		current4DSequence = sequences4D[1]

    });
var buttonPause = document.getElementById('btnPause');
    buttonPause.addEventListener('click', function(){
		if (current4DSequence !== null) current4DSequence.pause();
    });
var buttonPlay = document.getElementById('btnPlay');
    buttonPlay.addEventListener('click', function(){
		if (current4DSequence) current4DSequence.play(true);
    });
var buttonMute = document.getElementById('btnMute');
    buttonMute.addEventListener('click', function(){
		if (current4DSequence) current4DSequence.mute();
    });
var buttonUnmute = document.getElementById('btnUnmute');
    buttonUnmute.addEventListener('click', function(){
		if (current4DSequence) current4DSequence.unmute();
    });

var buttonsCacheOption = document.getElementsByName("cacheOption");
    var previousValue = null;
    for(var i = 0; i < buttonsCacheOption.length; i++) {
        buttonsCacheOption[i].addEventListener('click', function(){
            
			(previousValue) ? console.log("storing"): null;
			
			if(previousValue !== null)
				var prevResult = previousValue.value;
			
            if(this !== previousValue) {
                previousValue = this;
            }
			
			var newResult = this.value;
			
			if (newResult === "cacheLive") {
				if (current4DSequence) current4DSequence.keepsChunksInCache(false)
			} else if(newResult === "cacheStore"){
				if (current4DSequence) {
					current4DSequence.destroy()
					current4DSequence.keepsChunksInCache(true)
					current4DSequence.load(true, false)
				}
			} 
        });
    }

var framePlayedContainer = document.getElementById("framePlayed");
var frameTotalContainer = document.getElementById("frameTotal");
var frameDecodedContainer = document.getElementById("frameDecoded");
//var networkSpeedContainer = document.getElementById("networkSpeed");
var timeline4D = document.getElementById("timeline4D");

function drawTimeline(){
	
	// Constructor variables
	var context = timeline4D.getContext("2d");
	var windowWidth = window.innerWidth;
	timeline4D.width = windowWidth;
	timeline4D.height = 32;
	
	// Decoded meshes vairables
	var blocWidth = Math.ceil(1.1 * (windowWidth / current4DSequence.sequenceTotalLength));
	var blocHeight = 32; // timeline css height, pixels
	
	// Draw cached sub timeline
	// For each frame number store in frameDecodedContainer, add a fillRect
	for (var i = 0; i <= current4DSequence.sequenceDecodedFrames ; i++) {
		
		var blocXPercent = current4DSequence.currentFrame / current4DSequence.sequenceTotalLength;
		var blocXPixel = windowWidth * blocXPercent;
		
		// Fill with gradient
		context.beginPath();
		context.fillStyle = '#f177ad';
		context.fillRect(blocXPixel,0,blocWidth,blocHeight);	
		context.closePath();
	}
	
	// Draw timeline
//	if(isPlaying === true) {
	var widthPlayedPercent = ((current4DSequence.sequenceFramePlaying + 1) / current4DSequence.sequenceTotalLength); // +1 because frame number start at 0, width on first frame would be 0 that we don't want
		var widthPlayedPixel = windowWidth * widthPlayedPercent;

		context.beginPath();
		context.fillStyle = '#f00';
		context.fillRect(0,0,widthPlayedPixel,blocHeight);	
		context.closePath();
//	}
}

function clearTimeline(){
	var context = timeline4D.getContext("2d");	
	context.clearRect(0,0,window.innerWidth,32);
}

function updateSequenceInfos() {
	framePlayedContainer.innerHTML = current4DSequence.currentFrame;
	frameTotalContainer.innerHTML = current4DSequence.sequenceTotalLength;
	frameDecodedContainer.innerHTML = current4DSequence.sequenceDecodedFrames;
		
	var decodedTimelineWidth = ((current4DSequence.sequenceFramePlaying / current4DSequence.sequenceTotalLength) * 100);
}

function resizingWindow(){
	camera.aspect = container.offsetWidth / container.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.offsetWidth, container.offsetHeight);
}
window.addEventListener("resize", resizingWindow);
resizingWindow();


//function testSpeed(){
//	networkSpeedContainer.innerHTML = (speedKbps + " kbps");
//}
//testSpeed();


var hitTestSource = null
var hitTestSourceRequested = false
var renderAR = false;
var controller;
var cube;
var reticle;

renderer.xr.addEventListener( 'sessionstart', function ( event ) {
	renderAR = true;

	reticle = new THREE.Mesh(
					new THREE.RingBufferGeometry( 0.06, 0.10, 32 ).rotateX( - Math.PI / 2 ),
					new THREE.MeshBasicMaterial()
				);
	reticle.visible = false;
	reticle.matrixAutoUpdate = false;
	scene.add(reticle);
	gridHelper.visible = false;
	
	if (current4DSequence != null && current4DSequence.isLoaded) {
		current4DSequence.destroy()
		console.log('sequence detruite')
		if ( current4DSequence.isLoaded)
			console.log('mais toujours loaded!!!')

		current4DSequence = null
	}

	function onSelect() {
		if ( reticle.visible ) {
			if (current4DSequence == null){
				sequences4D[0].destroy( function() {
					sequences4D[0].load(false, true, setPosition);
				});
				current4DSequence = sequences4D[0]
				console.log('passe ici')
			}
			
			if (!current4DSequence.isLoaded){
				current4DSequence.load(false, true, setPosition)
				console.log('passe la')
			}else {
				setPosition()
				console.log('passe la aussi')
			}
		}
	}
	
	function setPosition() {
			var mesh4D = current4DSequence.model4D.mesh // scene.getObjectByName('mesh4D');
			mesh4D.position.setFromMatrixPosition( reticle.matrix );
			mesh4D.scale.x = 0.15;
			mesh4D.scale.y = 0.15;
			mesh4D.scale.z = 0.15;

	}
	
	controller = renderer.xr.getController(0);
	controller.addEventListener( 'select', onSelect );
    scene.add(controller);

	
} );


renderer.xr.addEventListener( 'sessionend', function ( event ) {
	if (current4DSequence.isLoaded) {
		current4DSequence.destroy();
		scene.remove(reticle);
		gridHelper.visible = true;
	}
	renderAR = false;
} );


/********************************
* THREE JS Standard Render Loop *
********************************/
// Rendering the scene at 60 FPS
function animate() {
    renderer.setAnimationLoop( function (timestamp, frame) {

		if (renderAR && frame) {
			var referenceSpace = renderer.xr.getReferenceSpace();
			var session = renderer.xr.getSession();

			if (hitTestSourceRequested === false) {
				session.requestReferenceSpace('viewer').then(function (referenceSpace) {
					session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
						hitTestSource = source;
					});
				});
				session.addEventListener('end', function () {
					hitTestSourceRequested = false;
					hitTestSource = null;
				});
				hitTestSourceRequested = true;
			}

			if (hitTestSource) {

				var hitTestResults = frame.getHitTestResults(hitTestSource);
				if (hitTestResults.length) {
					var hit = hitTestResults[0];
					reticle.visible = true;
					reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

				} else {
					reticle.visible = false;
				}
			}
		}
		else{
			/************************************************
			* EXAMPLE 4Dviews' WEB4DV function calls in Loop *
			*************************************************/
			if (current4DSequence && current4DSequence.isLoaded === true) {
				updateSequenceInfos();
				drawTimeline();
			}
		}		
		renderer.render(scene, camera);



	} );
	//setTimeout(function() {
		//requestAnimationFrame( animate );	
	//}, 1000 / 60);
    
	//renderer.render( scene, camera );

}

animate();
