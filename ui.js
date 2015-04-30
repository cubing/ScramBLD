// Constants
var letter_pairs = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X"];

// Solve styles for corners and edges
var BH = 0;
var M2 = 1;
var OP = 2;
var corner_style = BH;
var edge_style   = BH;

// Binds events
function initUI(){
    $('#go').click( solveAndDisplay );
    $('#scramble').keyup( solveAndDisplay );

    // Solving style options
    $('#op-corners').click(function(){
        corner_style = OP;
        $('#op-corners').addClass('active-btn').removeClass('inactive-btn');
        $('#3style-corners').addClass('inactive-btn').removeClass('active-btn');
        solveAndDisplay();
    });
    $('#3style-corners').click(function(){
        corner_style = BH;
        $('#op-corners').addClass('inactive-btn').removeClass('active-btn');
        $('#3style-corners').addClass('active-btn').removeClass('inactive-btn');
        solveAndDisplay();
    });
    $('#m2-edges').click(function(){
        edge_style = M2;
        $('#m2-edges').addClass('active-btn').removeClass('inactive-btn');
        $('#3style-edges').addClass('inactive-btn').removeClass('active-btn');
        solveAndDisplay();
    });
    $('#3style-edges').click(function(){
        edge_style = BH;
        $('#m2-edges').addClass('inactive-btn').removeClass('active-btn');
        $('#3style-edges').addClass('active-btn').removeClass('inactive-btn');
        solveAndDisplay();
    });

    // Initialize scramble generator
    scramblers["333"].initialize(null, Math);

    // Solving style options
    $('#get-scramble').click(function(){
        $('#scramble').val(scramblers["333"].getRandomScramble().scramble_string.replace(/  /g, ' '));
        solveAndDisplay();
    });
}

// Figures out a solution for the cube and displays it
function solveAndDisplay(){
    // Scramble the cube
    var scramble_str = $('#scramble').val();
    var is_valid_scramble = true;

    var valid_permutations = ["U","U'","U2","L","L'","L2","F","F'","F2","R","R'","R2","B","B'","B2","D","D'","D2"];
    var scramble = scramble_str.split(" ");
    var permutations = [];
    for (var i=0; i<scramble.length; i++ ){
        if ( valid_permutations.indexOf(scramble[i]) != -1 ){
            permutations.push(scramble[i]);
        }
        else if ( scramble[i] != '' ) {
            is_valid_scramble = false;
        }
    }
    scrambleCube(permutations);

    // Invalid permutations are removed from the scramble
    var valid_scramble = permutations.join(" ");
    if ( !is_valid_scramble ){
        $('#scramble').val(valid_scramble + " ");
    }

    // Cube with the applied moves is rendered
    renderCube();

    // Solve the cube
    solveScramble( permutations );

    // Solution to the scramble
    var solution = '';
    var edges_solution = '';
    var corners_solution = '';

    // Edges
    var edge_pairs = '';
    if ( edge_cycles.length != 0 || flipped_edges.length != 0 ) {
        solution += "// Edges <br>";
        for (var i=0; i<edge_cycles.length; i++){
            edge_pairs += letter_pairs[edge_cycles[i]];
            if ( i%2==1 ){
                edge_pairs += " ";
            }

            // Solve using M2
            if ( edge_style == M2 ) {
                if ( i%2==1 && (edge_cycles[i]==I || edge_cycles[i]==S || edge_cycles[i]==C || edge_cycles[i]==W) ){
                    solution += m2_edges[m2_mappings[edge_cycles[i]]] + " // " + letter_pairs[edge_cycles[i]] + "<br>";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + " </b>" + m2_edges[m2_mappings[edge_cycles[i]]] + "<br>";
                }
                else {
                    solution += m2_edges[edge_cycles[i]] + " // " + letter_pairs[edge_cycles[i]] + "<br>";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + " </b>" + m2_edges[edge_cycles[i]] + "<br>";
                }
            }
            // Solve using 3-style
            else if ( i%2==0 ){
                solution += bh_edges[edge_cycles[i]][edge_cycles[i+1]] + " // " + letter_pairs[edge_cycles[i]] + letter_pairs[edge_cycles[i+1]] + "<br>";
                edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + letter_pairs[edge_cycles[i+1]] + " </b>" + bh_edges[edge_cycles[i]][edge_cycles[i+1]] + "<br>";
            }
        }

        if (flipped_edges.length != 0){
            edge_pairs += "<br>Flip: ";
            for (var i=0; i<flipped_edges.length; i++){
                edge_pairs += letter_pairs[flipped_edges[i]] + " ";
                if ( edge_flip_setups[flipped_edges[i]] == "" ){
                    solution += edge_flip_alg + " // Flip " + letter_pairs[flipped_edges[i]] + "<br>";
                    edges_solution += "<b>Flip " + letter_pairs[flipped_edges[i]] + " </b>" + edge_flip_alg + "<br>";
                }
                else{
                    solution += "[" + edge_flip_setups[flipped_edges[i]] + ":" + edge_flip_alg + "] // Flip " + letter_pairs[flipped_edges[i]] + "<br>";
                    edges_solution += "<b>Flip " + letter_pairs[flipped_edges[i]] + " </b>[" + edge_flip_setups[flipped_edges[i]] + ": " + edge_flip_alg + "]" + "<br>";
                }
            }
        }
        solution += "<br>";
    }

    // Corners
    var corner_pairs = '';
    if ( corner_cycles.length != 0 || cw_corners.length != 0 || ccw_corners.length != 0 ) {
        solution += "// Corners <br>";
        for (var i=0; i<corner_cycles.length; i++){
            corner_pairs += letter_pairs[corner_cycles[i]];
            if ( i%2==1 ){
                corner_pairs += " ";
            }

            // Solve using OP
            if ( corner_style == OP || (i%2==0 && i==(corner_cycles.length-1)) ) {
                if ( corner_cycles[i] != 15 ){
                    solution += "[" + op_setups[corner_cycles[i]] + ":" + y_perm + "]" + " // " + letter_pairs[corner_cycles[i]] + "<br>";
                    corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + "&nbsp;&nbsp;</b>[" + op_setups[corner_cycles[i]] + ": " + y_perm + "]<br>";
                }
                else {
                    solution += y_perm + " // " + letter_pairs[corner_cycles[i]] +  "<br>";
                    corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + "&nbsp;&nbsp;</b>" + y_perm +  "<br>";
                }
            }
            // Solve using 3-style
            else if ( i%2==0 ){
                solution += bh_corners[corner_cycles[i]][corner_cycles[i+1]] + " // " + letter_pairs[corner_cycles[i]] + letter_pairs[corner_cycles[i+1]] + "<br>";
                corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + letter_pairs[corner_cycles[i+1]] + " </b>" + bh_corners[corner_cycles[i]][corner_cycles[i+1]] + "<br>";
            }
        }
        if (cw_corners.length != 0){
            corner_pairs += "<br>Twist Clockwise: ";
            for (var i=0; i<cw_corners.length; i++){
                corner_pairs += letter_pairs[cw_corners[i]] + " ";

                if ( corner_flip_setups[cw_corners[i]] == "" ){
                    solution += cw_corner_flip_alg + " // Flip " + letter_pairs[cw_corners[i]] + "<br>";
                    corners_solution += "<b>Flip " + letter_pairs[cw_corners[i]] + " </b>" + cw_corner_flip_alg + "<br>";
                }
                else {
                    solution += "[" + corner_flip_setups[cw_corners[i]] + ":" + cw_corner_flip_alg + "] // Flip " + letter_pairs[cw_corners[i]] + "<br>";
                    corners_solution +=  "<b>Flip " + letter_pairs[cw_corners[i]] + " </b>[" + corner_flip_setups[cw_corners[i]] + ": " + cw_corner_flip_alg + "]<br>";
                }
            }
        }
        if (ccw_corners.length != 0){
            corner_pairs += "<br>Twist Counterclockwise: ";
            for (var i=0; i<ccw_corners.length; i++){
                corner_pairs += letter_pairs[ccw_corners[i]] + " ";

                if ( corner_flip_setups[ccw_corners[i]] == "" ){
                    solution += ccw_corner_flip_alg + " // Flip " + letter_pairs[ccw_corners[i]] + "<br>";
                    corners_solution += "<b>Flip " + letter_pairs[ccw_corners[i]] + " </b>" + ccw_corner_flip_alg + "<br>";
                }
                else {
                    solution += "[" + corner_flip_setups[ccw_corners[i]] + ":" + ccw_corner_flip_alg + "] // Flip " + letter_pairs[ccw_corners[i]] + "<br>";
                    corners_solution +=  "<b>Flip " + letter_pairs[ccw_corners[i]] + " </b>[" + corner_flip_setups[ccw_corners[i]] + ": " + ccw_corner_flip_alg + "]<br>";
                }
            }
        }
    }
    $('#edges').html(edge_pairs);
    $('#corners').html(corner_pairs);
    $('#edges-solution').html(edges_solution);
    $('#corners-solution').html(corners_solution);

    $('#algcubing').attr("href", "https://alg.cubing.net/?alg="+encodeURIComponent(solution.replace(/<br>/g,"\n"))+"&setup="+encodeURIComponent(valid_scramble)); //[0].click();
}

