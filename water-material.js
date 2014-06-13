/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

THREE.ShaderLib['water'] = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "fog" ],
		
		{ 
			"normalSampler":	{ type: "t", value: null },
			"mirrorSampler":	{ type: "t", value: null },
			"alpha":			{ type: "f", value: 1.0 },
			"time":				{ type: "f", value: 0.0 },
			"distortionScale":	{ type: "f", value: 20.0 },
			"noiseScale":		{ type: "f", value: 1.0 },
			"textureMatrix" :	{ type: "m4", value: new THREE.Matrix4() },
			"sunColor":			{ type: "c", value: new THREE.Color(0x7F7F7F) },
			"sunDirection":		{ type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0) },
			"eye":				{ type: "v3", value: new THREE.Vector3(0, 0, 0) },
			"waterColor":		{ type: "c", value: new THREE.Color(0x555555) },
			"betaVersion":		{ type: "i", value: 0 }
		}
	] ),

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',
		'uniform float noiseScale;',
		'uniform sampler2D normalSampler;',
		'uniform int betaVersion;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
		
		'float getHeight(in vec2 uv)',
		'{',
		'	vec2 uv0 = uv / (103.0 * noiseScale) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / (107.0 * noiseScale) - vec2(time / -19.0, time / 31.0);',
		'	vec2 uv2 = uv / (vec2(8907.0, 9803.0) * noiseScale) + vec2(time / 101.0, time /  097.0);',
		'	vec2 uv3 = uv / (vec2(1091.0, 1027.0) * noiseScale) - vec2(time / 109.0, time / -113.0);',
		
		'	float v0 = texture2D(normalSampler, uv0).y;',
		'	float v1 = texture2D(normalSampler, uv1).y;',
		'	float v2 = texture2D(normalSampler, uv2).y;',
		'	float v3 = texture2D(normalSampler, uv3).y;',
		
		'	return v0 * 103.0 + v1 * 107.0 + v2 * 9000.0 + v3 * 1000.0 + 20000.0;',
		'}',
		
		'void main()',
		'{',
		'	mirrorCoord = modelMatrix * vec4(position, 1.0);',
		'	worldPosition = mirrorCoord.xyz;',
		
		'	mirrorCoord = textureMatrix * mirrorCoord;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		
		/*'	if(betaVersion > 0)', // This is just a really beta way to add movement on vertices, totally wrong, but fast to implement
		'	{',
		'		gl_Position.y += getHeight(worldPosition.xz) * 0.008;',
		'	}',*/
		'}'
	].join('\n'),

	fragmentShader: [		
		'uniform sampler2D mirrorSampler;',
		'uniform float alpha;',
		'uniform float time;',
		'uniform float distortionScale;',
		'uniform float noiseScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 eye;',
		'uniform vec3 waterColor;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
		
		'void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, in float shiny, in float spec, in float diffuse, inout vec3 diffuseColor, inout vec3 specularColor)',
		'{',
		'	vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));',
		'	float direction = max(0.0, dot(eyeDirection, reflection));',
		'	specularColor += pow(direction, shiny) * sunColor * spec;',
		'	diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * diffuse;',
		'}',
		
		'vec3 getNoise(in vec2 uv)',
		'{',
		'	vec2 uv0 = uv / (103.0 * noiseScale) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / (107.0 * noiseScale) - vec2(time / -19.0, time / 31.0);',
		'	vec2 uv2 = uv / (vec2(8907.0, 9803.0) * noiseScale) + vec2(time / 101.0, time /   97.0);',
		'	vec2 uv3 = uv / (vec2(1091.0, 1027.0) * noiseScale) - vec2(time / 109.0, time / -113.0);',
		'	vec4 noise = (texture2D(normalSampler, uv0)) +',
        '		(texture2D(normalSampler, uv1)) +',
        '		(texture2D(normalSampler, uv2)) +',
		'		(texture2D(normalSampler, uv3));',
		'	return noise.xzy * 0.5 - 1.0;',
		'}',
		
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		
		'void main()',
		'{',
		'	vec3 surfaceNormal = (getNoise(worldPosition.xz));',
		'   if( eye.y < worldPosition.y )',
		'		surfaceNormal = surfaceNormal * -1.0;',

		'	vec3 diffuseLight = vec3(0.0);',
		'	vec3 specularLight = vec3(0.0);',

		'	vec3 worldToEye = eye - worldPosition;',
		'	vec3 eyeDirection = normalize(worldToEye);',
		'	sunLight(surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight);',
		
		'	float distance = length(worldToEye);',

		'	vec2 distortion = surfaceNormal.xz * distortionScale * sqrt(distance) * 0.07;',
        '   vec3 mirrorDistord = mirrorCoord.xyz + vec3(distortion.x, distortion.y, 1.0);',
        '   vec3 reflectionSample = texture2DProj(mirrorSampler, mirrorDistord).xyz;',

		'	float theta = max(dot(eyeDirection, surfaceNormal), 0.0);',
		'	const float rf0 = 0.3;',
		'	float reflectance = 0.3 + (1.0 - 0.3) * pow((1.0 - theta), 5.0);',
		'	vec3 scatter = max(0.0, dot(surfaceNormal, eyeDirection)) * waterColor;',
		'	vec3 albedo = mix(sunColor * diffuseLight * 0.3 + scatter, (vec3(0.1) + reflectionSample * 0.9 + reflectionSample * specularLight), reflectance);',
        '   vec2 tmp = mirrorCoord.xy / mirrorCoord.z + distortion;',

        '	gl_FragColor = vec4(albedo, alpha);',
		
			THREE.ShaderChunk[ "fog_fragment" ],
		'}'
	].join('\n')

};

