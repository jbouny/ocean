function MainLoop()
{
	requestAnimationFrame( MainLoop );
	DEMO.Update();
}

$( function() {
	WINDOW.Initialize();
	
	var parameters = {
		alea: RAND_MT,
		generator: PN_GENERATOR,
		width: 500,
		height: 500,
		widthSegments: 100,
		heightSegments: 100,
		depth: 500,
		param: 8,
		filterparam: 1,
		filter: [ CIRCLE_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ],
		canvas: document.getElementById('heightmap'),
	};
	
	DEMO.Initialize( 'canvas-3d', parameters );
	
	WINDOW.ResizeCallback = function( inWidth, inHeight ) { DEMO.Resize( inWidth, inHeight ); };
	DEMO.Resize( WINDOW.ms_Width, WINDOW.ms_Height );
	
	MainLoop();
} );