// M2 target solutions
var m2_edges = {};
m2_edges[A] = "M2";
m2_edges[B] = "[R' U R U': M2]";
m2_edges[C] = "U2 M' U2 M'";
m2_edges[D] = "[L U' L' U: M2]";
m2_edges[E] = "[B L' B': M2]";
m2_edges[F] = "[B L2 B': M2]";
m2_edges[G] = "[B L B': M2]";
m2_edges[H] = "[L' B L B': M2]";
m2_edges[I] = "D M' U R2 U' M U R2 U' D' M2";
m2_edges[J] = "[U R U': M2]";
m2_edges[L] = "[U' L' U: M2]";
m2_edges[M] = "[B' R B: M2]";
m2_edges[N] = "[R B' R' B: M2]";
m2_edges[O] = "[B' R' B: M2]";
m2_edges[P] = "[B' R2 B: M2]";
m2_edges[Q] = "[B' R B U R2 U': M2]";
m2_edges[R] = "[U' L U: M2]";
m2_edges[S] = "M2 D U R2 U' M' U R2 U' M D'";
m2_edges[T] = "[U R' U': M2]";
m2_edges[V] = "[U R2 U': M2]";
m2_edges[W] = "M U2 M U2";
m2_edges[X] = "[U' L2 U: M2]";

// Special m2 cases
var m2_mappings = {};
m2_mappings[C] = W;
m2_mappings[W] = C;
m2_mappings[I] = S;
m2_mappings[S] = I;

// OP setup moves
var op_setups = {};
op_setups[B] = "R D'";
op_setups[C] = "F";
op_setups[D] = "F R'";
op_setups[F] = "F2";
op_setups[G] = "D2 R";
op_setups[H] = "D2";
op_setups[I] = "F' D";
op_setups[J] = "F2 D";
op_setups[K] = "F D";
op_setups[L] = "D";
op_setups[M] = "R'";
op_setups[N] = "R2";
op_setups[O] = "R";
op_setups[P] = "";
op_setups[Q] = "R' F";
op_setups[S] = "D' R";
op_setups[T] = "D'";
op_setups[U] = "F'";
op_setups[V] = "D' F'";
op_setups[W] = "D2 F'";
op_setups[X] = "D F'";

// Y perm used for OP corners
var y_perm = "R U' R' U' R U R' F' R U R' U' R' F R";

// Edge flip setups
var edge_flip_setups = {};
edge_flip_setups[A] = "U2";
edge_flip_setups[B] = "U";
edge_flip_setups[C] = "";
edge_flip_setups[D] = "U'";
edge_flip_setups[E] = "U'";
edge_flip_setups[F] = "L' U'";
edge_flip_setups[G] = "L2 U'";
edge_flip_setups[H] = "L U'";
edge_flip_setups[I] = "";
edge_flip_setups[J] = "R U";
edge_flip_setups[L] = "L' U'";
edge_flip_setups[M] = "U";
edge_flip_setups[N] = "R' U";
edge_flip_setups[O] = "R2 U";
edge_flip_setups[P] = "R U";
edge_flip_setups[Q] = "U2";
edge_flip_setups[R] = "L U'";
edge_flip_setups[S] = "x";
edge_flip_setups[T] = "R' U";
edge_flip_setups[V] = "R2 U";
edge_flip_setups[W] = "x";
edge_flip_setups[X] = "L2 U'";

// Alg used to flip UF and DF
var edge_flip_alg = "(M F)3 F (M' F)3 F";

// Corner flip setups
var corner_flip_setups = {};
corner_flip_setups[B] = "R' F'";
corner_flip_setups[C] = "F'";
corner_flip_setups[D] = "";
corner_flip_setups[F] = "";
corner_flip_setups[G] = "F";
corner_flip_setups[H] = "D F";
corner_flip_setups[I] = "";
corner_flip_setups[J] = "F'";
corner_flip_setups[K] = "F2";
corner_flip_setups[L] = "F";
corner_flip_setups[M] = "F'";
corner_flip_setups[N] = "R' F'";
corner_flip_setups[O] = "D' F2";
corner_flip_setups[P] = "F2";
corner_flip_setups[Q] = "R' F'";
corner_flip_setups[S] = "D F";
corner_flip_setups[T] = "D' F2";
corner_flip_setups[U] = "F";
corner_flip_setups[V] = "F2";
corner_flip_setups[W] = "D' F2";
corner_flip_setups[X] = "D F";

// Flips UFL and UBL corners
var cw_corner_flip_alg = "L' U2 L U L' U L R U2 R' U' R U' R'";
var ccw_corner_flip_alg = "R U R' U R U2 R' L' U' L U' L' U2 L";

// 3-Style edge solutions
var bh_edges = {};
bh_edges[A] = {};
bh_edges[A][B] = "[M2, R U R' U']";
bh_edges[A][M] = "[x': [M2, U' R U]]";
bh_edges[A][C] = "M' U2 M U2";
bh_edges[A][I] = "[D: [U R2 U', M']]";
bh_edges[A][D] = "[y': R' U' R U R U R U' R' U']";
bh_edges[A][E] = "[x': [M2, U L' U']]";
bh_edges[A][H] = "[x: [U L2 U', M2]]";
bh_edges[A][R] = "[M2, U' L U]";
bh_edges[A][T] = "[M2, U R' U']";
bh_edges[A][N] = "[x: [U' R2 U, M2]]";
bh_edges[A][P] = "[x': [M2, U' R2 U]]";
bh_edges[A][J] = "[M2, U R U']";
bh_edges[A][L] = "[M2, U' L' U]";
bh_edges[A][F] = "[x': [M2, U L2 U']]";
bh_edges[A][S] = "[x: U' M2 R U' R' U M U' R U r' U]";
bh_edges[A][W] = "M2 U2 M' U2 M'";
bh_edges[A][O] = "[x': [M2, U' R' U]]";
bh_edges[A][V] = "[M2, U R2 U']";
bh_edges[A][G] = "[x': [M2, U L U']]";
bh_edges[A][X] = "[M2, U' L2 U]";

bh_edges[B] = {};
bh_edges[B][A] = "[R U R' U', M2]";
bh_edges[B][Q] = "[x' U2: [U R U', M]]";
bh_edges[B][C] = "U M U2 M U' M' U2 M'";
bh_edges[B][I] = "[x: [U R' U', M']]";
bh_edges[B][D] = "U' M' U2 M U'";
bh_edges[B][E] = "[y': [U R2 U', M']]";
bh_edges[B][H] = "[z' U2: [R, U' M U]]";
bh_edges[B][R] = "[L: U' M' U2 M U']";
bh_edges[B][T] = "[U' M2 U, R']";
bh_edges[B][N] = "[u': [M2, U' L U]]";
bh_edges[B][P] = "[u': [M2, U R' U']]";
bh_edges[B][J] = "[U' M2 U, R]";
bh_edges[B][L] = "[L': U' M' U2 M U']";
bh_edges[B][F] = "[z' U2: [R, U M' U']]";
bh_edges[B][S] = "[x': [U R U', M]]";
bh_edges[B][W] = "u M u2 M u";
bh_edges[B][O] = "[y': [U R2 U', M]]";
bh_edges[B][V] = "[U' M2 U, R2]";
bh_edges[B][G] = "[y' U: [R2, U M' U']]";
bh_edges[B][X] = "[y': [U R2 U', M2]]";

bh_edges[C] = {};
bh_edges[C][A] = "U2 M' U2 M";
bh_edges[C][Q] = "[y': [R2, U' M' U]]";
bh_edges[C][B] = "M U2 M U M' U2 M' U'";
bh_edges[C][M] = "[x: R U R U R2 U' R' U' R' U2]";
bh_edges[C][D] = "M U2 M U' M' U2 M' U";
bh_edges[C][E] = "[u' x: [U R' U', M']]";
bh_edges[C][H] = "[x y': U' M' U2 M U']";
bh_edges[C][R] = "[U2: [M2, U' L U]]";
bh_edges[C][T] = "[U2: [M2, U R' U']]";
bh_edges[C][N] = "[x y: U M' U2 M U]";
bh_edges[C][P] = "[x y: R2 U R U R' U' R' U' R' U R']";
bh_edges[C][J] = "[U2: [M2, U R U']]";
bh_edges[C][L] = "[U2: [M2, U' L' U]]";
bh_edges[C][F] = "[x y': R U' R U R U R U' R' U' R2]";
bh_edges[C][S] = "[x: [U' M: U M U2 M' U]]";
bh_edges[C][W] = "[x: U2 M' U2 M]";
bh_edges[C][O] = "[y': [R2, U' M U]]";
bh_edges[C][V] = "[U2: [M2, U R2 U']]";
bh_edges[C][G] = "[y': [R2, U M' U']]";
bh_edges[C][X] = "[U2: [M2, U' L2 U]]";