THREE.Water = function (renderer, camera, scene, options) {
	
	THREE.Object3D.call(this);
	this.name = 'water_' + this.id;

	function isPowerOfTwo (value) {
		return (value & (value - 1)) === 0;
	};
	function optionalParameter (value, defaultValue) {
		return value !== undefined ? value : defaultValue;
	};

	options = options || {};
	
	this.matrixNeedsUpdate = true;
	
	var width = optionalParameter(options.textureWidth, 512);
	var height = optionalParameter(options.textureHeight, 512);
	this.clipBias = optionalParameter(options.clipBias, -0.0001);
	this.alpha = optionalParameter(options.alpha, 1.0);
	this.time = optionalParameter(options.time, 0.0);
	this.normalSampler = optionalParameter(options.waterNormals, null);
	this.sunDirection = optionalParameter(options.sunDirection, new THREE.Vector3(0.70707, 0.70707, 0.0));
	this.sunColor = new THREE.Color(optionalParameter(options.sunColor, 0xffffff));
	this.waterColor = new THREE.Color(optionalParameter(options.waterColor, 0x7F7F7F));
	this.eye = optionalParameter(options.eye, new THREE.Vector3(0, 0, 0));
	this.distortionScale = optionalParameter(options.distortionScale, 20.0);
	this.noiseScale = optionalParameter(options.noiseScale, 1.0);
	this.betaVersion = optionalParameter(options.betaVersion, 0);
	this.side = optionalParameter(options.side, THREE.FrontSide);
	this.fog = optionalParameter(options.fog, false);
	
	this.renderer = renderer;
	this.scene = scene;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3(0, 0, 1);
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3(0, 0, -1);
	this.clipPlane = new THREE.Vector4();
	
	if (camera instanceof THREE.PerspectiveCamera)
		this.camera = camera;
	else  {
		this.camera = new THREE.PerspectiveCamera();
		console.log(this.name + ': camera is not a Perspective Camera!')
	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();
	
	this.texture = new THREE.WebGLRenderTarget(width, height);
	this.tempTexture = new THREE.WebGLRenderTarget(width, height);
	
	var mirrorShader = THREE.ShaderLib["water"];
	var mirrorUniforms = THREE.UniformsUtils.clone(mirrorShader.uniforms);

	this.material = new THREE.ShaderMaterial({ 
		fragmentShader: mirrorShader.fragmentShader, 
		vertexShader: mirrorShader.vertexShader, 
		uniforms: mirrorUniforms,
		transparent: true,
		side: this.side,
		fog: this.fog
	});

	this.material.uniforms.mirrorSampler.value = this.texture;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;
	this.material.uniforms.alpha.value = this.alpha;
	this.material.uniforms.time.value = this.time;
	this.material.uniforms.normalSampler.value = this.normalSampler;
	this.material.uniforms.sunColor.value = this.sunColor;
	this.material.uniforms.waterColor.value = this.waterColor;
	this.material.uniforms.sunDirection.value = this.sunDirection;
	this.material.uniforms.distortionScale.value = this.distortionScale;
	this.material.uniforms.noiseScale.value = this.noiseScale;
	this.material.uniforms.betaVersion.value = this.betaVersion;
	
	this.material.uniforms.eye.value = this.eye;
	
	if (!isPowerOfTwo(width) || !isPowerOfTwo(height)) 
	{
		this.texture.generateMipmaps = false;
		this.tempTexture.generateMipmaps = false;
	}

	this.updateTextureMatrix();
	this.render();
};

THREE.Water.prototype = Object.create(THREE.Object3D.prototype);

THREE.Water.prototype.renderWithMirror = function (otherMirror) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var tempCamera = otherMirror.camera;
	otherMirror.camera = this.mirrorCamera;

	// render the other mirror in temp texture
	otherMirror.renderTemp();
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	// restore material and camera of other mirror
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
	otherMirror.camera = tempCamera;

	// restore texture matrix of other mirror
	otherMirror.updateTextureMatrix();
};

