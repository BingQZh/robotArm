var canvas, gl, program;

var points = [];
var colors = [];
var displancement = 1;

var colorTmp = {
  black: vec4( 0.0, 0.0, 0.0, 0.7 ),
  white: vec4( 0.1, 0.7, 0, 0.7 ),
  blue: vec4( 0.0, 0.0, 1.0, 0.7 ),
  yellow: vec4( 1.0, 1.0, 0.0, 0.7 ),
  green: vec4( 0.0, 1.0, 0.0, 0.7 ),
  red: vec4( 1.0, 0.0, 0.0, 0.7 ),
  magenta: vec4( 1.0, 0.0, 1.0, 0.7 ),
  cyan: vec4( 0.0, 1.0, 1.0, 0.7 ),
  purple: vec4(0.5, 0, 0.5, 0.7 ),
  orange: vec4(1.0, 0.5, 0.0, 0.8),
};

var vertexColors = [
  colorTmp.black,
  //initial color
  colorTmp.purple,
  //--------
  colorTmp.blue,
  colorTmp.red,
  colorTmp.orange,
  colorTmp.green,
  colorTmp.cyan,
  colorTmp.white,

];

//Arm parameters
var baseP = {
  width: 3.0,
  height: 1.0,
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
var ballP = {
  if: false, //if ball exists (only onclick)
  radius: 0.2,
  center: [],
  colors: [],
  vertices: [vec4(1,1,0,1.0),

  vec4(1,2,0,1.0),
  vec4(1.2,1.98,0,1.0),
  vec4(1.4,1.917,0,1.0),
  vec4(1.6,1.8,0,1.0),
  vec4(1.8,1.6,0,1.0),
  vec4(2,1,0,1.0),

  vec4(1.8,0.4,0,1.0),
  vec4(1.6,0.2,0,1.0),
  vec4(1.4,0.083,0,1.0),
  vec4(1.2,0.02,0,1.0),
  vec4(1,0,0,1.0),

  vec4(0.8,0.02,0,1.0),
  vec4(0.6,0.083,0,1.0),
  vec4(0.4,0.2,0,1.0),
  vec4(0.2,0.4,0,1.0),
  vec4(0,1,0,1.0),

  vec4(0.2,1.6,0,1.0),
  vec4(0.4,1.8,0,1.0),
  vec4(0.6,1.917,0,1.0),
  vec4(0.8,1.98,0,1.0),
  vec4(1,2,0,1.0),],
}


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
var vertexCount = 36;

var modelViewMatrix=mat4();
var ballmodelViewMatrix= mat4();
var projectionMatrix;

var vBuffer, cBuffer,vPosition; //Arm buffer
var modelViewMatrixLoc;
var projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);

var bBuffer, vPositionB, cBufferB, vColorB; //ball buffers
var modelViewMatrixBall = mat4();

var theta= [ 0, 0, 0];
var thetaTmp = {
  base:0.0,
  lowerArm:0.0,
  upperArm:0.0,
}

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
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
var figure= [];
var stack= [];

function createNode(transform, render, sibling, child) {
        var node={
            transform: transform,
            render: render,
            sibling: sibling,
            child: child
        }

        return node;
}

for(var i=0; i<3;i++){
    figure[i]= createNode(null,null,null,null);
}

function initNodes(id){
    var m=mat4();
    switch(id){
        case baseP.id:
            m=rotate(theta[baseP.id],0,1,0);
            figure[baseP.id]=createNode(m,base,null,lowerArmP.id)
            break;

        case lowerArmP.id:
            m = translate(0.0, baseP.height, 0.0);
            m = mult(m, rotate(theta[lowerArmP.id], 0, 0, 1 ));
            figure[lowerArmP.id]=createNode(m,lowerArm,null,upperArmP.id)
            break;

        case upperArmP.id:
            m=translate(0.0, lowerArmP.height, 0.0);
            m=mult(m, rotate(theta[upperArmP.id], 0, 0, 1) );
            figure[upperArmP.id]=createNode(m,upperArm,null,null);
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



/*---------------------------------------------------*/

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.9, 0.9, 0.1, 0.4 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    bBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ballP.vertices), gl.STATIC_DRAW );

    vPositionB = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPositionB, 2, gl.FLOAT, false, 0, 0);

    for (var k =0; k<ballP.vertices.length;k++)
      ballP.colors.push(colorTmp.red);
    
    cBufferB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferB );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ballP.colors), gl.STATIC_DRAW );

    document.getElementById("sliderBody").onchange = function() {
        thetaTmp.base = event.target.value;
    };
    document.getElementById("sliderLower").onchange = function() {
        thetaTmp.lowerArm = event.target.value;
    };
    document.getElementById("sliderUpper").onchange = function() {
         thetaTmp.upperArm = event.target.value;
    };
    canvas.addEventListener("click", ball,false);

    for(var i=0; i<3;i++){
      initNodes(i);
    }
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    render();
}
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
modelViewMatrixBall = mult(scalem(0.35,0.35,1),mat4())