bh_edges[D] = {};
bh_edges[D][A] = "[y': U R U R' U' R' U' R' U R]";
bh_edges[D][Q] = "[x' U2: [U' L' U, M]]";
bh_edges[D][B] = "U M' U2 M U";
bh_edges[D][M] = "[y: [U' L2 U, M']]";
bh_edges[D][C] = "U' M U2 M U M' U2 M'";
bh_edges[D][I] = "[x: [U' L U, M']]";
bh_edges[D][H] = "[u: [M2, U R' U']]";
bh_edges[D][R] = "[U M2 U', L]";
bh_edges[D][T] = "[R': U M' U2 M U]";
bh_edges[D][N] = "[z U2: [L', U M U']]";
bh_edges[D][P] = "[z U2: [L', U' M' U]]";
bh_edges[D][J] = "[R: U M' U2 M U]";
bh_edges[D][L] = "[U M2 U', L']";
bh_edges[D][F] = "[u: [M2, U' L U]]";
bh_edges[D][S] = "[x': [U' L' U, M]]";
bh_edges[D][W] = "u' M u2 M u'";
bh_edges[D][O] = "[y' U': [R2, U' M U]]";
bh_edges[D][V] = "[y': [U' R2 U, M2]]";
bh_edges[D][G] = "[y': [U' R2 U, M']]";
bh_edges[D][X] = "[U M2 U', L2]";

bh_edges[E] = {};
bh_edges[E][A] = "[x': [U L' U', M2]]";
bh_edges[E][Q] = "[x U: [U M U', L]]";
bh_edges[E][B] = "[y': [M', U R2 U']]";
bh_edges[E][M] = "[M: U' M U2 M' U']";
bh_edges[E][C] = "[M: u M' u2 M' u]";
bh_edges[E][I] = "[L' U L U', M']";
bh_edges[E][H] = "[U' M' U, L]";
bh_edges[E][R] = "[u': [M', U L' U']]";
bh_edges[E][T] = "[u': [M', U L U']]";
bh_edges[E][N] = "[r': U' M U2 M' U']";
bh_edges[E][P] = "[U': [M', U' R U]]";
bh_edges[E][J] = "[U': [D R' D', M]]";
bh_edges[E][L] = "[u': [M', U' R U]]";
bh_edges[E][F] = "[U' M' U, L']";
bh_edges[E][S] = "[x: [M', U L U']]";
bh_edges[E][W] = "[z L: [U M' U', L2]]";
bh_edges[E][O] = "[U': [M', U' R2 U]]";
bh_edges[E][V] = "[z L2: [U M' U', L]]";
bh_edges[E][G] = "[U' M' U, L2]";
bh_edges[E][X] = "[z: [U M' U', L']]";

bh_edges[F] = {};
bh_edges[F][A] = "[x': [U L2 U', M2]]";
bh_edges[F][Q] = "[U': [L', U' M' U]]";
bh_edges[F][B] = "[z' U': [M', U' R U]]";
bh_edges[F][M] = "[x: R U R U R' U' R' U' R' U]";
bh_edges[F][C] = "[x y': R2 U R U R' U' R' U' R' U R']";
bh_edges[F][I] = "[U L' U', M']";
bh_edges[F][D] = "[u: [U' L U, M2]]";
bh_edges[F][E] = "[L', U' M' U]";
bh_edges[F][H] = "[L': [U' M' U, L2]]";
bh_edges[F][R] = "[z: [M', U' L' U]]";
bh_edges[F][T] = "[z' U: [U M' U', R]]";
bh_edges[F][N] = "[x: U R U R' U' R' U' R' U R]";
bh_edges[F][P] = "[x: R2 U R U R' U' R' U' R' U R']";
bh_edges[F][J] = "[z': [M', U' R U]]";
bh_edges[F][S] = "[x: [M', L' U L U']]";
bh_edges[F][W] = "[z' R': [U M' U', R2]]";
bh_edges[F][O] = "[x: R' U R U R' U' R' U' R' U R2]";
bh_edges[F][V] = "[z': [U M' U', R]]";
bh_edges[F][G] = "[L': [U' M' U, L']]";
bh_edges[F][X] = "[z' R2: [U M' U', R']]";

bh_edges[G] = {};
bh_edges[G][A] = "[x': [U L U', M2]]";
bh_edges[G][Q] = "[U': [L2, U' M' U]]";
bh_edges[G][B] = "[y' U2: [M', U' R2 U]]";
bh_edges[G][M] = "[U2: [L2, U' M' U]]";
bh_edges[G][C] = "[y': [U M' U', R2]]";
bh_edges[G][I] = "[U L2 U', M']";
bh_edges[G][D] = "[y': [M', U' R2 U]]";
bh_edges[G][E] = "[L2, U' M' U]";
bh_edges[G][H] = "[L2: [U' M' U, L']]";
bh_edges[G][R] = "[y' R: [L D' L', E']]";
bh_edges[G][T] = "[R' L2 y': [M', U R2 U']]";
bh_edges[G][N] = "[x' L: U' M U2 M' U']";
bh_edges[G][P] = "[x L': R2 U R U R' U' R' U' R' U R']";
bh_edges[G][J] = "[L': [E, R' D R]]";
bh_edges[G][L] = "[L' U: [B L2 B', M2]]";
bh_edges[G][F] = "[L2: [U' M' U, L]]";
bh_edges[G][S] = "[x: [M', U L' U']]";
bh_edges[G][W] = "[B2: [B L B', M2]]";
bh_edges[G][O] = "[x L' R: R2 U R U R' U' R' U' R' U R']";
bh_edges[G][V] = "[y' M': [U' R2 U, M']]";

bh_edges[H] = {};
bh_edges[H][A] = "[x: [M2, U L2 U']]";
bh_edges[H][Q] = "[U2: [U L U', M']]";
bh_edges[H][B] = "[z' U2: [U' M U, R]]";
bh_edges[H][M] = "[l: U' M U2 M' U']";
bh_edges[H][C] = "[x y': U M' U2 M U]";
bh_edges[H][I] = "[U L U', M']";
bh_edges[H][D] = "[u: [U R' U', M2]]";
bh_edges[H][E] = "[L, U' M' U]";
bh_edges[H][T] = "[z': [M, U R U']]";
bh_edges[H][N] = "[x': U' M U2 M' U']";
bh_edges[H][P] = "[z' l: [U R U', M2]]";
bh_edges[H][J] = "[z' U': [U' M U, R]]";
bh_edges[H][L] = "[z: [M, U L' U']]";
bh_edges[H][F] = "[L: [U' M' U, L2]]";
bh_edges[H][S] = "[x: [M', U L2 U']]";
bh_edges[H][W] = "[z' R': [U' M U, R2]]";
bh_edges[H][O] = "[x' R': U' M U2 M' U']";
bh_edges[H][V] = "[z': [U' M U, R]]";
bh_edges[H][G] = "[L: [U' M' U, L]]";
bh_edges[H][X] = "[z' R: [R, U' M U]]";

bh_edges[I] = {};
bh_edges[I][A] = "[D: [M', U R2 U']]";
bh_edges[I][Q] = "[U' M: U M U2 M' U]";
bh_edges[I][B] = "[x: [M', U R' U']]";
bh_edges[I][M] = "[M', R U' R' U]";
bh_edges[I][D] = "[x: [M', U' L U]]";
bh_edges[I][E] = "[M', L' U L U']";
bh_edges[I][H] = "[M', U L U']";
bh_edges[I][R] = "[x: [M', U' L2 U]]";
bh_edges[I][T] = "[x: [M', U R2 U']]";
bh_edges[I][N] = "[M', U' R' U]";
bh_edges[I][P] = "[M', U' R U]";
bh_edges[I][J] = "[x: [M', R U R' U']]";
bh_edges[I][L] = "[M': [M', U' L' U]]";
bh_edges[I][F] = "[M', U L' U']";
bh_edges[I][S] = "[U' M': [M', R U' R' U]]";
bh_edges[I][W] = "U' M U' M' U2 M' U M U'";
bh_edges[I][O] = "[M', U' R2 U]";
bh_edges[I][V] = "[x: [M', U R U']]";
bh_edges[I][G] = "[M', U L2 U']";
bh_edges[I][X] = "[x: [M', U' L' U]]";