THREE.Water.prototype.updateTextureMatrix = function () {

	function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld);
	this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

	this.rotationMatrix.extractRotation(this.matrixWorld);

	if( this.mirrorWorldPosition.y > this.cameraWorldPosition.y ) {
		this.normal.set(0, 0, -1);
	}
	else {
		this.normal.set(0, 0, 1);
	}
	this.normal.applyMatrix4(this.rotationMatrix);

	var view = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition);
	view.reflect(this.normal).negate();
	view.add(this.mirrorWorldPosition);

	this.rotationMatrix.extractRotation(this.camera.matrixWorld);

	this.lookAtPosition.set(0, 0, -1);
	this.lookAtPosition.applyMatrix4(this.rotationMatrix);
	this.lookAtPosition.add(this.cameraWorldPosition);

	var target = this.mirrorWorldPosition.clone().sub(this.lookAtPosition);
	target.reflect(this.normal).negate();
	target.add(this.mirrorWorldPosition);

	this.up.set(0, -1, 0);
	this.up.applyMatrix4(this.rotationMatrix);
	this.up.reflect(this.normal).negate();

	this.mirrorCamera.position.copy(view);
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt(target);
	this.mirrorCamera.aspect = this.camera.aspect;

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

	// Update the texture matrix
	this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0);
	this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
	this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
	this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

	this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = (sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
	q.y = (sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
	q.z = -1.0;
	q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[2] = c.x;
	projectionMatrix.elements[6] = c.y;
	projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[14] = c.w;
	
	var worldCoordinates = new THREE.Vector3();
	worldCoordinates.setFromMatrixPosition(this.camera.matrixWorld);
	this.eye = worldCoordinates;
	this.material.uniforms.eye.value = this.eye;
};

THREE.Water.prototype.render = function () {

	if(this.matrixNeedsUpdate)
		this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	if(this.scene !== undefined && this.scene instanceof THREE.Scene)
	{
        this.renderer.render(this.scene, this.mirrorCamera, this.texture, true);
	}

};

THREE.Water.prototype.renderTemp = function () {

	if(this.matrixNeedsUpdate)
		this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	if(this.scene !== undefined && this.scene instanceof THREE.Scene)
	{
		this.renderer.render(this.scene, this.mirrorCamera, this.tempTexture, true);
	}

};