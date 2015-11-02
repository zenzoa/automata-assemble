// 2D cellular automata rulesets.
var Rules = {
    life: {
        survive: [2,3],
        born: [3]
    },
    two_by_two: {
        survive: [3,6],
        born: [1,2,5]
    },
    three_four_life: {
        survive: [3,4],
        born: [3,4]
    },
    amoeba: {
        survive: [1,3,5,8],
        born: [3,5,6]
    },
    assimilation: {
        survive: [4,5,6,7],
        born: [3,4,5]
    },
    coagulations: {
        survive: [2,3,5,6,7,8],
        born: [3,7,8]
    },
    coral: {
        survive: [4,5,6,7,8],
        born: [3]
    },
    day_and_night: {
        survive: [3,4,6,7,8],
        born: [3,6,7,8]
    },
    diamoeba: {
        survive: [5,6,7,8],
        born: [3,5,6,7,8]
    },
    flakes: {
        survive: [0,1,2,3,4,5,6,7,8],
        born: [3]
    },
    gnarl: {
        survive: [1],
        born: [1]
    },
    high_life: {
        survive: [2,3],
        born: [3,6]
    },
    long_life: {
        survive: [5],
        born: [3,4,5]
    },
    maze: {
        survive: [1,2,3,4,5],
        born: [3]
    },
    mazectric: {
        survive: [1,2,3,4],
        born: [3]
    },
    move: {
        survive: [2,4,5],
        born: [3,6,8]
    },
    pseudo_life: {
        survive: [2,3,8],
        born: [3,5,7]
    },
    replicator: {
        survive: [1,3,5,7],
        born: [1,3,5,7]
    },
    seeds: {
        survive: [],
        born: [2]
    },
    serviettes: {
        survive: [],
        born: [2,3,4]
    },
    stains: {
        survive: [2,3,5,6,7,8],
        born: [3,6,7,8]
    },
    walled_cities: {
        survive: [2,3,4,5],
        born: [4,5,6,7,8]
    },
    custom: {
        survive: [],
        born: []
    }
};

// What the current ruleset is.
var CurrentRules = Rules.life;

// One 'cell' in the cellular automata.
var Cell = {

    // Cell states.
    states: {

        list: [ 'alive', 'dead' ],

        alive: {
            step: function( cell ){
                var neighbors = Grid.countNeighbors( cell, 'alive' );
                if( CurrentRules.survive.indexOf( neighbors ) > -1 ){
                    cell.age ++;
                } else {
                    cell.changeState( 'dead' );
                    cell.age = 0;
                }
            }
        },

        dead: {
            step: function( cell ){
                var neighbors = Grid.countNeighbors( cell, 'alive' );
                if( CurrentRules.born.indexOf( neighbors ) > -1 ) {
                   cell.changeState( 'alive' );
                }
            }
        }
    },

    // Returns a random state (dead or alive).
    randomState: function(){
        return Cell.states.list[Math.floor(Math.random()*Cell.states.list.length)];
    },

    // Create a new cell.
    create: function( x, y ){
        var newCell = Object.create(null);
        newCell.state = Cell.randomState();
        newCell.nextState = undefined;
        newCell.age = 0;
        newCell.x = x;
        newCell.y = y;

        // Change state of cell.
        newCell.changeState = function( state ){
            if( Cell.states[state] !== undefined ){
                newCell.nextState = state;
            } else {
                throw "State not defined.";
            }
        };

        // Prep for the next generation.
        newCell.step = function(){
            Cell.states[newCell.state].step(newCell);
        };

        // Update cell to next generation.
        newCell.update = function(){
            if( newCell.nextState !== undefined ){
                newCell.state = newCell.nextState;
            }
        };

        return newCell;
    }

};

