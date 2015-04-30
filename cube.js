// Vars
var cube_canvas; // Canvas object
var full_cube = new Array(54); // Position of all 54 stickers in the cube
var corners   = new Array(24); // Position of all 24 corner stickers in the cube
var edges     = new Array(24); // Position of all 24 edge stickers in the cube

// Constants
/*var F_COLOR = '#00FF00';
var U_COLOR = '#FFFFFF';
var B_COLOR = '#0000FF';
var R_COLOR = '#FF0000';
var L_COLOR = '#FF9900';
var D_COLOR = '#FFFF00';*/

var F_COLOR = '#FFFFFF';
var U_COLOR = '#00FF00';
var B_COLOR = '#FFFF00';
var R_COLOR = '#FF9900';
var L_COLOR = '#FF0000';
var D_COLOR = '#0000FF';

var CORNERS = 0;
var EDGES = 1;

// Speffz
var A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13, O=14, P=15, Q=16, R=17, S=18, T=19, U=20, V=21, W=22, X=23, Z=-1;

var corners_to_full = [0, 6, 8, 2, 9,  15, 17, 11, 18, 24, 26, 20, 27, 33, 35, 29, 36, 42, 44, 38, 45, 51, 53, 47]; // Mapping of corners array to full cube
var edges_to_full   = [3, 7, 5, 1, 12, 16, 14, 10, 21, 25, 23, 19, 30, 34, 32, 28, 39, 43, 41, 37, 48, 52, 50, 46]; // Mapping of edges array to full cube

// Edge and corner cubies
// Sticker in position 0,0 of cubie arrays represents the buffer
var corner_cubies  = [[A,E,R],[B,Q,N],[C,M,J],[D,I,F],[U,G,L],[V,K,P],[W,O,T],[X,S,H]];
var solved_corners = [true, true, true, true, true, true, true, true];
var corner_cycles  = [];
var cw_corners     = [];
var ccw_corners    = [];
var edge_cubies    = [[U,K],[A,Q],[B,M],[C,I],[D,E],[R,H],[T,N],[L,F],[J,P],[V,O],[W,S],[X,G]];
var solved_edges   = [true, true, true, true, true, true, true, true, true, true, true, true];
var edge_cycles    = [];
var flipped_edges  = [];

