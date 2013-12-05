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
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1,
		filter: [ CIRCLE_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ]
	};
	
	DEMO.Initialize( 'canvas-3d', parameters );
	
	WINDOW.ResizeCallback = function( inWidth, inHeight ) { DEMO.Resize( inWidth, inHeight ); };
	DEMO.Resize( WINDOW.ms_Width, WINDOW.ms_Height );
	
	MainLoop();
} );