bh_edges[J] = {};
bh_edges[J][A] = "[U R U', M2]";
bh_edges[J][Q] = "[x' U2: [U R2 U', M]]";
bh_edges[J][B] = "[R, U' M2 U]";
bh_edges[J][M] = "[u: [U L' U', M']]";
bh_edges[J][C] = "[U2: [U R U', M2]]";
bh_edges[J][I] = "[x: [R U R' U', M']]";
bh_edges[J][D] = "[R: U' M' U2 M U']";
bh_edges[J][E] = "[U': [M, D R' D']]";
bh_edges[J][H] = "[z' U': [R, U' M U]]";
bh_edges[J][R] = "[z: [M2, U' L' U]]";
bh_edges[J][T] = "[R: [U' M2 U, R2]]";
bh_edges[J][N] = "[z': [U' R U, M]]";
bh_edges[J][L] = "[L' R: U' M' U2 M U']";
bh_edges[J][F] = "[z': [U' R U, M']]";
bh_edges[J][S] = "[x': [U R2 U', M]]";
bh_edges[J][W] = "[z L: [U M2 U', L2]]";
bh_edges[J][O] = "[R U': [M2, B' R2 B]]";
bh_edges[J][V] = "[R: [U' M2 U, R]]";
bh_edges[J][G] = "[L': [R' D R, E]]";
bh_edges[J][X] = "[z: [U M2 U', L']]";

bh_edges[L] = {};
bh_edges[L][A] = "[U' L' U, M2]";
bh_edges[L][Q] = "[x' U2: [U' L2 U, M]]";
bh_edges[L][B] = "[L': U M' U2 M U]";
bh_edges[L][M] = "[u: [U L U', M']]";
bh_edges[L][C] = "[U: [L', U M2 U']]";
bh_edges[L][I] = "[M': [U' L' U, M']]";
bh_edges[L][D] = "[L', U M2 U']";
bh_edges[L][E] = "[u': [U' R U, M']]";
bh_edges[L][H] = "[z: [U L' U', M]]";
bh_edges[L][R] = "[L': [U M2 U', L2]]";
bh_edges[L][T] = "[z': [M2, U R U']]";
bh_edges[L][N] = "[z U: [L', U M U']]";
bh_edges[L][P] = "[z: [U L' U', M']]";
bh_edges[L][J] = "[L' R: U M' U2 M U]";
bh_edges[L][S] = "[x': [U' L2 U, M]]";
bh_edges[L][W] = "[z' R': [U' M2 U, R2]]";
bh_edges[L][O] = "[R: [L D' L', E']]";
bh_edges[L][V] = "[z': [U' M2 U, R]]";
bh_edges[L][G] = "[L' U: [M2, B L2 B']]";
bh_edges[L][X] = "[L': [U M2 U', L']]";

bh_edges[M] = {};
bh_edges[M][A] = "[x': [U' R U, M2]]";
bh_edges[M][Q] = "(M' U M U)2";
bh_edges[M][C] = "[M: u' M' u2 M' u']";
bh_edges[M][I] = "[R U' R' U, M']";
bh_edges[M][D] = "[y: [M', U' L2 U]]";
bh_edges[M][E] = "[M: U M U2 M' U]";
bh_edges[M][H] = "[l: U M U2 M' U]";
bh_edges[M][R] = "[u: [M', U' R' U]]";
bh_edges[M][T] = "[u: [M', U' R U]]";
bh_edges[M][N] = "[U M' U', R']";
bh_edges[M][P] = "[U M' U', R]";
bh_edges[M][J] = "[u: [M', U L' U']]";
bh_edges[M][L] = "[u: [M', U L U']]";
bh_edges[M][F] = "[x: U' R U R U R U' R' U' R']";
bh_edges[M][S] = "[x: [M', U' R' U]]";
bh_edges[M][W] = "[z' R': [U' M' U, R2]]";
bh_edges[M][O] = "[U M' U', R2]";
bh_edges[M][V] = "[z': [U' M' U, R]]";
bh_edges[M][G] = "[U: [M', U L2 U']]";
bh_edges[M][X] = "[z' R2: [U' M' U, R']]";

bh_edges[N] = {};
bh_edges[N][A] = "[x: [M2, U' R2 U]]";
bh_edges[N][Q] = "[U2: [U' R' U, M']]";
bh_edges[N][B] = "[u': [U' L U, M2]]";
bh_edges[N][M] = "[R', U M' U']";
bh_edges[N][C] = "[x y: U' M' U2 M U']";
bh_edges[N][I] = "[U' R' U, M']";
bh_edges[N][D] = "[z U2: [U M U', L']]";
bh_edges[N][E] = "[r': U M U2 M' U]";
bh_edges[N][H] = "[x': U M U2 M' U]";
bh_edges[N][R] = "[z: [M, U' L' U]]";
bh_edges[N][P] = "[R': [U M' U', R2]]";
bh_edges[N][J] = "[z': [M, U' R U]]";
bh_edges[N][L] = "[z U: [U M U', L']]";
bh_edges[N][F] = "[x: R' U' R U R U R U' R' U']";
bh_edges[N][S] = "[x: [M', U' R2 U]]";
bh_edges[N][W] = "[z L: [U M U', L2]]";
bh_edges[N][O] = "[R': [U M' U', R']]";
bh_edges[N][V] = "[z L2: [U M U', L]]";
bh_edges[N][G] = "[x' L: U M U2 M' U]";
bh_edges[N][X] = "[z: [U M U', L']]";

bh_edges[O] = {};
bh_edges[O][A] = "[x': [U' R' U, M2]]";
bh_edges[O][Q] = "[U: [R2, U M' U']]";
bh_edges[O][B] = "[y': [M, U R2 U']]";
bh_edges[O][M] = "[R2, U M' U']";
bh_edges[O][C] = "[y': [U' M U, R2]]";
bh_edges[O][I] = "[U' R2 U, M']";
bh_edges[O][D] = "[y' U2: [M, U R2 U']]";
bh_edges[O][E] = "[U': [U' R2 U, M']]";
bh_edges[O][H] = "[x' R': U M U2 M' U]";
bh_edges[O][R] = "[R': [E, L' D' L]]";
bh_edges[O][T] = "[y L': [R' D R, E]]";
bh_edges[O][N] = "[R2: [U M' U', R]]";
bh_edges[O][P] = "[R2: [U M' U', R']]";
bh_edges[O][J] = "[R U': [B' R2 B, M2]]";
bh_edges[O][L] = "[R: [E', L D' L']]";
bh_edges[O][F] = "[x: R2 U' R U R U R U' R' U' R]";
bh_edges[O][S] = "[x: [M', U' R U]]";
bh_edges[O][W] = "[B2: [B' R' B, M2]]";
bh_edges[O][G] = "[x L' R: R U' R U R U R U' R' U' R2]";
bh_edges[O][X] = "[y M': [U L2 U', M']]";

bh_edges[P] = {};
bh_edges[P][A] = "[x': [U' R2 U, M2]]";
bh_edges[P][Q] = "[U: [R, U M' U']]";
bh_edges[P][B] = "[u': [U R' U', M2]]";
bh_edges[P][M] = "[R, U M' U']";
bh_edges[P][C] = "[x y: R U' R U R U R U' R' U' R2]";
bh_edges[P][I] = "[U' R U, M']";
bh_edges[P][D] = "[z U2: [U' M' U, L']]";
bh_edges[P][E] = "[U': [U' R U, M']]";
bh_edges[P][H] = "[z' l': [U R U', M2]]";
bh_edges[P][R] = "[z U': [U' M' U, L']]";
bh_edges[P][T] = "[z': [M', U R U']]";
bh_edges[P][N] = "[R: [U M' U', R2]]";
bh_edges[P][L] = "[z: [M', U L' U']]";
bh_edges[P][F] = "[x: R U' R U R U R U' R' U' R2]";
bh_edges[P][S] = "[x: [M', R U' R' U]]";
bh_edges[P][W] = "[z L: [U' M' U, L2]]";
bh_edges[P][O] = "[R: [U M' U', R]]";
bh_edges[P][V] = "[z L2: [U' M' U, L]]";
bh_edges[P][G] = "[x L': R U' R U R U R U' R' U' R2]";
bh_edges[P][X] = "[z: [U' M' U, L']]";

bh_edges[Q] = {};
bh_edges[Q][B] = "[x' U2: [M, U R U']]";
bh_edges[Q][M] = "[x U': [R', U' M U]]";
bh_edges[Q][C] = "[y': [U' M' U, R2]]";
bh_edges[Q][I] = "[U M: U M U2 M' U]";
bh_edges[Q][D] = "[x' U2: [M, U' L' U]]";
bh_edges[Q][E] = "(U M' U M)2";
bh_edges[Q][H] = "[U2: [M', U L U']]";
bh_edges[Q][R] = "[x' y': [U, M D M']]";
bh_edges[Q][T] = "[U2 M': [M', U R' U']]";
bh_edges[Q][N] = "[U2: [M', U' R' U]]";
bh_edges[Q][P] = "[U2: [M', U' R U]]";
bh_edges[Q][J] = "[x' U2: [M, U R2 U']]";
bh_edges[Q][L] = "[x' U2: [M, U' L2 U]]";
bh_edges[Q][F] = "[U2: [M', U L' U']]";
bh_edges[Q][S] = "[x: U' M U' M' U2 M' U M U']";
bh_edges[Q][W] = "[z' x': [U' M' U, R2]]";
bh_edges[Q][O] = "[U2: [M', U' R2 U]]";
bh_edges[Q][V] = "[x' U2: [M, U R' U']]";
bh_edges[Q][G] = "[U2: [M', U L2 U']]";
bh_edges[Q][X] = "[x' U2: [M, U' L U]]";

