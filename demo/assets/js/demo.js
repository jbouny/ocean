var DEMO =
{
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Controls: null,
	ms_IsDisplaying: false,
	ms_Terrain: null,
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
	
	Initialize: function( inIdCanvas, inParameters )
	{
		this.ms_Canvas = $( '#'+inIdCanvas );
		
		// Initialize Renderer, Camera and Scene
		this.ms_Renderer = this.Enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html( this.ms_Renderer.domElement );
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera( 55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 30000 );
		this.ms_Camera.position.set( inParameters.width / 2, Math.max( inParameters.width, inParameters.height ) / 1.5, -inParameters.height / 1.5 );
		this.ms_Camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
		
		// Initialize Orbit control		
		this.ms_Controls = new THREE.OrbitControls( this.ms_Camera, this.ms_Renderer.domElement );
	
		// Add light
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.3 );
		directionalLight.position.set( 500, 700, 750 );
		this.ms_Scene.add( directionalLight );
		
		// Create terrain
		this.Load( inParameters );
		
		// Load textures
		var noiseTexture = new THREE.ImageUtils.loadTexture( 'images/cloud.png' );
		noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
		
		// Create the water effect
		this.ms_Water = new THREE.Water( this.ms_Renderer, this.ms_Camera, {
			clipBias: 0.0, 
			textureWidth: 1024, textureHeight: 1024, 
			color: 0x555555, 
			baseTexture: THREE.ImageUtils.loadTexture("images/water.jpg"),
			baseSpeed: 1.15,
			noiseTexture: new THREE.ImageUtils.loadTexture( 'images/cloud.png' ),
			noiseScale: 0.2,
			alpha: 	1.0,
			time: 	0.0,
		} );
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneGeometry( inParameters.width * 2, inParameters.height * 2, 50, 50 ), 
			this.ms_Water.material
		);
		aMeshMirror.add( this.ms_Water );
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		aMeshMirror.position.y = - inParameters.depth * 0.2;
		this.ms_Scene.add( aMeshMirror );
	
		/*
		var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		this.ms_Scene.add(skyBox);
		*/
	},
	
	Load: function( inParameters )
	{
		var terrainGeo = TERRAINGEN.Get( inParameters );
		var terrainMaterial = new THREE.MeshPhongMaterial( { vertexColors: THREE.VertexColors, shading: THREE.FlatShading } );
		
		var terrain = new THREE.Mesh( terrainGeo, terrainMaterial );
		terrain.position.y = - inParameters.depth / 2;
		if( this.ms_Terrain != null )
			this.ms_Scene.remove( this.ms_Terrain );
		this.ms_Scene.add( terrain );
		this.ms_Terrain = terrain;
		this.ms_Terrain.castShadow = true;
		this.ms_Terrain.receiveShadow = true;
	},
	
	Display: function()
	{
		this.ms_Water.render();
		this.ms_Renderer.render( this.ms_Scene, this.ms_Camera );
	},
	
	Update: function()
	{
		this.ms_Water.material.uniforms.time.value += 0.013;
		this.ms_Controls.update();
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