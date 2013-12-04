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
		width: 2000,
		height: 2000,
		widthSegments: 200,
		heightSegments: 200,
		depth: 2000,
		param: 4,
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