function MainLoop()
{
	requestAnimationFrame( MainLoop );
	DEMO.Update();
}

$( function() {
	WINDOW.Initialize();
	
	DEMO.Initialize( 'canvas-3d' );
	
	WINDOW.ResizeCallback = function( inWidth, inHeight ) { DEMO.Resize( inWidth, inHeight ); };
	DEMO.Resize( WINDOW.ms_Width, WINDOW.ms_Height );
	
	MainLoop();
} );