/*---------------------------------------------------*/
var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(modelViewMatrix) );

    traverse(baseP.id);

    if(ballP.if){//if ball exists
      console.log("drawball");

      drawBall();

      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(ballP.vertices), gl.STATIC_DRAW );

      gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
      gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
      gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"),  false, flatten(modelViewMatrixBall) );
      gl.drawArrays(gl.TRIANGLE_FAN, 0, ballP.vertices.length);
    }
    else
      updateAnimation();

    requestAnimFrame(render);
}
function updateAnimation(){
    if(theta[baseP.id]>thetaTmp.base)
      theta[baseP.id]-=displancement;
    else if(theta[baseP.id]<thetaTmp.base)
      theta[baseP.id]+=displancement;
    initNodes(baseP.id);

    if(theta[lowerArmP.id]>thetaTmp.lowerArm)
      theta[lowerArmP.id]-=displancement;
    else if(theta[lowerArmP.id]<thetaTmp.lowerArm)
      theta[lowerArmP.id]+=displancement;
    initNodes(lowerArmP.id);

    if(theta[upperArmP.id]>thetaTmp.upperArm)
      theta[upperArmP.id]-=displancement;
    else if(theta[upperArmP.id]<thetaTmp.upperArm)
      theta[upperArmP.id]+=displancement; 
    initNodes(upperArmP.id);
}
function drawBall(){
      //console.log("BALL EXISIT");
      if (thetaL<0 && thetaU<0){
        if(theta[lowerArmP.id]>=thetaL){
          theta[lowerArmP.id]-=1;
          initNodes(lowerArmP.id);
        }
        if(theta[upperArmP.id]>=thetaU){
          theta[upperArmP.id]-=1;
          initNodes(upperArmP.id);
        }
        if(theta[upperArmP.id]<=thetaU && (theta[lowerArmP.id]<=thetaL)){
          ballP.if=false;
          thetaTmp.base=0;
          thetaTmp.lowerArm=0;
          thetaTmp.upperArm=0;

        }
      }
      else if (thetaL>0 && thetaU<0){
        if(theta[lowerArmP.id]<=thetaL){
          theta[lowerArmP.id]+=1;
          initNodes(lowerArmP.id);
        }
        if(theta[upperArmP.id]>=thetaU){
          theta[upperArmP.id]-=1;
          initNodes(upperArmP.id);
        }
        if(theta[upperArmP.id]<=thetaU && (theta[lowerArmP.id]>=thetaL)){
          ballP.if=false;
          thetaTmp.base=0;
          thetaTmp.lowerArm=0;
          thetaTmp.upperArm=0;
        }
      }

      else if (thetaL<0 && thetaU>0){
        if(theta[lowerArmP.id]>=thetaL){
          theta[lowerArmP.id]-=1;
          initNodes(lowerArmP.id);
        }
        if(theta[upperArmP.id]<=thetaU){
          theta[upperArmP.id]+=1;
          initNodes(upperArmP.id);
        }
        if(theta[upperArmP.id]>=thetaU && (theta[lowerArmP.id]<=thetaL)){
          ballP.if=false;
          thetaTmp.base=0;
          thetaTmp.lowerArm=0;
          thetaTmp.upperArm=0;
        }
      }

      else if (thetaL>0 && thetaU>0){
        if(theta[lowerArmP.id]<=thetaL){
          theta[lowerArmP.id]+=1;
          initNodes(lowerArmP.id);
        }
        if(theta[upperArmP.id]<=thetaU){
          theta[upperArmP.id]+=1;
          initNodes(upperArmP.id);
        }
        if(theta[upperArmP.id]>=thetaU && (theta[lowerArmP.id]>=thetaL)){
          ballP.if=false;
          thetaTmp.base=0;
          thetaTmp.lowerArm=0;
          thetaTmp.upperArm=0;
        }
      }
    }

