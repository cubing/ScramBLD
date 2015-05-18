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

    // Inits and renders the cube in its solved state
    initCube();
    initCubeCanvas('cube_canvas');
    renderCube();

    // If a scramble param is found in the URL, it is applied to the cube and solved
    applyUrlScramble();
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

    // Invalid permutations are removed from the scramble
    var valid_scramble = permutations.join(" ");
    if ( !is_valid_scramble ){
        $('#scramble').val(valid_scramble + " ");
    }

    // URL is updated
    setScrambleInUrl(valid_scramble);

    // Cube is scrambled
    scrambleCube(valid_scramble);

    // Cube with the applied moves is rendered
    renderCube();

    // Solve the cube
    solveCube();

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

            // Display M2 solution
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
            // Display 3-style solution
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

            // Display OP solution
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
            // Display 3-style solution
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

    // Solution is displayed
    $('#edges').html(edge_pairs);
    $('#corners').html(corner_pairs);
    $('#edges-solution').html(edges_solution);
    $('#corners-solution').html(corners_solution);

    // Alg.cubing.net url is set
    $('#algcubing').attr("href", "https://alg.cubing.net/?alg="+encodeURIComponent(solution.replace(/<br>/g,"\n"))+"&setup="+encodeURIComponent(valid_scramble));
}

// If a scramble param is found in the URL, it is applied to the cube and solved
function applyUrlScramble(){
    var url = window.location.search.substring(1);
    var url_vars = url.split('&');
    for (var i = 0; i < url_vars.length; i++) {
        var param = url_vars[i].split('=');
        if (param[0] == 'scramble') {
            var scramble = param[1].replace(/_/g," ").replace(/-/g,"'");
            $('#scramble').val(scramble);
            solveAndDisplay();
        }
    }
}

// Adds scramble to url as a param
// Assumes the scramble is valid
function setScrambleInUrl( scramble ){
    // Scramble is converted for url
    scramble = scramble.replace(/ /g,"_").replace(/\'/g,"-");

    // Added seperately to append ? before params
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + loc.pathname + "?scramble=" + scramble;;

    // URL is updated
    history.pushState('data', '', url);
}

$( document ).ready(initUI);