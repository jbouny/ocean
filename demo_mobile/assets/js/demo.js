var DEMO =
{
	ms_Deg2rad: Math.PI / 180,
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_CameraContainer: null,
	ms_Scene: null, 
	ms_Controls: null,
	ms_Water: null,
	
	Enable: ( function() 
	{
        try 
		{
			var aCanvas = document.createElement( 'canvas' ); 
			return !! window.WebGLRenderingContext && ( aCanvas.getContext( 'webgl' ) || aCanvas.getContext( 'experimental-webgl' ) ); 
		} 
		catch( e ) { return false; } 
	} )(),
	
	Initialize: function( inIdCanvas )
	{
		this.ms_Canvas = $( '#'+inIdCanvas );
		
		// Initialize Renderer, Camera and Scene
		this.ms_Renderer = this.Enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html( this.ms_Renderer.domElement );
		this.ms_Scene = new THREE.Scene();
		
		this.ms_CameraContainer = new THREE.Object3D();
		this.ms_CameraContainer.rotation.order = "ZYX";
		this.ms_CameraContainer.position.set( 0, 15, 0 );
		this.ms_CameraContainer.lookAt( new THREE.Vector3( 0, 15, 1 ) );
		
		this.ms_Camera = new THREE.PerspectiveCamera( 55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000 );
		this.ms_CameraContainer.add( this.ms_Camera );
		this.ms_Scene.add( this.ms_CameraContainer );
	
		// Add light
		var directionalLight = new THREE.DirectionalLight( 0xffff55, 1 );
		directionalLight.position.set( -400, 100, -500 );
		this.ms_Scene.add( directionalLight );
		
		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture( '../assets/img/waternormals.jpg' );
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		
		// Create the water effect
		this.ms_Water = new THREE.Water( this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512, 
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			betaVersion: 1
		} );
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneGeometry( 1500, 1500, 20, 20 ), 
			this.ms_Water.material
		);
		aMeshMirror.add( this.ms_Water );
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		
		this.ms_Scene.add( aMeshMirror );
	
		this.LoadSkyBox();
		
		//window.addEventListener( 'orientationchange', this.SetScreenOrientation, false );
		window.addEventListener( 'deviceorientation', this.UpdateDeviceOrientation, false );
	},
	
	UpdateDeviceOrientation: function( e )
	{
		if( e.alpha != null || e.beta != null || e.gamma != null )
		{
			//$('#orientation').html('alpha: ' + e.alpha + '<br/>beta: ' + e.beta + '<br />gamma: ' + e.gamma);
			DEMO.ms_CameraContainer.rotation.set(
				!e.beta  ? 0 : e.beta * DEMO.ms_Deg2rad - 90 * DEMO.ms_Deg2rad,
				!e.alpha ? 0 : e.alpha * DEMO.ms_Deg2rad,
				!e.gamma ? 0 : e.gamma * DEMO.ms_Deg2rad
			);
		}
	},
	
	SetScreenOrientation: function( e ) 
	{
		DEMO.ms_Camera.rotation.set( 0, 0, - e.orientation * DEMO.ms_Deg2rad );
    },
	
	LoadSkyBox: function()
	{	
		
		var cubeMap = new THREE.Texture( [] );
		cubeMap.format = THREE.RGBFormat;
		cubeMap.flipY = false;

		var loader = new THREE.ImageLoader();
		loader.load( 'assets/img/skybox_s.jpg', function ( image ) {

			var getSide = function ( x, y ) {
				var size = 512;

				var canvas = document.createElement( 'canvas' );
				canvas.width = size;
				canvas.height = size;

				var context = canvas.getContext( '2d' );
				context.drawImage( image, - x * size, - y * size );

				return canvas;
			};

			cubeMap.image[ 0 ] = getSide( 2, 1 ); // px
			cubeMap.image[ 1 ] = getSide( 0, 1 ); // nx
			cubeMap.image[ 2 ] = getSide( 1, 0 ); // py
			cubeMap.image[ 3 ] = getSide( 1, 2 ); // ny
			cubeMap.image[ 4 ] = getSide( 1, 1 ); // pz
			cubeMap.image[ 5 ] = getSide( 3, 1 ); // nz
			cubeMap.needsUpdate = true;
		} );

		var cubeShader = THREE.ShaderLib['cube'];
		cubeShader.uniforms['tCube'].value = cubeMap;

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: cubeShader.fragmentShader,
			vertexShader: cubeShader.vertexShader,
			uniforms: cubeShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});
		
		var skyBox = new THREE.Mesh(
			new THREE.CubeGeometry( 100000, 100000, 100000 ),
			skyBoxMaterial
		);
		this.ms_Scene.add( skyBox );
	},
	
	Display: function()
	{
		this.ms_Water.render();
		this.ms_Renderer.render( this.ms_Scene, this.ms_Camera );
	},
	
	Update: function()
	{
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.Display();
	},
	
	Resize: function( inWidth, inHeight )
	{
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize( inWidth, inHeight );
		this.ms_Canvas.html( this.ms_Renderer.domElement );
		this.Display();
	}
};