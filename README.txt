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