bh_edges[R] = {};
bh_edges[R][A] = "[U' L U, M2]";
bh_edges[R][Q] = "[x': (M U M' U)2]";
bh_edges[R][B] = "[L: U M' U2 M U]";
bh_edges[R][M] = "[u: [U' R' U, M']]";
bh_edges[R][C] = "[U: [L, U M2 U']]";
bh_edges[R][I] = "[M': [U' L U, M']]";
bh_edges[R][D] = "[L, U M2 U']";
bh_edges[R][E] = "[u': [U L' U', M']]";
bh_edges[R][T] = "[L R': U M' U2 M U]";
bh_edges[R][N] = "[z: [U' L' U, M]]";
bh_edges[R][P] = "[z U': [L', U' M' U]]";
bh_edges[R][J] = "[z: [U' L' U, M2]]";
bh_edges[R][L] = "[L: [U M2 U', L2]]";
bh_edges[R][F] = "[z: [U' L' U, M']]";
bh_edges[R][S] = "[M: [U' L U, M]]";
bh_edges[R][W] = "[z' R': [U M2 U', R2]]";
bh_edges[R][O] = "[R': [L' D' L, E]]";
bh_edges[R][V] = "[z': [U M2 U', R]]";
bh_edges[R][G] = "[y' R: [E', L D' L']]";
bh_edges[R][X] = "[L: [U M2 U', L]]";

bh_edges[S] = {};
bh_edges[S][A] = "[x U': r [U' R' U, M'] r']";
bh_edges[S][Q] = "[x: U M' U' M U2 M U M' U]";
bh_edges[S][B] = "[x': [M, U R U']]";
bh_edges[S][M] = "[x: [U' R' U, M']]";
bh_edges[S][C] = "[x: U M U M U2 M' U M' U']";
bh_edges[S][I] = "[U' M': [R U' R' U, M']]";
bh_edges[S][D] = "[x': [M, U' L' U]]";
bh_edges[S][E] = "[x: [U L U', M']]";
bh_edges[S][H] = "[x: [U L2 U', M']]";
bh_edges[S][R] = "[M2: [U' L U, M']]";
bh_edges[S][T] = "[M2: [U R' U', M']]";
bh_edges[S][N] = "[x: [U' R2 U, M']]";
bh_edges[S][P] = "[M': [U' R U, M']]";
bh_edges[S][J] = "[x': [M, U R2 U']]";
bh_edges[S][L] = "[x': [M, U' L2 U]]";
bh_edges[S][F] = "[M': [U L' U', M']]";
bh_edges[S][O] = "[x: [U' R U, M']]";
bh_edges[S][V] = "[x': [M, U R' U']]";
bh_edges[S][G] = "[x: [U L' U', M']]";
bh_edges[S][X] = "[x': [M, U' L U]]";

bh_edges[T] = {};
bh_edges[T][A] = "[U R' U', M2]";
bh_edges[T][Q] = "[U2 M': [U R' U', M']]";
bh_edges[T][B] = "[R', U' M2 U]";
bh_edges[T][M] = "[u: [U' R U, M']]";
bh_edges[T][C] = "[U': [R', U' M2 U]]";
bh_edges[T][I] = "[x: [U R2 U', M']]";
bh_edges[T][D] = "[R': U' M' U2 M U']";
bh_edges[T][E] = "[u': [U L U', M']]";
bh_edges[T][H] = "[z': [U R U', M]]";
bh_edges[T][R] = "[L R': U' M' U2 M U']";
bh_edges[T][P] = "[z': [U R U', M']]";
bh_edges[T][J] = "[R': [U' M2 U, R2]]";
bh_edges[T][L] = "[z': [U R U', M2]]";
bh_edges[T][F] = "[z' U: [R, U M' U']]";
bh_edges[T][S] = "[M: [U R' U', M]]";
bh_edges[T][W] = "[z L: [U' M2 U, L2]]";
bh_edges[T][O] = "[y L': [E, R' D R]]";
bh_edges[T][V] = "[R': [U' M2 U, R']]";
bh_edges[T][G] = "[R' L2 y': [U R2 U', M']]";
bh_edges[T][X] = "[z: [U' M2 U, L']]";

bh_edges[V] = {};
bh_edges[V][A] = "[U R2 U', M2]";
bh_edges[V][Q] = "[x' U2: [U R' U', M]]";
bh_edges[V][B] = "[R2, U' M2 U]";
bh_edges[V][M] = "[z': [R, U' M' U]]";
bh_edges[V][C] = "[U': [R2, U' M2 U]]";
bh_edges[V][I] = "[x: [U R U', M']]";
bh_edges[V][D] = "[y': [M2, U' R2 U]]";
bh_edges[V][E] = "[z L': [U M' U', L']]";
bh_edges[V][H] = "[z': [R, U' M U]]";
bh_edges[V][R] = "[z': [R, U M2 U']]";
bh_edges[V][T] = "[R2: [U' M2 U, R]]";
bh_edges[V][N] = "[z L': [U M U', L']]";
bh_edges[V][P] = "[z L': [U' M' U, L']]";
bh_edges[V][J] = "[R2: [U' M2 U, R']]";
bh_edges[V][L] = "[z': [R, U' M2 U]]";
bh_edges[V][F] = "[z': [R, U M' U']]";
bh_edges[V][S] = "[x': [U R' U', M]]";
bh_edges[V][W] = "[R2 U M': U2 M' U2 M]";
bh_edges[V][G] = "[y M2: [U' L2 U, M']]";
bh_edges[V][X] = "[z2: R2 U R U R' U' R' U' R' U R']";

bh_edges[W] = {};
bh_edges[W][A] = "M' u2 M' u2";
bh_edges[W][Q] = "[M2: [U' M: U' M U2 M' U']]";
bh_edges[W][B] = "u' M' u2 M' u'";
bh_edges[W][M] = "[z' R: [U' M' U, R2]]";
bh_edges[W][C] = "u2 M' u2 M'";
bh_edges[W][I] = "U M' U' M U2 M U M' U";
bh_edges[W][D] = "u M' u2 M' u";
bh_edges[W][E] = "[z L': [U M' U', L2]]";
bh_edges[W][H] = "[z' R: [U' M U, R2]]";
bh_edges[W][R] = "[z' R: [U M2 U', R2]]";
bh_edges[W][T] = "[z L': [U' M2 U, L2]]";
bh_edges[W][N] = "[z L': [U M U', L2]]";
bh_edges[W][P] = "[z L': [U' M' U, L2]]";
bh_edges[W][J] = "[z L': [U M2 U', L2]]";
bh_edges[W][L] = "[z' R: [U' M2 U, R2]]";
bh_edges[W][F] = "[z' R: [U M' U', R2]]";
bh_edges[W][O] = "[B2: [M2, B' R' B]]";
bh_edges[W][V] = "[R2: u' M' u2 M' u']";
bh_edges[W][G] = "[B2: [M2, B L B']]";
bh_edges[W][X] = "[L2: u M' u2 M' u]";

bh_edges[X] = {};
bh_edges[X][A] = "[U' L2 U, M2]";
bh_edges[X][Q] = "[x' U2: [U' L U, M]]";
bh_edges[X][B] = "[y': [M2, U R2 U']]";
bh_edges[X][M] = "[z' R2: [R', U' M' U]]";
bh_edges[X][C] = "[U: [L2, U M2 U']]";
bh_edges[X][I] = "[x: [U' L' U, M']]";
bh_edges[X][D] = "[L2, U M2 U']";
bh_edges[X][E] = "[z: [L', U M' U']]";
bh_edges[X][H] = "[z' R: [U' M U, R]]";
bh_edges[X][R] = "[L2: [U M2 U', L']]";
bh_edges[X][T] = "[z: [L', U' M2 U]]";
bh_edges[X][N] = "[z: [L', U M U']]";
bh_edges[X][P] = "[z: [L', U' M' U]]";
bh_edges[X][J] = "[z: [L', U M2 U']]";
bh_edges[X][L] = "[L2: [U M2 U', L]]";
bh_edges[X][F] = "[z' R: [U M' U', R]]";
bh_edges[X][S] = "[x': [U' L U, M]]";
bh_edges[X][W] = "[L2 U' M': U2 M' U2 M]";
bh_edges[X][O] = "[y' M2: [U R2 U', M']]";
bh_edges[X][V] = "[z2: R U' R U R U R U' R' U' R2]";

