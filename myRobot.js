
var canvas;
var gl;

// Three Vertices        
var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )    
];    
var base = {
    width: 5.0,
    height: 2.0,
};
var lowerArm = {
    width: 0.5,
    height: 5.0,
};
var UpperArm = {
    width: 0.5,
    height: 5.0,
}

/*---------------------------------------------------*/

/*---------------------------------------------------*/

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );    
    
    // Associate out shader variables with our data buffer
      var vPosition = gl.getAttribLocation( program, "vPosition" );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );    
      render();
};
/*---------------------------------------------------*/

/*---------------------------------------------------*/

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT ); 
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
}