// Definitions of available permutations
var permutations = {
    "U"  : {0:[B,C,D,A,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,M,N,Z,Z,Z,Z,Z,Z], 1:[B,C,D,A,Q,Z,Z,Z,E,Z,Z,Z,I,Z,Z,Z,M,Z,Z,Z,Z,Z,Z,Z]},
    "U'" : {0:[D,A,B,C,I,J,Z,Z,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,Z,Z,Z,Z], 1:[D,A,B,C,I,Z,Z,Z,M,Z,Z,Z,Q,Z,Z,Z,E,Z,Z,Z,Z,Z,Z,Z]},
    "U2" : {0:[C,D,A,B,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,Z,Z,Z,Z], 1:[C,D,A,B,M,Z,Z,Z,Q,Z,Z,Z,E,Z,Z,Z,I,Z,Z,Z,Z,Z,Z,Z]},
    "F"  : {0:[Z,Z,P,M,Z,C,D,Z,J,K,L,I,V,Z,Z,U,Z,Z,Z,Z,F,G,Z,Z], 1:[Z,Z,P,Z,Z,C,Z,Z,J,K,L,I,Z,Z,Z,U,Z,Z,Z,Z,F,Z,Z,Z]},
    "F'" : {0:[Z,Z,F,G,Z,U,V,Z,L,I,J,K,D,Z,Z,C,Z,Z,Z,Z,P,M,Z,Z], 1:[Z,Z,F,Z,Z,U,Z,Z,L,I,J,K,Z,Z,Z,C,Z,Z,Z,Z,P,Z,Z,Z]},
    "F2" : {0:[Z,Z,U,V,Z,P,M,Z,K,L,I,J,G,Z,Z,F,Z,Z,Z,Z,C,D,Z,Z], 1:[Z,Z,U,Z,Z,P,Z,Z,K,L,I,J,Z,Z,Z,F,Z,Z,Z,Z,C,Z,Z,Z]},
    "R"  : {0:[Z,T,Q,Z,Z,Z,Z,Z,Z,B,C,Z,N,O,P,M,W,Z,Z,V,Z,J,K,Z], 1:[Z,T,Z,Z,Z,Z,Z,Z,Z,B,Z,Z,N,O,P,M,Z,Z,Z,V,Z,J,Z,Z]},
    "R'" : {0:[Z,J,K,Z,Z,Z,Z,Z,Z,V,W,Z,P,M,N,O,C,Z,Z,B,Z,T,Q,Z], 1:[Z,J,Z,Z,Z,Z,Z,Z,Z,V,Z,Z,P,M,N,O,Z,Z,Z,B,Z,T,Z,Z]},
    "R2" : {0:[Z,V,W,Z,Z,Z,Z,Z,Z,T,Q,Z,O,P,M,N,K,Z,Z,J,Z,B,C,Z], 1:[Z,V,Z,Z,Z,Z,Z,Z,Z,T,Z,Z,O,P,M,N,Z,Z,Z,J,Z,B,Z,Z]},
    "L"  : {0:[I,Z,Z,L,F,G,H,E,U,Z,Z,X,Z,Z,Z,Z,Z,D,A,Z,S,Z,Z,R], 1:[Z,Z,Z,L,F,G,H,E,Z,Z,Z,X,Z,Z,Z,Z,Z,D,Z,Z,Z,Z,Z,R]},
    "L'" : {0:[S,Z,Z,R,H,E,F,G,A,Z,Z,D,Z,Z,Z,Z,Z,X,U,Z,I,Z,Z,L], 1:[Z,Z,Z,R,H,E,F,G,Z,Z,Z,D,Z,Z,Z,Z,Z,X,Z,Z,Z,Z,Z,L]},
    "L2" : {0:[U,Z,Z,X,G,H,E,F,S,Z,Z,R,Z,Z,Z,Z,Z,L,I,Z,A,Z,Z,D], 1:[Z,Z,Z,X,G,H,E,F,Z,Z,Z,R,Z,Z,Z,Z,Z,L,Z,Z,Z,Z,Z,D]},
    "B"  : {0:[H,E,Z,Z,X,Z,Z,W,Z,Z,Z,Z,Z,A,B,Z,R,S,T,Q,Z,Z,N,O], 1:[H,Z,Z,Z,Z,Z,Z,W,Z,Z,Z,Z,Z,A,Z,Z,R,S,T,Q,Z,Z,N,Z]},
    "B'" : {0:[N,O,Z,Z,B,Z,Z,A,Z,Z,Z,Z,Z,W,X,Z,T,Q,R,S,Z,Z,H,E], 1:[N,Z,Z,Z,Z,Z,Z,A,Z,Z,Z,Z,Z,W,Z,Z,T,Q,R,S,Z,Z,H,Z]},
    "B2" : {0:[W,X,Z,Z,O,Z,Z,N,Z,Z,Z,Z,Z,H,E,Z,S,T,Q,R,Z,Z,A,B], 1:[W,Z,Z,Z,Z,Z,Z,N,Z,Z,Z,Z,Z,H,Z,Z,S,T,Q,R,Z,Z,A,Z]},
    "D"  : {0:[Z,Z,Z,Z,Z,Z,K,L,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,V,W,X,U], 1:[Z,Z,Z,Z,Z,Z,K,Z,Z,Z,O,Z,Z,Z,S,Z,Z,Z,G,Z,V,W,X,U]},
    "D'" : {0:[Z,Z,Z,Z,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,Z,Z,O,P,X,U,V,W], 1:[Z,Z,Z,Z,Z,Z,S,Z,Z,Z,G,Z,Z,Z,K,Z,Z,Z,O,Z,X,U,V,W]},
    "D2" : {0:[Z,Z,Z,Z,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,W,X,U,V], 1:[Z,Z,Z,Z,Z,Z,O,Z,Z,Z,S,Z,Z,Z,G,Z,Z,Z,K,Z,W,X,U,V]}
};