// 3-style corner solutions
var bh_corners = {};
bh_corners[B] = {};
bh_corners[B][C] = "[x R2: [R U R', D2]]";
bh_corners[B][D] = "[y x R2: [R U R', D2]]";
bh_corners[B][F] = "[y R': [U2, R' D' R]]";
bh_corners[B][G] = "[y: [U, R' D2 R]]";
bh_corners[B][H] = "[U, R D' R']";
bh_corners[B][I] = "[x: [U R' U', L]]";
bh_corners[B][J] = "[x' z: [R U R', D]]";
bh_corners[B][K] = "[L' D2 L, U']";
bh_corners[B][L] = "[U, R D2 R']";
bh_corners[B][M] = "[y R: [R D R', U2]]";
bh_corners[B][O] = "[U, R D R']";
bh_corners[B][P] = "[y: [R D2 R', U']]";
bh_corners[B][S] = "[y': [L D L', U']]";
bh_corners[B][T] = "[y: [U, R' D' R]]";
bh_corners[B][U] = "[z': [R U2 R', D2]]";
bh_corners[B][V] = "[z': [U2, R' D2 R]]";
bh_corners[B][W] = "[z' R': [U2, R' D2 R]]";
bh_corners[B][X] = "[z' R: [R U2 R', D2]]";

bh_corners[C] = {};
bh_corners[C][B] = "[x R2: [D2, R U R']]";
bh_corners[C][D] = "[R': [U, L' D2 L]]";
bh_corners[C][F] = "[F: [R' D' R, U2]]";
bh_corners[C][G] = "[U2, R' D R]";
bh_corners[C][H] = "[L' D' L, U2]";
bh_corners[C][I] = "[x R': [R' D2 R, U2]]";
bh_corners[C][K] = "[L' D2 L, U2]";
bh_corners[C][L] = "[y: [R D' R', U2]]";
bh_corners[C][N] = "[F: [R2, U' L' U]]";
bh_corners[C][O] = "[L' D L, U2]";
bh_corners[C][P] = "[U2, R' D' R]";
bh_corners[C][Q] = "[R': [U2, L' D2 L]]";
bh_corners[C][S] = "[U2, R' D2 R]";
bh_corners[C][T] = "[y': [U2, R D' R']]";
bh_corners[C][U] = "[D: [U2, R' F' R2 F R]]";
bh_corners[C][V] = "[U2, R' F' R2 F R]";
bh_corners[C][W] = "[D': [U2, R' F' R2 F R]]";
bh_corners[C][X] = "[D2: [U2, R' F' R2 F R]]";

bh_corners[D] = {};
bh_corners[D][B] = "[y x R2: [D2, R U R']]";
bh_corners[D][C] = "[y' x' R: [U', R D2 R']]";
bh_corners[D][G] = "[U', L D L']";
bh_corners[D][H] = "[L' D' L, U]";
bh_corners[D][J] = "[L': [L' D' L, U2]]";
bh_corners[D][K] = "[L' D2 L, U]";
bh_corners[D][L] = "[y: [R D' R', U]]";
bh_corners[D][M] = "[x': [D, R U' R']]";
bh_corners[D][N] = "[x' z': [U' R U, L']]";
bh_corners[D][O] = "[y': [U', R' D2 R]]";
bh_corners[D][P] = "[y: [R D2 R', U]]";
bh_corners[D][Q] = "[R2: [L' D2 L, U]]";
bh_corners[D][S] = "[y': [U', R' D R]]";
bh_corners[D][T] = "[U', L D2 L']";
bh_corners[D][U] = "[x' y R: [D2, R U2 R']]";
bh_corners[D][V] = "[x': [L' U' L, D2]]";
bh_corners[D][W] = "[x: [D2, L U L']]";
bh_corners[D][X] = "[x' y R': [R' D2 R, U2]]";

bh_corners[F] = {};
bh_corners[F][B] = "[y R': [R' D' R, U2]]";
bh_corners[F][C] = "[x' U2: [R2, U' L2 U]]";
bh_corners[F][G] = "[y' L': [U2, R' D' R]]";
bh_corners[F][H] = "[y' R: [U2, R D2 R']]";
bh_corners[F][J] = "[y' R: [U2, R D R']]";
bh_corners[F][K] = "[y L: [R D' R', U2]]";
bh_corners[F][L] = "[x U R': [R' D2 R, U2]]";
bh_corners[F][M] = "[F: [U2, R' F' R2 F R]]";
bh_corners[F][N] = "[x z R': [U2, R' D2 R]]";
bh_corners[F][O] = "[x z R': [U2, R' D R]]";
bh_corners[F][P] = "[x' y': [R2' U R2 U' R2', D2]]";
bh_corners[F][Q] = "[R' F: [U2, R' D' R]]";
bh_corners[F][S] = "[x' z R: [R D R', U2]]";
bh_corners[F][T] = "[y' R: [U2, R D' R']]";
bh_corners[F][U] = "[z x' U2: [L2, U R2 U']]";
bh_corners[F][V] = "[F: [U2, R' D R]]";
bh_corners[F][W] = "[x' y': [U2, R' F' R2 F R]]";
bh_corners[F][X] = "[z R': [U2, R' F' R2 F R]]";

bh_corners[G] = {};
bh_corners[G][B] = "[y: [R' D2 R, U]]";
bh_corners[G][C] = "[R' D R, U2]";
bh_corners[G][D] = "[L D L', U']";
bh_corners[G][F] = "[y' L': [R' D' R, U2]]";
bh_corners[G][H] = "[z x': [U', R' D R]]";
bh_corners[G][I] = "[z R: [U2, R D R']]";
bh_corners[G][J] = "[D x: [R' D2 R, U]]";
bh_corners[G][K] = "[D, R U2 R']";
bh_corners[G][M] = "[x': [D2, R U' R']]";
bh_corners[G][N] = "[x: [R' U2 R, D']]";
bh_corners[G][O] = "[y': [R U' R', D2]]";
bh_corners[G][P] = "[L: [D2, R U' R']]";
bh_corners[G][Q] = "[R': [R' D R, U2]]";
bh_corners[G][S] = "[y': [R U' R', D]]";
bh_corners[G][T] = "[R' y: [R' D2 R, U]]";
bh_corners[G][V] = "[z' x': [D', R U2 R']]";
bh_corners[G][W] = "[R: [D, R U2 R']]";
bh_corners[G][X] = "[z' R: [R2 U R2 U' R2, D2]]";

bh_corners[H] = {};
bh_corners[H][B] = "[R D' R', U]";
bh_corners[H][C] = "[U2, L' D' L]";
bh_corners[H][D] = "[U, L' D' L]";
bh_corners[H][F] = "[y' R: [R D2 R', U2]]";
bh_corners[H][G] = "[z x': [R' D R, U']]";
bh_corners[H][I] = "[y': [U' R' U, L']]";
bh_corners[H][J] = "[x': [L D' L', U']]";
bh_corners[H][K] = "[x': [L D2 L', U']]";
bh_corners[H][L] = "[L U L', D']";
bh_corners[H][M] = "[x: [D, L' U2 L]]";
bh_corners[H][N] = "[L': [D, L' U2 L]]";
bh_corners[H][O] = "[R: [L U L', D2]]";
bh_corners[H][P] = "[L U L', D2]";
bh_corners[H][Q] = "[R': [U2, L' D' L]]";
bh_corners[H][T] = "[D', R' U R]";
bh_corners[H][U] = "[y' R': [D2, R' U2 R]]";
bh_corners[H][V] = "[y': [U' R2 U, L']]";
bh_corners[H][W] = "[L: [L D2 L', U']]";

bh_corners[I] = {};
bh_corners[I][B] = "[x: [L, U R' U']]";
bh_corners[I][C] = "[x R': [U2, R' D2 R]]";
bh_corners[I][G] = "[z R: [R D R', U2]]";
bh_corners[I][H] = "[y': [L', U' R' U]]";
bh_corners[I][J] = "[x' y': [R U R', D']]";
bh_corners[I][K] = "[x: [U2, R' D2 R]]";
bh_corners[I][L] = "[x' y': [R U R', D]]";
bh_corners[I][M] = "[x': [U' R U, L']]";
bh_corners[I][N] = "[U R U', L']";
bh_corners[I][O] = "[L, U' R2 U]";
bh_corners[I][P] = "[L, U' R U]";
bh_corners[I][Q] = "[x R2: [U2, R' D2 R]]";
bh_corners[I][S] = "[z R': [F, R' B2 R]]";
bh_corners[I][T] = "[U R' U', L']";
bh_corners[I][U] = "[y' R': [D, R' U2 R]]";
bh_corners[I][V] = "[U R2 U', L']";
bh_corners[I][W] = "[x: [R U2 R', D2]]";
bh_corners[I][X] = "[U': [L2, U' R' U]]";