// The world the cells live in.
var Grid = {
    width: 30,
    height: 20,
    cells: [],

    // Fill screen with random cells.
    fill: function(){
        Grid.cells.forEach( function( cell ){
            cell.changeState( Cell.randomState() );
            cell.update();
            cell.age = 0;
        });
    },

    // Clear screen of all cells.
    clear: function(){
        Grid.cells.forEach( function( cell ){
            cell.changeState( 'dead' );
            cell.update();
        });
    },

    // Progress the cells to a new generation.
    step: function(){
        // First go-round, the cells figure out their next state.
        Grid.cells.forEach( function( cell ){
            cell.step();
        });
        // Second go-round, the cells actually update their state.
        Grid.cells.forEach( function( cell ){
            cell.update();
        });
        // Draw to screen.
        Grid.draw();
    },

    // Grab a single cell from the grid.
    getCell: function( x, y ){
        return Grid.cells[ Grid.width * y + x ];
    },

    // Returns an array of a cell's eight neighbors.
    neighbors: function( cell ){
        var neighbors = [
            Grid.getCell( cell.x, cell.y + 1 ),
            Grid.getCell( cell.x, cell.y - 1 ),
            Grid.getCell( cell.x + 1, cell.y ),
            Grid.getCell( cell.x + 1, cell.y + 1 ),
            Grid.getCell( cell.x + 1, cell.y - 1 ),
            Grid.getCell( cell.x - 1, cell.y ),
            Grid.getCell( cell.x - 1, cell.y + 1 ),
            Grid.getCell( cell.x - 1, cell.y - 1 )
            ];
        return neighbors.filter( function( neighbor ){
            return( neighbor !== undefined );
        });
    },

    // Count all neighbors with a given state.
    countNeighbors: function( cell, state ){
        var neighbors = 0;
        Grid.neighbors( cell ).forEach( function( neighbor ){
            if( neighbor.state === state ){
                neighbors++;
            }
        });
        return neighbors;
    },

    // And now for DOOM. I mean DOM.
    HTML: $( '#grid' ),

    // Setup the screen with many small boxes.
    init: function(){
        var x, y;
        for( y=0 ; y < Grid.height ; y++ ){
            for( x=0 ; x < Grid.width ; x++ ){
                Grid.cells[ Grid.width * y + x ] = Cell.create( x, y );
                $( '<div id="x' + x + 'y' + y + '">' )
                    .appendTo( Grid.HTML )
                    .click( Grid.clickCell );
            }
            Grid.HTML.append( '<br>' );
        }
    },

    // Update the screen with cell states.
    draw: function(){
        Grid.cells.forEach( function( cell ){
            $( '#x' + cell.x + 'y' + cell.y )
                .removeClass()
                .addClass( cell.state )
                .addClass( 'age' + Math.min(cell.age, 2) );
        });
    },

    // Callback for when the user clicks a cell.
    clickCell: function(){
        $( this ).toggleClass( 'alive dead' );
        var x = Number( this.id.slice( this.id.indexOf( 'x' )+1,
                                this.id.indexOf( 'y' ) ) );
        var y = Number( this.id.slice( this.id.indexOf( 'y' )+1 ) );
        var cell = Grid.getCell( x, y );
        if( $( this ).hasClass( 'alive' ) ){
            cell.changeState( 'alive' );
        } else {
            cell.changeState( 'dead' );
            cell.age = 0;
        }
        cell.update();
    }

};

var Interface = {
    intervalID: 0,

    // Fill drop-down list with available pre-set rulesets.
    rulesPopulate: function(){
        $.each( Rules, function( name, ruleset ){
            var title = name.split( '_' ).join( ' ' );
            $( '#ruleList' ).append( '<option value="'+ name +'">'+ title +'</option>' );
        });
    },

    // When a ruleset is selected, change the rules and display them.
    rulesChange: function(){
        try {
            CurrentRules = Rules[ $( '#ruleList' ).val() ];
        } catch (e) {
            throw 'Requested ruleset does not exist.';
        }
        $( "#rules button" ).removeClass( 'select' );
        CurrentRules.survive.forEach( function( n ){
            $( '#s' + n ).addClass( 'select' );
        });
        CurrentRules.born.forEach( function( n ){
            $( '#b' + n ).addClass( 'select' );
        });
    },

    // When you click on born/survive buttons, change the rules.
    rulesEdit: function(){
        var newRules = Object.create( null );
        newRules.survive = [];
        newRules.born = [];

        $( this ).toggleClass( 'select' );
        $( '#ruleList' ).val( 'custom' );
        for( var i=1; i<=8; i++ ){
            if( $( '#s'+i ).hasClass( 'select' ) ){
                newRules.survive.push(i);
            }
            if( $( '#b'+i ).hasClass( 'select' ) ){
                newRules.born.push(i);
            }
        }
        $.each( Rules, function( name, ruleset ){
            if( ruleset.survive.length === newRules.survive.length &&
                ruleset.born.length === newRules.born.length &&
                ruleset.survive.every( function( n ){ return( newRules.survive.indexOf( n ) > -1 ); } ) &&
                ruleset.born.every( function( n ){ return( newRules.born.indexOf( n ) > -1 ); } ) ){
                $( '#ruleList' ).val( name );
            }
        });

        CurrentRules = newRules;
    },

    // When the Play button is pushed, toggle automatic play.
    playCallback: function(){
        if( $( this ).hasClass( 'playing' ) ){
            window.clearInterval( Interface.intervalID );
            $( this ).removeClass( 'playing' ).html( 'play' );
        } else {
            Interface.intervalID = setInterval( Grid.step, 150 );
            $( this ).addClass( 'playing' ).html( 'pause' );
        }
    },

    // When the Next button is pushed, step the cellular automata.
    stepCallback: function(){
        Grid.step();
        window.clearInterval( Interface.intervalID );
        $( '#play' ).removeClass( 'playing' ).html( 'play' );
    },

    init: function(){
        // Populate the interface.
        Interface.rulesPopulate();
        Interface.rulesChange();

        // Attach callback functions to buttons etc.
        $( '#ruleList' ).change( Interface.rulesChange );
        $( '#rules button' ).click( Interface.rulesEdit );
        $( '#play' ).click( Interface.playCallback );
        $( '#step' ).click( Interface.stepCallback );
        $( '#clear' ).click( function( event ){
            event.preventDefault();
            Grid.clear();
            Grid.draw();
        });
        $( '#fill' ).click( function( event ){
            event.preventDefault();
            Grid.fill();
            Grid.draw();
        });

        // Initialize the world and its bitty inhabitants.
        Grid.init();
        Grid.draw();
    }
};

$( document ).ready( function(){

    Interface.init();

});