// Inits the canvas
function initCube() {
    cube_canvas = document.getElementById('cube_canvas').getContext('2d');

    // Full cube is initialized
    for (var i=0; i<54; i++ ){
        full_cube[i] = 0;
    }

    // Center stickers are initialized in the solved position
    full_cube[4]  = 0;
    full_cube[13] = 4;
    full_cube[22] = 8;
    full_cube[31] = 12;
    full_cube[40] = 16;
    full_cube[49] = 20;

    // Corners and edges are initialized in solved position
    resetCube();

    // Cube is rendered
    renderCube();
}

// Sets cube to solved position
function resetCube(){
    // Corners and edges are initialized in solved position
    for (var i=0; i<24; i++ ){
        corners[i] = i;
        edges[i]   = i;
    }
}

// Renders cube in current position
function renderCube(){
    // full_cube array is constructed based on corners and edges
    for (var i=0; i<24; i++ ){
        full_cube[corners_to_full[i]] = corners[i];
        full_cube[edges_to_full[i]]   = edges[i];
    }

    // Position in full_cube array
    var sticker_position = 0;

    // Starting position
    var x = 10;
    var y = 70;

    // U Face
    x += 150;
    y -= 60;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30) - (j*20), y + (j*20));
            cube_canvas.lineTo(x + 30 + (i*30) - (j*20), y + (j*20));
            cube_canvas.lineTo(x + 10 + (i*30) - (j*20), y + 20 + (j*20));
            cube_canvas.lineTo(x - 20 + (i*30) - (j*20), y + 20 + (j*20));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // L Face
    x -= 150;
    y += 60;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // F Face
    x += 90;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // R Face
    x += 90;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*20), y - (i*20) + (j*30));
            cube_canvas.lineTo(x + 20 + (i*20), y - 20 - (i*20) + (j*30));
            cube_canvas.lineTo(x + 20 + (i*20), y + 10 - (i*20) + (j*30));
            cube_canvas.lineTo(x + (i*20), y + 30 - (i*20) + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // B Face
    y -= 60;
    x += 60
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // D Face
    y += 150;
    x -= 150;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }
}

// Perform a permutation on the cube
function permute ( permutation ){
    var exchanges = [Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z];
    // Corners are permuted
    var perm = permutations[permutation][CORNERS];
    for (var i=0; i<24; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = corners[i];
        }
    }
    for (var i=0; i<24; i++){
        if ( exchanges[i] != Z ){
            corners[i] = exchanges[i];
        }
    }

    // Edges are permuted
    exchanges = [Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z];
    perm = permutations[permutation][EDGES];
    for (var i=0; i<24; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = edges[i];
        }
    }
    for (var i=0; i<24; i++){
        if ( exchanges[i] != Z ){
            edges[i] = exchanges[i];
        }
    }
}

// Returns sticker color of the received position
function getColorFromSpeffz(position){
    var color = U_COLOR
    if ( position < 4 ){
        color = U_COLOR;
    }
    else if ( position < 8 ) {
        color = L_COLOR;
    }
    else if ( position < 12 ) {
        color = F_COLOR;
    }
    else if ( position < 16 ) {
        color = R_COLOR;
    }
    else if ( position < 20 ) {
        color = B_COLOR;
    }
    else {
        color = D_COLOR;
    }
    return color;
}

// Applies scramble to the cube
function scrambleCube(permutations){
    resetCube();

    for (var i=0; i<permutations.length; i++ ){
        permute(permutations[i]);
    }

    // Corners and edges are set as unsolved
    for (var i=0; i<8; i++){
        solved_corners[i] = false;
    }
    for (var i=0; i<12; i++){
        solved_edges[i] = false;
    }
}

// Finds a BLD solution for the scramble
function solveScramble(scramble){
    scrambleCube(scramble);

    solveCorners();
    solveEdges();
}

// Solves all 8 corners in the cube
// Ignores miss-oriented corners
function solveCorners(){
    corner_cycles = [];
    cw_corners    = [];
    ccw_corners   = [];
    while ( !cornersSolved() ){
        cycleCornerBuffer();
    }
}