bh_corners[J] = {};
bh_corners[J][B] = "[x' z: [D, R U R']]";
bh_corners[J][D] = "[L': [U2, L' D' L]]";
bh_corners[J][F] = "[y' R: [R D R', U2]]";
bh_corners[J][G] = "[D x: [U, R' D2 R]]";
bh_corners[J][H] = "[x': [U', L D' L']]";
bh_corners[J][I] = "[x' y': [D', R U R']]";
bh_corners[J][K] = "[x: [U, R' D2 R]]";
bh_corners[J][L] = "[x y': [U2, R' D R]]";
bh_corners[J][N] = "[x': [U, L D' L']]";
bh_corners[J][O] = "[D' x: [U, R' D2 R]]";
bh_corners[J][P] = "[z' L': [U2, R' D R]]";
bh_corners[J][Q] = "[R': [R' F' R2 F R, U2]]";
bh_corners[J][S] = "[x': [U R2 U', L']]";
bh_corners[J][T] = "[x: [U' L U, R2]]";
bh_corners[J][U] = "[z': [R U' R', D2]]";
bh_corners[J][V] = "[z': [U', R' D2 R]]";
bh_corners[J][W] = "[x': [U2, L D' L']]";
bh_corners[J][X] = "[z' R: [R U' R', D2]]";

bh_corners[K] = {};
bh_corners[K][B] = "[U', L' D2 L]";
bh_corners[K][C] = "[U2, L' D2 L]";
bh_corners[K][D] = "[U, L' D2 L]";
bh_corners[K][F] = "[y L: [U2, R D' R']]";
bh_corners[K][G] = "[R U2 R', D]";
bh_corners[K][H] = "[x: [D', L U2 L']]";
bh_corners[K][I] = "[x: [R' D2 R, U2]]";
bh_corners[K][J] = "[x: [R' D2 R, U]]";
bh_corners[K][L] = "[x: [R' D2 R, U']]";
bh_corners[K][M] = "[z' R: [R D' R', U2]]";
bh_corners[K][N] = "[x: [D, L U2 L']]";
bh_corners[K][O] = "[R U2 R', D']";
bh_corners[K][Q] = "[x' z: [D2, R2 U R2 U' R2]]";
bh_corners[K][S] = "[R U2 R', D2]";
bh_corners[K][T] = "[F: [D2, R' U R]]";
bh_corners[K][U] = "[z': [R2 U R2 U' R2, D2]]";
bh_corners[K][W] = "[x: [D2, L U2 L']]";
bh_corners[K][X] = "[U': [L2, U' R U]]";

bh_corners[L] = {};
bh_corners[L][B] = "[R D2 R', U]";
bh_corners[L][C] = "[y: [U2, R D' R']]";
bh_corners[L][D] = "[y': [R' D' R, U']]";
bh_corners[L][F] = "[x U R':  [U2, R' D2 R]]";
bh_corners[L][H] = "[D', L U L']";
bh_corners[L][I] = "[x' y': [D, R U R']]";
bh_corners[L][J] = "[x y': [R' D R, U2]]";
bh_corners[L][K] = "[x: [U', R' D2 R]]";
bh_corners[L][M] = "[D x: [U L2 U', R']]";
bh_corners[L][N] = "[x y: [R U2 R', D']]";
bh_corners[L][O] = "[F': [R U2 R', D']]";
bh_corners[L][P] = "[y': [D, R' U2 R]]";
bh_corners[L][Q] = "[x R2: [U', R' D2 R]]";
bh_corners[L][S] = "[F': [R U2 R', D2]]";
bh_corners[L][T] = "[D2, R' U R]";
bh_corners[L][V] = "[R': [D2, R' U R]]";
bh_corners[L][W] = "[x: [R U' R', D2]]";
bh_corners[L][X] = "[z'  R: [R U R', D2]]";

bh_corners[M] = {};
bh_corners[M][B] = "[y R: [U2, R D R']]";
bh_corners[M][D] = "[x': [R U' R', D]]";
bh_corners[M][F] = "[F: [R' F' R2 F R, U2]]";
bh_corners[M][G] = "[x': [R U' R', D2]]";
bh_corners[M][H] = "[x: [L' U2 L, D]]";
bh_corners[M][I] = "[x': [L', U' R U]]";
bh_corners[M][K] = "[z' R: [U2, R D' R']]";
bh_corners[M][L] = "[D x: [R', U L2 U']]";
bh_corners[M][N] = "[R': [F L2 F', R']]";
bh_corners[M][O] = "[R': [F L2 F', R2]]";
bh_corners[M][P] = "[R', F L2 F']";
bh_corners[M][Q] = "[R2: [D', R U2 R']]";
bh_corners[M][S] = "[x': [L, U' R U]]";
bh_corners[M][T] = "[D' x: [R', U L2 U']]";
bh_corners[M][U] = "[x': [L2, U' R U]]";
bh_corners[M][V] = "[z' x': [D, R U2 R']]";
bh_corners[M][W] = "[z' x': [R' D R, U2]]";
bh_corners[M][X] = "[D x': [L2, U' R U]]";

bh_corners[N] = {};
bh_corners[N][C] = "[z' y' R: [U2, R D2 R']]";
bh_corners[N][D] = "[x': [U', R' D R]]";
bh_corners[N][F] = "[x z R': [R' D2 R, U2]]";
bh_corners[N][G] = "[x: [D', R' U2 R]]";
bh_corners[N][H] = "[L': [L' U2 L, D]]";
bh_corners[N][I] = "[L', U R U']";
bh_corners[N][J] = "[x': [L D' L', U]]";
bh_corners[N][K] = "[x: [L U2 L', D]]";
bh_corners[N][L] = "[D: [U' L' U, R2]]";
bh_corners[N][M] = "[R': [R', F L2 F']]";
bh_corners[N][O] = "[U' L' U, R']";
bh_corners[N][P] = "[U' L' U, R2]";
bh_corners[N][S] = "[L, U R U']";
bh_corners[N][T] = "[x' y' R': [R' D' R, U2]]";
bh_corners[N][U] = "[L2, U R U']";
bh_corners[N][V] = "[y': [U' R2 U, L]]";
bh_corners[N][W] = "[R: [D', R U2 R']]";
bh_corners[N][X] = "[x' y' R: [U2, R D R']]";

bh_corners[O] = {};
bh_corners[O][B] = "[R D R', U]";
bh_corners[O][C] = "[U2, L' D L]";
bh_corners[O][D] = "[y': [R' D2 R, U']]";
bh_corners[O][F] = "[y' x R2: [D, R U2 R']]";
bh_corners[O][G] = "[y': [D2, R U' R']]";
bh_corners[O][H] = "[R: [D2, L U L']]";
bh_corners[O][I] = "[U' R2 U, L]";
bh_corners[O][J] = "[F: [D', R U2 R']]";
bh_corners[O][K] = "[D', R U2 R']";
bh_corners[O][L] = "[F': [D', R U2 R']]";
bh_corners[O][M] = "[R: [F L2 F', R2]]";
bh_corners[O][N] = "[R', U' L' U]";
bh_corners[O][P] = "[x: [R, U L2 U']]";
bh_corners[O][Q] = "[x R' U: [R2, U L2 U']]";
bh_corners[O][S] = "[D': [R U2 R', D']]";
bh_corners[O][U] = "[x: [U' R U, L2]]";
bh_corners[O][V] = "[y' R: [D2, R U' R']]";
bh_corners[O][X] = "[R D: [L2, U R' U']]";

bh_corners[P] = {};
bh_corners[P][B] = "[y: [U', R D2 R']]";
bh_corners[P][C] = "[R' D' R, U2]";
bh_corners[P][D] = "[L D' L', U']";
bh_corners[P][F] = "[x' y': [D2, R2 U R2 U' R2]]";
bh_corners[P][G] = "[L: [R U' R', D2]]";
bh_corners[P][H] = "[D2, L U L']";
bh_corners[P][I] = "[U' R U, L]";
bh_corners[P][J] = "[z' L': [R' D R, U2]]";
bh_corners[P][L] = "[y': [R' U2 R, D]]";
bh_corners[P][M] = "[F L2 F', R']";
bh_corners[P][N] = "[R2, U' L' U]";
bh_corners[P][O] = "[x: [U L2 U', R]]";
bh_corners[P][Q] = "[R': [U2, L' D L]]";
bh_corners[P][S] = "[x': [L, U' R2 U]]";
bh_corners[P][T] = "[D, R' U R]";
bh_corners[P][U] = "[x': [L2, U' R2 U]]";
bh_corners[P][W] = "[x: [R2 U R2 U' R2, D2]]";
bh_corners[P][X] = "[D: [L2, U R' U']]";