/*------------------BALL-----------------------------*/
function resetArm(){
  document.getElementById("sliderBody").value="0";
  document.getElementById("sliderLower").value="0";
  document.getElementById("sliderUpper").value="0";
  for (var i=0; i<theta.length; i++){
    theta[i]=0;
    initNodes(i);
  }
}
function coordination(){
  var wIndex = canvas.width/2; // half of canvas width
  if(ballP.center[0]<=wIndex && ballP.center[1]<=wIndex){ //top left
    ballP.center[0]=(-10*(wIndex-ballP.center[0])/wIndex)
    ballP.center[1]=(10*(wIndex-ballP.center[1])/wIndex)
  }
  else if(ballP.center[0]<=wIndex && ballP.center[1]>wIndex){ //bottom left
    ballP.center[0]=(-10*(wIndex-ballP.center[0])/wIndex)
    ballP.center[1]=(10*(wIndex-ballP.center[1])/wIndex)
  }
  else if(ballP.center[0]>wIndex && ballP.center[1]<=wIndex){ //top right
    ballP.center[0]=(10*(ballP.center[0]-wIndex)/wIndex)
    ballP.center[1]=(10*(wIndex-ballP.center[1])/wIndex)
  }
  else if(ballP.center[0]>wIndex && ballP.center[1]>wIndex){ //bottom right
    ballP.center[0]=(10*(ballP.center[0]-wIndex)/wIndex)
    ballP.center[1]=(10*(wIndex-ballP.center[1])/wIndex)

  }
}
//get ball location and update theta[]
function ball(){
  //console.log(event.clientX+","+event.clientY);
  ballP.if = true;
  var rect = canvas.getBoundingClientRect();
  ballP.center = [event.clientX-rect.left, event.clientY-rect.top];
  modelViewMatrixBall = mult(scalem(0.35,0.35,1),mat4())
  coordination();
  //IK calculations-----------------------
  var xe= ballP.center[0]+0.4;
  var ye= ballP.center[1]-1.45;
  var lower= lowerArmP.height;
  var upper= upperArmP.height;
  var thetaTmp= Math.acos((xe/(Math.sqrt((Math.pow(xe,2))+(Math.pow(ye,2))))));
  resetArm();

  thetaL=((thetaTmp-(Math.acos(((Math.pow(lower,2))+(Math.pow(xe,2))+(Math.pow(ye,2))-(Math.pow(upper,2)))/(2*lower*Math.sqrt((Math.pow(xe,2))+(Math.pow(ye,2)))))))*(180/Math.PI))-90;
  thetaU=(Math.PI-(Math.acos(((Math.pow(lower,2))+(Math.pow(upper,2))-(Math.pow(xe,2))-(Math.pow(ye,2)))/(2*lower*upper))))*(180/Math.PI);

  if(ye<0){
    ye=-(ballP.center[1]-1.45);
    xe=-(ballP.center[0]+0.4);
    thetaTmp= Math.acos((xe/(Math.sqrt((Math.pow(xe,2))+(Math.pow(ye,2))))));
    thetaL=180+(((thetaTmp-(Math.acos(((Math.pow(lower,2))+(Math.pow(xe,2))+(Math.pow(ye,2))-(Math.pow(upper,2)))/(2*lower*Math.sqrt((Math.pow(xe,2))+(Math.pow(ye,2)))))))*(180/Math.PI))-90);
    thetaU=(Math.PI-(Math.acos(((Math.pow(lower,2))+(Math.pow(upper,2))-(Math.pow(xe,2))-(Math.pow(ye,2)))/(2*lower*upper))))*(180/Math.PI);
  }
  //console.log("theta",thetaL, thetaU);
  modelViewMatrixBall= mult(translate(ballP.center[0],ballP.center[1],1),modelViewMatrixBall)
}
/*---------------------------------------------------*/