// Replaces the corner buffer with another corner
function cycleCornerBuffer(){
    var corner_cycled = false;

    // If the buffer is solved, replace it with an unsolved corner
    if ( solved_corners[0] ){
        // First unsolved corner is selected
        for (var i=1; i<8 && !corner_cycled; i++){
            if ( !solved_corners[i] ){
                // Buffer is placed in a... um... buffer
                var temp_corner = [corners[corner_cubies[0][0]], corners[corner_cubies[0][1]], corners[corner_cubies[0][2]]];

                // Buffer corner is replaced with corner
                corners[corner_cubies[0][0]] = corners[corner_cubies[i][0]];
                corners[corner_cubies[0][1]] = corners[corner_cubies[i][1]];
                corners[corner_cubies[0][2]] = corners[corner_cubies[i][2]];

                // Corner is replaced with buffer
                corners[corner_cubies[i][0]] = temp_corner[0];
                corners[corner_cubies[i][1]] = temp_corner[1];
                corners[corner_cubies[i][2]] = temp_corner[2];

                // Corner cycle is inserted into solution array
                corner_cycles.push( corner_cubies[i][0] );
                corner_cycled = true;
            }
        }
    }
    // If the buffer is not solved, swap it to the position where the corner belongs
    else {
        for (var i=0; i<8 && !corner_cycled; i++){
            for (var j=0; j<3 && !corner_cycled; j++){
                if ( corners[corner_cubies[0][0]] == corner_cubies[i][j%3] && corners[corner_cubies[0][1]] == corner_cubies[i][(j+1)%3] && corners[corner_cubies[0][2]] == corner_cubies[i][(j+2)%3] ){
                    // Buffer corner is replaced with corner
                    corners[corner_cubies[0][0]] = corners[corner_cubies[i][j%3]];
                    corners[corner_cubies[0][1]] = corners[corner_cubies[i][(j+1)%3]];
                    corners[corner_cubies[0][2]] = corners[corner_cubies[i][(j+2)%3]];

                    // Corner is solved
                    corners[corner_cubies[i][0]] = corner_cubies[i][0];
                    corners[corner_cubies[i][1]] = corner_cubies[i][1];
                    corners[corner_cubies[i][2]] = corner_cubies[i][2];

                    // Corner cycle is inserted into solution array
                    corner_cycles.push( corner_cubies[i][j%3] );
                    corner_cycled = true;
                }
            }
        }
    }
}

// Checks if all 8 corners are already solved
function cornersSolved (){
    var corners_solved = true;

    // Check if corners marked as unsolved haven't been solved yet
    for (var i=0; i<8; i++){
        if ( i==0 || !solved_corners[i] ){
            // Corner is solved and oriented
            if ( corners[corner_cubies[i][0]] == corner_cubies[i][0] && corners[corner_cubies[i][1]] == corner_cubies[i][1] && corners[corner_cubies[i][2]] == corner_cubies[i][2] ) {
                solved_corners[i] = true;
            }
            // Corner is in correct position but needs to be rotated clockwise
            else if ( corners[corner_cubies[i][0]] == corner_cubies[i][1] && corners[corner_cubies[i][1]] == corner_cubies[i][2] && corners[corner_cubies[i][2]] == corner_cubies[i][0] ){
                solved_corners[i] = true;
                if ( i != 0 ){
                    cw_corners.push(corner_cubies[i][0]);
                }
            }
            // Corner is in correct position but needs to be rotated counter-clockwise
            else if ( corners[corner_cubies[i][0]] == corner_cubies[i][2] && corners[corner_cubies[i][1]] == corner_cubies[i][0] && corners[corner_cubies[i][2]] == corner_cubies[i][1] ){
                solved_corners[i] = true;
                if ( i != 0 ){
                    ccw_corners.push(corner_cubies[i][0]);
                }
            }
            else {
                // Found at least one unsolved corner
                solved_corners[i] = false;
                corners_solved = false;
            }
        }
    }

    return corners_solved;
}

