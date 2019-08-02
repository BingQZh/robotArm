
var canvas;
var gl;
var vertexCount = 36;
var program;
// Three Vertices        
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];
var vertexColor = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.1, 0.7, 0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];
var theta = [0, 0, 0];
var modelViewMatrix = mat4();
var modelViewMatrixLoc;
var projectionMatrix = ortho(-10,10,-10,10,-10,10);
var vBuffer;
var cBuffer;
var bBuffer;
var vPosition;
/*-----------PROPERTIES------------------------------*/   
var baseP = {
    width: 5.0,
    height: 2.0,
    id:0,
};
var lowerArmP = {
    width: 0.5,
    height: 5.0,
    id: 1,
};
var upperArmP = {
    width: 0.5,
    height: 5.0,
    id:2,
}
var slider = {
    body: 0,
    lowerArm: 0,
    upperArm: 0,
}
var figure = [];
var stack = [];
var points = [];
var colors = [];
/*---------------------------------------------------*/
function quad(  a,  b,  c,  d ) {
    colors.push(vertexColor[a]);
    points.push(vertices[a]);
    colors.push(vertexColor[a]);
    points.push(vertices[b]);
    colors.push(vertexColor[a]);
    points.push(vertices[c]);
    colors.push(vertexColor[a]);
    points.push(vertices[a]);
    colors.push(vertexColor[a]);
    points.push(vertices[c]);
    colors.push(vertexColor[a]);
    points.push(vertices[d]);
}
function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

/*------------RECURSIVE RENDERING--------------------*/
/*From lecture notes #21 */
function createNode(transform, render, sibling, child){
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}
for(var i=0; i<3;i++)
    figure[i] = createNode(null,null,null,null);

function initNode(id){
    var m = mat4();
    switch(id){
        case baseP.id:
            m = rotate(theta[baseP.id], 0, 1, 0);
            figure[base.id]=createNode(m, base, null, lowerArmP.id);
            break;
        case lowerArmP.id:
            m = translate(0.0, baseP.height, 0.0);
            m = mult(m, rotate(theta[lowerArmP.id],0,0,1));
            figure[lowerArmP.id]=createNode(m, lowerArm, null, upperArmP.id);
            break;
        case upperArm.id:
            m = translate(0.0, lowerArmP.height, 0.0);
            m = mult(m, rotate(theta[upperArmP.id],0,0,1));
            figure[upperArmP.id]=createNode(m, upperArm, null, null);
            break;
    }
}
function traverse(id){
    if(id == null)
        return;

    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[id].transform);
    figure[id].render();

    if(figure[id].child != null)
        traverse(figure[id].child);

    modelViewMatrix = stack.pop();

    if(figure[id].sibling != null)
        traverse(figure[id].sibling);
}
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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    colorCube();
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );    
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );   

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor ); 

    document.getElementById("sliderBody").onchange = function(event) {
        // theta[baseId] = event.target.value;
        slider.body=event.target.value;
                // initNodes(baseId);
    };
    document.getElementById("sliderLower").onchange = function(event) {
         // theta[lowerArmId] = event.target.value;
                 // initNodes(lowerArmId);
         slider.lowerArm=event.target.value;
    };
    document.getElementById("sliderUpper").onchange = function(event) {
         // theta[upperArmId] =  event.target.value;
                 // initNodes(upperArmId);
         slider.upperArm=event.target.value;
    };

    for(var i=0; i<3;i++)
        initNode(i);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    render();
};
/*---------------------------------------------------*/
function base() {
    var s = scalem(baseP.width, baseP.height, baseP.width);
    var instanceMatrix = mult( translate( 0.0, 0.5 * baseP.height, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, vertexCount );
}
function lowerArm()
{
    var s = scalem(lowerArmP.width, lowerArmP.height, lowerArmP.width);
    var instanceMatrix = mult( translate( 0.0, 0.5 * lowerArmP.height, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, vertexCount );
}
function upperArm() {
    var s = scalem(upperArmP.width, upperArmP.height, upperArmP.width);
    var instanceMatrix = mult(translate( 0.0, 0.5 * upperArmP.height, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, vertexCount );
}
/*---------------------------------------------------*/

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(modelViewMatrix) );
    traverse(baseP.id); 

    requestAnimFrame(render);
}