bh_corners[Q] = {};
bh_corners[Q][C] = "[R': [L' D2 L, U2]]";
bh_corners[Q][D] = "[R2: [U, L' D2 L]]";
bh_corners[Q][F] = "[R' F: [R' D' R, U2]]";
bh_corners[Q][G] = "[R': [U2, R' D R]]";
bh_corners[Q][H] = "[R': [L' D' L, U2]]";
bh_corners[Q][I] = "[x R: [D2, R U2 R']]";
bh_corners[Q][J] = "[R': [U2, R' F' R2 F R]]";
bh_corners[Q][K] = "[y x': [R2 U R2 U' R2, D2]]";
bh_corners[Q][L] = "[x R: [D2, R U' R']]";
bh_corners[Q][M] = "[R': [U2, R' D' R]]";
bh_corners[Q][O] = "[x R' U: [U L2 U', R2]]";
bh_corners[Q][P] = "[R': [L' D L, U2]]";
bh_corners[Q][S] = "[R': [U2, R' D2 R]]";
bh_corners[Q][T] = "[x R: [D2, R U R']]";
bh_corners[Q][U] = "[y x': [U2, R' F' R2 F R]]";
bh_corners[Q][V] = "[R2: [U', L' D2 L]]";
bh_corners[Q][W] = "[R2: [U2, L' D2 L]]";
bh_corners[Q][X] = "[U2 R: [R D' R', U2]]";

bh_corners[S] = {};
bh_corners[S][B] = "[y': [U', L D L']]";
bh_corners[S][C] = "[R' D2 R, U2]";
bh_corners[S][D] = "[y': [R' D R, U']]";
bh_corners[S][F] = "[y x' R: [U2, R D R']]";
bh_corners[S][G] = "[y': [D, R U' R']]";
bh_corners[S][I] = "[y x2 R: [U', R D2 R']]";
bh_corners[S][J] = "[x': [L', U R2 U']]";
bh_corners[S][K] = "[D2, R U2 R']";
bh_corners[S][L] = "[F': [D2, R U2 R']]";
bh_corners[S][M] = "[x': [U' R U, L]]";
bh_corners[S][N] = "[U R U', L]";
bh_corners[S][O] = "[D2: [R U2 R', D]]";
bh_corners[S][P] = "[x': [U' R2 U, L]]";
bh_corners[S][Q] = "[R2: [D2, R U2 R']]";
bh_corners[S][T] = "[U R' U', L]";
bh_corners[S][U] = "[y R': [R' D2 R, U]]";
bh_corners[S][V] = "[U R2 U', L]";
bh_corners[S][W] = "[R: [D2, R U2 R']]";

bh_corners[T] = {};
bh_corners[T][B] = "[y: [R' D' R, U]]";
bh_corners[T][C] = "[y': [R D' R', U2]]";
bh_corners[T][D] = "[L D2 L', U']";
bh_corners[T][F] = "[y' R: [R D' R', U2]]";
bh_corners[T][G] = "[R' y: [U, R' D2 R]]";
bh_corners[T][H] = "[R' U R, D']";
bh_corners[T][I] = "[L', U R' U']";
bh_corners[T][J] = "[x: [R2, U' L U]]";
bh_corners[T][K] = "[F: [R' U R, D2]]";
bh_corners[T][L] = "[R' U R, D2]";
bh_corners[T][M] = "[D' x: [U L2 U', R']]";
bh_corners[T][N] = "[x' y' R': [U2, R' D' R]]";
bh_corners[T][P] = "[R' U R, D]";
bh_corners[T][Q] = "[x R: [R U R', D2]]";
bh_corners[T][S] = "[L, U R' U']";
bh_corners[T][U] = "[y' R': [D', R' U2 R]]";
bh_corners[T][V] = "[z': [U, R' D2 R]]";
bh_corners[T][X] = "[y' D R': [D2, R' U2 R]]";

bh_corners[U] = {};
bh_corners[U][B] = "[z': [D2, R U2 R']]";
bh_corners[U][C] = "[D: [R' F' R2 F R, U2]]";
bh_corners[U][D] = "[z' x' R: [R U2 R', D2]]";
bh_corners[U][F] = "[x' y' U': [R2, U' L2 U]]";
bh_corners[U][H] = "[y' R': [R' U2 R, D2]]";
bh_corners[U][I] = "[z x' R: [U', R D2 R']]";
bh_corners[U][J] = "[z': [D2, R U' R']]";
bh_corners[U][K] = "[z': [D2, R2 U R2 U' R2]]";
bh_corners[U][M] = "[x': [U' R U, L2]]";
bh_corners[U][N] = "[U R U', L2]";
bh_corners[U][O] = "[x: [L2, U' R U]]";
bh_corners[U][P] = "[x': [U' R2 U, L2]]";
bh_corners[U][Q] = "[y x': [R' F' R2 F R, U2]]";
bh_corners[U][S] = "[y R': [U, R' D2 R]]";
bh_corners[U][T] = "[y' R': [R' U2 R, D']]";
bh_corners[U][V] = "[U R2 U', L2]";
bh_corners[U][W] = "[y' U': [R2 U R2 U' R2, D2]]";
bh_corners[U][X] = "[D: [L2, U R2 U']]";

bh_corners[V] = {};
bh_corners[V][B] = "[z': [R' D2 R, U2]]";
bh_corners[V][C] = "[R' F' R2 F R, U2]";
bh_corners[V][D] = "[x': [D2, L' U' L]]";
bh_corners[V][F] = "[F: [R' D R, U2]]";
bh_corners[V][G] = "[z' x': [R U2 R', D']]";
bh_corners[V][H] = "[y': [L', U' R2 U]]";
bh_corners[V][I] = "[L', U R2 U']";
bh_corners[V][J] = "[z': [R' D2 R, U']]";
bh_corners[V][L] = "[R2: [U, R D2 R']]";
bh_corners[V][M] = "[z' x': [R U2 R', D]]";
bh_corners[V][N] = "[y': [L, U' R2 U]]";
bh_corners[V][O] = "[y' R2: [U', R' D2 R]]";
bh_corners[V][Q] = "[R2: [L' D2 L, U']]";
bh_corners[V][S] = "[L, U R2 U']";
bh_corners[V][T] = "[z': [R' D2 R, U]]";
bh_corners[V][U] = "[L2, U R2 U']";
bh_corners[V][W] = "[D': [U R2 U', L2]]";
bh_corners[V][X] = "[U2: [R2 U R2 U' R2, D2]]";

bh_corners[W] = {};
bh_corners[W][B] = "[z' R': [R' D2 R, U2]]";
bh_corners[W][C] = "[D': [R' F' R2 F R, U2]]";
bh_corners[W][D] = "[x: [L U L', D2]]";
bh_corners[W][F] = "[x' y': [R' F' R2 F R, U2]]";
bh_corners[W][G] = "[R: [R U2 R', D]]";
bh_corners[W][H] = "[L: [U', L D2 L']]";
bh_corners[W][I] = "[x: [D2, R U2 R']]";
bh_corners[W][J] = "[x: [L U' L', D2]]";
bh_corners[W][K] = "[x: [L U2 L', D2]]";
bh_corners[W][L] = "[x: [D2, R U' R']]";
bh_corners[W][M] = "[z' x': [U2, R' D R]]";
bh_corners[W][N] = "[R: [R U2 R', D']]";
bh_corners[W][P] = "[x: [D2, R2 U R2 U' R2]]";
bh_corners[W][Q] = "[R2: [L' D2 L, U2]]";
bh_corners[W][S] = "[R: [R U2 R', D2]]";
bh_corners[W][U] = "[y' U': [D2, R2 U R2 U' R2]]";
bh_corners[W][V] = "[D': [L2, U R2 U']]";
bh_corners[W][X] = "[D2: [U R2 U', L2]]";

bh_corners[X] = {};
bh_corners[X][B] = "[z' R: [D2, R U2 R']]";
bh_corners[X][C] = "[D2: [R' F' R2 F R, U2]]";
bh_corners[X][D] = "[x' y R': [U2, R' D2 R]]";
bh_corners[X][F] = "[z R': [R' F' R2 F R, U2]]";
bh_corners[X][G] = "[z' R: [D2, R2 U R2 U' R2]]";
bh_corners[X][I] = "[U': [U' R' U, L2]]";
bh_corners[X][J] = "[z' R: [D2, R U' R']]";
bh_corners[X][K] = "[U': [U' R U, L2]]";
bh_corners[X][L] = "[z' R: [D2, R U R']]";
bh_corners[X][M] = "[D x': [U' R U, L2]]";
bh_corners[X][N] = "[x' y' R: [R D R', U2]]";
bh_corners[X][O] = "[R D: [U R' U', L2]]";
bh_corners[X][P] = "[D: [U R' U', L2]]";
bh_corners[X][Q] = "[U2 R: [U2, R D' R']]";
bh_corners[X][T] = "[y' D R': [R' U2 R, D2]]";
bh_corners[X][U] = "[D: [U R2 U', L2]]";
bh_corners[X][V] = "[U2: [D2, R2 U R2 U' R2]]";
bh_corners[X][W] = "[D2: [L2, U R2 U']]";

$( document ).ready(initUI);