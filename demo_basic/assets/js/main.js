function mainLoop() {
    requestAnimationFrame(mainLoop);
    DEMO.update();
}

$(function() {
	WINDOW.initialize();
	
	DEMO.initialize('canvas-3d');
	
	WINDOW.resizeCallback = function(inWidth, inHeight) { DEMO.resize(inWidth, inHeight); };
	DEMO.resize(WINDOW.ms_Width, WINDOW.ms_Height);

    mainLoop();
});