// Solves all 12 edges in the cube
function solveEdges(){
    edge_cycles = [];
    flipped_edges = [];

    // Parity is solved by swapping UL and UB
    if ( corner_cycles.length%2 == 1 ){
        var UB = -1;
        var UL = -1;

        // Positions of UB and UL edges are found
        for (var i=0; i<12 && (UB == -1 || UL == -1); i++){
            if ( (edges[edge_cubies[i][0]] == A && edges[edge_cubies[i][1]] == Q) || (edges[edge_cubies[i][1]] == A && edges[edge_cubies[i][0]] == Q) ){
                UB = i;
            }
            if ( (edges[edge_cubies[i][0]] == D && edges[edge_cubies[i][1]] == E) || (edges[edge_cubies[i][1]] == D && edges[edge_cubies[i][0]] == E) ){
                UL = i;
            }
        }

        // UB is stored in buffer
        var temp_edge = [edges[edge_cubies[UB][0]],edges[edge_cubies[UB][1]]];

        // Make sure that A goes to D and Q goes to E
        var index = 0;
        if ( (edges[edge_cubies[UB][0]] == A && edges[edge_cubies[UL][0]] == E) || (edges[edge_cubies[UB][0]] == Q && edges[edge_cubies[UL][0]] == D) ){
            index = 1;
        }

        // UL is placed in UB
        edges[edge_cubies[UB][0]] = edges[edge_cubies[UL][index]];
        edges[edge_cubies[UB][1]] = edges[edge_cubies[UL][(index+1)%2]];

        // buffer is placed in UL
        edges[edge_cubies[UL][0]] = temp_edge[index];
        edges[edge_cubies[UL][1]] = temp_edge[(index+1)%2];
    }

    while ( !edgesSolved() ){
        cycleEdgeBuffer();
    }
}

// Replaces the edge buffer with another edge
function cycleEdgeBuffer(){
    var edge_cycled = false;

    // If the buffer is solved, replace it with an unsolved edge
    if ( solved_edges[0] ){
        // First unsolved edge is selected
        for (var i=1; i<12 && !edge_cycled; i++){
            if ( !solved_edges[i] ){
                // Buffer is placed in a... um... buffer
                var temp_edge = [edges[edge_cubies[0][0]], edges[edge_cubies[0][1]]];

                // Buffer edge is replaced with edge
                edges[edge_cubies[0][0]] = edges[edge_cubies[i][0]];
                edges[edge_cubies[0][1]] = edges[edge_cubies[i][1]];

                // Edge is replaced with buffer
                edges[edge_cubies[i][0]] = temp_edge[0];
                edges[edge_cubies[i][1]] = temp_edge[1];

                // Edge cycle is inserted into solution array
                edge_cycles.push( edge_cubies[i][0] );
                edge_cycled = true;
            }
        }
    }
    // If the buffer is not solved, swap it to the position where the edge belongs
    else {
        for (var i=0; i<12 && !edge_cycled; i++){
            for (var j=0; j<2 && !edge_cycled; j++){
                if ( edges[edge_cubies[0][0]] == edge_cubies[i][j%2] && edges[edge_cubies[0][1]] == edge_cubies[i][(j+1)%2] ){
                    // Buffer edge is replaced with edge
                    edges[edge_cubies[0][0]] = edges[edge_cubies[i][j%2]];
                    edges[edge_cubies[0][1]] = edges[edge_cubies[i][(j+1)%2]];

                    // Edge is solved
                    edges[edge_cubies[i][0]] = edge_cubies[i][0];
                    edges[edge_cubies[i][1]] = edge_cubies[i][1];

                    // Edge cycle is inserted into solution array
                    edge_cycles.push( edge_cubies[i][j%2] );
                    edge_cycled = true;
                }
            }
        }
    }
}

// Checks if all 12 edges are already solved
// Ignores orientation
function edgesSolved (){
    var edges_solved = true;

    // Check if corners marked as unsolved haven't been solved yet
    for (var i=0; i<12; i++){
        if ( i==0 || !solved_edges[i] ){
            // Edge is solved in correct orientation
            if ( edges[edge_cubies[i][0]] == edge_cubies[i][0] && edges[edge_cubies[i][1]] == edge_cubies[i][1] ) {
                solved_edges[i] = true;
            }
            // Edge is solved but miss-oriented
            else if ( edges[edge_cubies[i][0]] == edge_cubies[i][1] && edges[edge_cubies[i][1]] == edge_cubies[i][0] ){
                solved_edges[i] = true;
                if (i != 0){
                    flipped_edges.push(edge_cubies[i][0]);
                }
            }
            else {
                // Found at least one unsolved edge
                solved_edges[i] = false;
                edges_solved = false;
            }
        }
    }

    return edges_solved;
}

$( document ).ready(initCube);