/// ================================================================================================
/// Classes
/// ================================================================================================
/**
 * Represents a coordinate on the 2d game arena, where each unit is a tile from the origin.
 * The origin is the top-left corner of the arena.
 * As x increases, the position is further right. As y increases, the position is further down.
 */
class Point {
    /** Constructs a Point from x and y coordinates. */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /** Gets the screen coordinates for the x-position. */
    get xCoord() {
        return this.toCoord(this.x);
    }
    /** Gets the screen coordinates for the x-position. */
    get yCoord() {
        return this.toCoord(this.y);
    }
    /** Indicates whether two points share the same position. */
    equals(other) {
        return (this.x == other.x) && (this.y == other.y);
    }
    /** Converts tile position to screen coordinates, mostly for rendering purposes. */
    toCoord(len) {
        return TILE_SIZE * len;
    }
    /** Converts to string for use in Map as key. */
    toKey() {
        return `Point(${this.x},${this.y})`;
    }
    /** Returns a Point from its key string representation. */
    static fromKey(keyString) {
        let i = keyString.indexOf(",");
        let x = Number(keyString.slice(6, i));
        let y = Number(keyString.slice(i + 1, -1));
        return new Point(x, y);
    }
}
/**
 * Represents a glyph on the game arena.
 */
class Glyph {
    constructor(pos, activeFill, inactiveFill) {
        this.pos = pos;
        this.activeFill = activeFill;
        this.inactiveFill = inactiveFill;
        this.isActive = false;
    }
}
/**
 * Represents a quadrant of the arena.
 */
class Quadrant {
    constructor(origin, vertex, element, start, end, quadrantFill, orbFill) {
        this.image = null;
        this.origin = origin;
        this.vertex = vertex;
        this.element = element;
        this.start = start;
        this.end = end;
        this.quadrantFill = quadrantFill;
        this.orbFill = orbFill;
        this.isActive = false;
    }
    /**
     * Determines whether a Point is within the bounds of a given quadrant.
     *
     * @param p                   The Point to check.
     * @returns true if the player is in the quadrant's bounds, otherwise false.
     */
    contains(p) {
        let x1 = this.origin.x;
        let x2 = this.origin.x + ARENA_OUTER_RADIUS - 1;
        let y1 = this.origin.y;
        let y2 = this.origin.y + ARENA_OUTER_RADIUS - 1;
        return (x1 <= p.x && p.x <= x2) && (y1 <= p.y && p.y <= y2);
    }
    /**
     * Returns the quadrant that contains the given Point.
     *
     * @param p               The Point to check.
     * @returns the quadrant containing the Point.
     */
    static getQuadrant(p) {
        if (FIRE_QUADRANT.contains(p)) {
            return FIRE_QUADRANT;
        }
        if (SHADOW_QUADRANT.contains(p)) {
            return SHADOW_QUADRANT;
        }
        if (ICE_QUADRANT.contains(p)) {
            return ICE_QUADRANT;
        }
        return LIGHTNING_QUADRANT;
    }
}
/**
 * Represents a magical orb as part of Akkha's special attack, Trailing Orbs.
 */
class MagicalOrb {
    constructor(pos, fill) {
        this.pos = pos;
        this.fill = fill;
        this.spawnTick = TICK_COUNT;
    }
}
/**
 * Enumerates the different types of events that happen during the memory blast.
 */
var EventType;
(function (EventType) {
    /** No event. */
    EventType[EventType["Empty"] = 0] = "Empty";
    /** Reset arena state to default. */
    EventType[EventType["Reset"] = 1] = "Reset";
    /** Ends the game. */
    EventType[EventType["End"] = 2] = "End";
    /** Glyphs active. */
    EventType[EventType["FireGlyphActive"] = 3] = "FireGlyphActive";
    EventType[EventType["ShadowGlyphActive"] = 4] = "ShadowGlyphActive";
    EventType[EventType["IceGlyphActive"] = 5] = "IceGlyphActive";
    EventType[EventType["LightningGlyphActive"] = 6] = "LightningGlyphActive";
    /** Quadrants active. */
    /** Subsequent stages describe the wave passing through the quadrant. */
    EventType[EventType["FireQuadrantStage1"] = 7] = "FireQuadrantStage1";
    EventType[EventType["FireQuadrantStage2"] = 8] = "FireQuadrantStage2";
    EventType[EventType["ShadowQuadrantStage1"] = 9] = "ShadowQuadrantStage1";
    EventType[EventType["ShadowQuadrantStage2"] = 10] = "ShadowQuadrantStage2";
    EventType[EventType["IceQuadrantStage1"] = 11] = "IceQuadrantStage1";
    EventType[EventType["IceQuadrantStage2"] = 12] = "IceQuadrantStage2";
    EventType[EventType["LightningQuadrantStage1"] = 13] = "LightningQuadrantStage1";
    EventType[EventType["LightningQuadrantStage2"] = 14] = "LightningQuadrantStage2";
})(EventType || (EventType = {}));
/**
 * Enumerates the elements in the memory blast.
 */
var ElementType;
(function (ElementType) {
    ElementType[ElementType["Fire"] = 0] = "Fire";
    ElementType[ElementType["Shadow"] = 1] = "Shadow";
    ElementType[ElementType["Ice"] = 2] = "Ice";
    ElementType[ElementType["Lightning"] = 3] = "Lightning";
})(ElementType || (ElementType = {}));
/// ================================================================================================
/// Constants
/// ================================================================================================
const TICK_DURATION = 600;
const ARENA_INNER_RADIUS = 5;
const ARENA_MIDDLE_RADIUS = 7;
const ARENA_OUTER_RADIUS = 10;
const ORIGIN = new Point(ARENA_OUTER_RADIUS, ARENA_OUTER_RADIUS);
const GLYPH_EVENTS = [
    EventType.FireGlyphActive,
    EventType.ShadowGlyphActive,
    EventType.IceGlyphActive,
    EventType.LightningGlyphActive
];
const MEMORY_BLAST_EVENTS = new Set([
    EventType.FireQuadrantStage1,
    EventType.ShadowQuadrantStage1,
    EventType.IceQuadrantStage1,
    EventType.LightningQuadrantStage1
]);
const PLAYER_TILE_STROKE = "#00efef";
const GRID_TILE_STROKE = "#eeeeee";
const TARGET_TILE_STROKE = "#d35eed";
const ARENA_INNER_FILL = "#63717b";
const ARENA_MIDDLE_FILL_RED = "#826d69";
const ARENA_MIDDLE_FILL_BLUE = "#71808c";
const ARENA_OUTER_FILL = "#908c74";
const ARENA_STAR_FILL = "#424c53";
const ACTIVE_FIRE_GLYPH_FILL = "#ea4631";
const ACTIVE_SHADOW_GLYPH_FILL = "#696264";
const ACTIVE_ICE_GLYPH_FILL = "#ede9eb";
const ACTIVE_LIGHTNING_GLYPH_FILL = "#fdff8d";
const INACTIVE_FIRE_GLYPH_FILL = "#826042";
const INACTIVE_SHADOW_GLYPH_FILL = "#4a4545";
const INACTIVE_ICE_GLYPH_FILL = "#aba19f";
const INACTIVE_LIGHTNING_GLYPH_FILL = "#a1955e";
const FIRE_QUADRANT_FILL = "#ea4631aa";
const SHADOW_QUADRANT_FILL = "#696264aa";
const ICE_QUADRANT_FILL = "#ede9ebaa";
const LIGHTNING_QUADRANT_FILL = "#fdff8daa";
const FIRE_ORB_FILL = "#b47d29";
const SHADOW_ORB_FILL = "#1e191b";
const ICE_ORB_FILL = "#cbdfde";
const LIGHTNING_ORB_FILL = "#e9d672";
const FIRE_GLYPH = new Glyph(new Point(8, 8), ACTIVE_FIRE_GLYPH_FILL, INACTIVE_FIRE_GLYPH_FILL);
const SHADOW_GLYPH = new Glyph(new Point(11, 8), ACTIVE_SHADOW_GLYPH_FILL, INACTIVE_SHADOW_GLYPH_FILL);
const ICE_GLYPH = new Glyph(new Point(8, 11), ACTIVE_ICE_GLYPH_FILL, INACTIVE_ICE_GLYPH_FILL);
const LIGHTNING_GLYPH = new Glyph(new Point(11, 11), ACTIVE_LIGHTNING_GLYPH_FILL, INACTIVE_LIGHTNING_GLYPH_FILL);
const FIRE_QUADRANT = new Quadrant(new Point(0, 0), new Point(10, 0), ElementType.Fire, 1.5 * Math.PI, Math.PI, FIRE_QUADRANT_FILL, FIRE_ORB_FILL);
const SHADOW_QUADRANT = new Quadrant(new Point(10, 0), new Point(20, 10), ElementType.Shadow, 2 * Math.PI, 1.5 * Math.PI, SHADOW_QUADRANT_FILL, SHADOW_ORB_FILL);
const ICE_QUADRANT = new Quadrant(new Point(0, 10), new Point(0, 10), ElementType.Ice, Math.PI, 0.5 * Math.PI, ICE_QUADRANT_FILL, ICE_ORB_FILL);
const LIGHTNING_QUADRANT = new Quadrant(new Point(10, 10), new Point(10, 20), ElementType.Lightning, 0.5 * Math.PI, 0, LIGHTNING_QUADRANT_FILL, LIGHTNING_ORB_FILL);
const QUADRANTS = [FIRE_QUADRANT, SHADOW_QUADRANT, ICE_QUADRANT, LIGHTNING_QUADRANT];
const BLAST_SFX_1 = new Audio("res/blast-sfx.ogg");
const BLAST_SFX_2 = new Audio("res/blast-sfx.ogg");
const BLAST_SFX_3 = new Audio("res/blast-sfx.ogg");
const BLAST_SFX_4 = new Audio("res/blast-sfx.ogg");
const GLYPH_SFX_1 = new Audio("res/glyph-sfx.ogg");
const GLYPH_SFX_2 = new Audio("res/glyph-sfx.ogg");
const GLYPH_SFX_3 = new Audio("res/glyph-sfx.ogg");
const GLYPH_SFX_4 = new Audio("res/glyph-sfx.ogg");
/// ================================================================================================
/// Globals
/// ================================================================================================
/// ------------------------------------------------------------------------------------------------
/// Game State
/// ------------------------------------------------------------------------------------------------
let DEFAULT_ARENA_STATE_FULL;
let TILE_SIZE = 30;
let TICK_TIMER;
let TICK_COUNT = -1;
let PATTERN = [];
let SEQUENCE = [];
let CURR_NUM_GLYPHS_PASSED = 0;
let CURR_NUM_GLYPHS_FAILED = 0;
let CURR_NUM_ORBS_TANKED = 0;
let CURR_NUM_ORBS_SPAWNED = 0;
let TOTAL_NUM_ACTIVE_GLYPHS = 0;
let TOTAL_NUM_GLYPHS_PASSED = 0;
let TOTAL_NUM_GLYPHS_FAILED = 0;
let TOTAL_NUM_ORBS_TANKED = 0;
let TOTAL_NUM_ORBS_SPAWNED = 0;
let PLAYER = new Point(10, 10);
let TARGET = new Point(10, 10);
let MAGICAL_ORBS = new Map();
let IS_MAGICAL_ORB_DELETED = false;
/// ------------------------------------------------------------------------------------------------
/// User Configuration
/// ------------------------------------------------------------------------------------------------
let FEELING_SPECIAL = false;
let DOUBLE_TROUBLE = false;
let NUM_ACTIVE_GLYPHS = 4;
/// ------------------------------------------------------------------------------------------------
/// Document
/// ------------------------------------------------------------------------------------------------
let HALF_HEIGHT = TILE_SIZE * ARENA_OUTER_RADIUS;
let HALF_WIDTH = TILE_SIZE * ARENA_OUTER_RADIUS;
let canvas = document.getElementById("akkha-arena");
let ctx = canvas.getContext("2d");
canvas.height = TILE_SIZE * 2 * ARENA_OUTER_RADIUS;
canvas.width = TILE_SIZE * 2 * ARENA_OUTER_RADIUS;
let activeGlyphsInput = document.getElementById("ag");
activeGlyphsInput.value = "4";
initialRender();
/// ================================================================================================
/// Functions
/// ================================================================================================
/// ------------------------------------------------------------------------------------------------
/// Window Helpers
/// ------------------------------------------------------------------------------------------------
/**
 * Callback for mousedown events.
 */
canvas.addEventListener('mousedown', function (event) {
    TARGET = getTileClicked(event);
});
/**
 * Determines the tile clicked based on the x,y-positions of the mouse event.
 * Sets TARGET to the coordinate determined.
 *
 * @param event               The mousedown event.
 * @returns the Point representing the tile clicked, or the player's position if no tile was clicked.
 */
function getTileClicked(event) {
    if (!event) {
        return JSON.parse(JSON.stringify(PLAYER));
    }
    let rect = canvas.getBoundingClientRect();
    let xCoord = event.clientX - rect.left;
    let yCoord = event.clientY - rect.top;
    let xTile = Math.floor(xCoord / TILE_SIZE);
    let yTile = Math.floor(yCoord / TILE_SIZE);
    return new Point(xTile, yTile);
}
/**
 * Prints the stats of the user's memory blast performance.
 */
function printStats() {
    let gp = document.getElementById("numGlyphPassed");
    if (gp) {
        gp.innerHTML = `Glyphs passed: ${CURR_NUM_GLYPHS_PASSED}/${NUM_ACTIVE_GLYPHS} current, ${TOTAL_NUM_GLYPHS_PASSED}/${TOTAL_NUM_ACTIVE_GLYPHS} total`;
    }
    let gf = document.getElementById("numGlyphFailed");
    if (gf) {
        gf.innerHTML = `Glyphs failed: ${CURR_NUM_GLYPHS_FAILED}/${NUM_ACTIVE_GLYPHS} current, ${TOTAL_NUM_GLYPHS_FAILED}/${TOTAL_NUM_ACTIVE_GLYPHS} total`;
    }
    let ot = document.getElementById("numOrbsTanked");
    if (ot) {
        ot.innerHTML = `Magical orbs tanked: ${CURR_NUM_ORBS_TANKED}/${CURR_NUM_ORBS_SPAWNED} current, ${TOTAL_NUM_ORBS_TANKED}/${TOTAL_NUM_ORBS_SPAWNED} total`;
    }
}
/**
 * Create an alert describing how to play.
 */
function showInstructions() {
    alert("When the puzzle begins, the four glyphs will activate in a randomly determined sequence.\n\n" +
        "Click to move the player, indicated by the blue square, to the correct quadrant of the arena to avoid taking damage.\n\n" +
        "Your performance is tracked in the statistics below.");
}
/**
 * Create an alert describing what each setting does.
 */
function showSettings() {
    alert("Double Trouble: When enabled, moving to a new location will spawn a magical orb on your previous location. " +
        "Moving on top of a magical orb will result in damage taken.\n\n" +
        "Feeling Special: When enabled, increases the speed of the memory blast. " +
        "If Double Trouble is also enabled, an additional magical orb will spawn one tile ahead of your character.\n\n" +
        "Active Glyphs: Choose how many glyphs will activate in the sequence (4-6). " +
        "In game, this scales based on Akkha's path level. At level 2, it is set to 5. At level 4, it is set to 6.");
}
/**
 * Create an alert describing what the game buttons do.
 */
function showHelp() {
    alert("Start: Starts the memory blast.\n\n" +
        "Restart: Restarts the same memory blast from the beginning.\n\n" +
        "New Pattern: Starts the memory blast with a new pattern.");
}
/// ------------------------------------------------------------------------------------------------
/// Render Helpers
/// ------------------------------------------------------------------------------------------------
/**
 * Draws the initial state of the arena.
 */
function initialRender() {
    drawArena();
    // highlightGrid();
    drawGlyph(FIRE_GLYPH);
    drawGlyph(SHADOW_GLYPH);
    drawGlyph(ICE_GLYPH);
    drawGlyph(LIGHTNING_GLYPH);
    DEFAULT_ARENA_STATE_FULL = ctx.getImageData(0, 0, canvas.width, canvas.height);
    FIRE_QUADRANT.image = ctx.getImageData(0, 0, HALF_WIDTH, HALF_HEIGHT);
    SHADOW_QUADRANT.image = ctx.getImageData(HALF_WIDTH, 0, HALF_WIDTH, HALF_HEIGHT);
    ICE_QUADRANT.image = ctx.getImageData(0, HALF_HEIGHT, HALF_WIDTH, HALF_HEIGHT);
    LIGHTNING_QUADRANT.image = ctx.getImageData(HALF_WIDTH, HALF_HEIGHT, HALF_WIDTH, HALF_HEIGHT);
    highlightTile(PLAYER, PLAYER_TILE_STROKE);
}
/**
 * Renders the current game tick.
 */
function renderTick() {
    drawQuadrant(FIRE_QUADRANT);
    drawQuadrant(SHADOW_QUADRANT);
    drawQuadrant(ICE_QUADRANT);
    drawQuadrant(LIGHTNING_QUADRANT);
    drawGlyph(FIRE_GLYPH);
    drawGlyph(SHADOW_GLYPH);
    drawGlyph(ICE_GLYPH);
    drawGlyph(LIGHTNING_GLYPH);
    // TODO: Deletion of magical orbs doesn't render properly.
    // Need to redraw the arena state...
    for (const [pos, orb] of MAGICAL_ORBS) {
        if (orb) {
            // Have to adjust by half a tile to center the orb properly.
            let newPos = Point.fromKey(pos);
            newPos.x += 0.5;
            newPos.y += 0.5;
            drawCircle(newPos, 0.45, orb.fill);
        }
    }
    highlightTile(PLAYER, PLAYER_TILE_STROKE);
}
/**
 * Draws the arena on the canvas.
 */
function drawArena() {
    drawCircle(ORIGIN, ARENA_OUTER_RADIUS, ARENA_OUTER_FILL);
    drawCircle(ORIGIN, ARENA_MIDDLE_RADIUS, ARENA_MIDDLE_FILL_BLUE);
    drawCircle(ORIGIN, ARENA_INNER_RADIUS, ARENA_INNER_FILL);
    drawTriangle(new Point(10, 0), new Point(9.4, 10), new Point(10, 10), ARENA_STAR_FILL);
    drawTriangle(new Point(10, 0), new Point(10.6, 10), new Point(10, 10), ARENA_STAR_FILL);
    drawTriangle(new Point(10, 10), new Point(9.4, 10), new Point(10, 20), ARENA_STAR_FILL);
    drawTriangle(new Point(10, 10), new Point(10.6, 10), new Point(10, 20), ARENA_STAR_FILL);
    drawTriangle(new Point(0, 10), new Point(10, 9.4), new Point(10, 10), ARENA_STAR_FILL);
    drawTriangle(new Point(0, 10), new Point(10, 10.6), new Point(10, 10), ARENA_STAR_FILL);
    drawTriangle(new Point(10, 10), new Point(10, 9.4), new Point(20, 10), ARENA_STAR_FILL);
    drawTriangle(new Point(10, 10), new Point(10, 10.6), new Point(20, 10), ARENA_STAR_FILL);
}
/**
 * Draws a quadrant of the arena on the canvas.
 *
 * @param q                   The Quadrant to draw.
 */
function drawQuadrant(q) {
    // Construct quarter-circle.
    ctx.beginPath();
    ctx.moveTo(ORIGIN.xCoord, ORIGIN.yCoord);
    ctx.lineTo(q.vertex.xCoord, q.vertex.yCoord);
    ctx.arc(ORIGIN.xCoord, ORIGIN.yCoord, ARENA_OUTER_RADIUS * TILE_SIZE, q.start, q.end, true);
    ctx.lineTo(ORIGIN.xCoord, ORIGIN.yCoord);
    if (q.isActive) {
        ctx.fillStyle = q.quadrantFill;
        ctx.fill();
    }
    else {
        if (q.image) {
            ctx.putImageData(q.image, q.origin.xCoord, q.origin.yCoord);
        }
    }
}
/**
 * Draws a glyph.
 *
 * @param g                   The glyph to draw.
 */
function drawGlyph(g) {
    // Draw the glyphs.
    // TODO: Replace with images when available, but for now just scuffed placeholders.
    let fill = g.isActive ? g.activeFill : g.inactiveFill;
    drawSquare(g.pos, 1, fill);
}
/**
 * Draws a circle.
 *
 * @param pos                 The center of the circle in tiles.
 * @param r                   The radius of the circle in tiles.
 * @param fill                The color with which to fill the circle.
 */
function drawCircle(pos, r, fill) {
    ctx.beginPath();
    ctx.arc(pos.xCoord, pos.yCoord, r * TILE_SIZE, 0, 2 * Math.PI, false);
    ctx.fillStyle = fill;
    ctx.fill();
}
/**
 *
 * @param pos                 The position of the square in tiles.
 * @param s                   The side length of the square in tiles.
 * @param fill                The color with which to fill the circle.
 */
function drawSquare(pos, s, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(pos.xCoord, pos.yCoord, s * TILE_SIZE, s * TILE_SIZE);
}
/**
 * Draws a triangle.
 *
 * @param pos1                The position of the first vertex in tiles.
 * @param pos2                The position of the second vertex in tiles.
 * @param pos3                The position of the third vertex in tiles.
 * @param fill                The color with which to fill the triangle.
 */
function drawTriangle(pos1, pos2, pos3, fill) {
    let path = new Path2D();
    path.moveTo(pos1.xCoord, pos1.yCoord);
    path.lineTo(pos2.xCoord, pos2.yCoord);
    path.lineTo(pos3.xCoord, pos3.yCoord);
    ctx.fillStyle = fill;
    ctx.fill(path);
}
/**
 * Draws the given string on the screen as text.
 *
 * @param s                   The text to draw.
 */
function drawText(s) {
    ctx.font = "18px serif";
    ctx.fillText(s, 0, 0);
}
/**
 * Highlights all tiles.
 */
function highlightGrid() {
    for (let i = 0; i < ARENA_OUTER_RADIUS * 2; i++) {
        for (let j = 0; j < ARENA_OUTER_RADIUS * 2; j++) {
            highlightTile(new Point(i, j), GRID_TILE_STROKE);
        }
    }
}
/**
 * Highlights a tile.
 *
 * @param pos                 The Point representing the tile to highlight.
 * @param stroke              The stroke color.
 */
function highlightTile(pos, stroke) {
    ctx.strokeStyle = stroke;
    ctx.strokeRect(pos.xCoord, pos.yCoord, 1 * TILE_SIZE, 1 * TILE_SIZE);
}
/// ------------------------------------------------------------------------------------------------
/// Game Helpers
/// ------------------------------------------------------------------------------------------------
/**
 * Starts the memory blast.
 */
function start() {
    if (PATTERN.length == 0) {
        generate();
    }
    TICK_COUNT = 0;
    TICK_TIMER = setInterval(tick, TICK_DURATION);
}
function restart() {
    resetVars();
    start();
}
/** Starts a new memory blast puzzle. */
function newPattern() {
    resetVars();
    generate();
    start();
}
/**
 * Generates a random order in which glyphs will turn active.
 *
 * Populates the two global arrays, PATTERN and SEQUENCE.
 * - PATTERN contains the ordering the glyphs and nothing more.
 * - SEQUENCE details exactly how each game tick is played out, given the ordering in PATTERN.
 */
function generate() {
    PATTERN.length = 0;
    SEQUENCE.length = 0;
    let dtInput = document.getElementById("dt");
    let fsInput = document.getElementById("fs");
    let agInput = document.getElementById("ag");
    DOUBLE_TROUBLE = dtInput.checked;
    FEELING_SPECIAL = fsInput.checked;
    NUM_ACTIVE_GLYPHS = Number(agInput.value);
    TOTAL_NUM_ACTIVE_GLYPHS += NUM_ACTIVE_GLYPHS;
    // Start with some empty events to give the player time to adjust.
    SEQUENCE.push(EventType.Empty);
    SEQUENCE.push(EventType.Empty);
    let glyphEvent;
    let prevEvent = EventType.Empty;
    for (let i = 1; i <= NUM_ACTIVE_GLYPHS; i++) {
        glyphEvent = randGlyphEvent(prevEvent);
        PATTERN.push(glyphEvent);
        // Add events for the glyphs lighting up.
        // Each glyph will light up for 2 ticks to show the order to the player.
        // If Feeling Special is active, the memory blasts will start at
        // the same time as the final glyph lighting up.
        SEQUENCE.push(glyphEvent);
        SEQUENCE.push(EventType.Reset);
        // TODO: Technically this is wrong. Maybe could do a bitmap for the event IDs.
        if (FEELING_SPECIAL && i == NUM_ACTIVE_GLYPHS) {
            SEQUENCE.pop();
        }
        prevEvent = glyphEvent;
    }
    // Add empty events to signify the brief cooldown window between the final glyph lighting up
    // and the first blast. When Feeling Special is active, this cooldown window is shortened from
    // 2 ticks to 0 ticks.
    if (FEELING_SPECIAL) {
        SEQUENCE.push(EventType.Empty);
    }
    else {
        SEQUENCE.push(EventType.Empty);
        SEQUENCE.push(EventType.Empty);
    }
    // Add events to signify the blasts. When Feeling Special is active, the cooldown window
    // between consecutive blasts is shortened from 4 ticks to 2 ticks.
    for (let j = 0; j < PATTERN.length; j++) {
        glyphEvent = PATTERN[j];
        switch (glyphEvent) {
            case EventType.FireGlyphActive:
                SEQUENCE.push(EventType.FireQuadrantStage1);
                if (FEELING_SPECIAL) {
                    SEQUENCE.push(EventType.FireQuadrantStage2);
                }
                else {
                    SEQUENCE.push(EventType.FireQuadrantStage2);
                    SEQUENCE.push(EventType.FireQuadrantStage2);
                }
                break;
            case EventType.ShadowGlyphActive:
                SEQUENCE.push(EventType.ShadowQuadrantStage1);
                if (FEELING_SPECIAL) {
                    SEQUENCE.push(EventType.ShadowQuadrantStage2);
                }
                else {
                    SEQUENCE.push(EventType.ShadowQuadrantStage2);
                    SEQUENCE.push(EventType.ShadowQuadrantStage2);
                }
                break;
            case EventType.IceGlyphActive:
                SEQUENCE.push(EventType.IceQuadrantStage1);
                if (FEELING_SPECIAL) {
                    SEQUENCE.push(EventType.IceQuadrantStage2);
                }
                else {
                    SEQUENCE.push(EventType.IceQuadrantStage2);
                    SEQUENCE.push(EventType.IceQuadrantStage2);
                }
                break;
            case EventType.LightningGlyphActive:
                SEQUENCE.push(EventType.LightningQuadrantStage1);
                if (FEELING_SPECIAL) {
                    SEQUENCE.push(EventType.LightningQuadrantStage2);
                }
                else {
                    SEQUENCE.push(EventType.LightningQuadrantStage2);
                    SEQUENCE.push(EventType.LightningQuadrantStage2);
                }
                break;
        }
    }
    // Ends the game.
    SEQUENCE.push(EventType.End);
}
/**
 * Resets the memory blast to its initial state, paused.
 */
function resetVars() {
    clearInterval(TICK_TIMER);
    TICK_COUNT = 0;
    ctx.putImageData(DEFAULT_ARENA_STATE_FULL, 0, 0);
    FIRE_QUADRANT.isActive = false;
    SHADOW_QUADRANT.isActive = false;
    ICE_QUADRANT.isActive = false;
    LIGHTNING_QUADRANT.isActive = false;
    CURR_NUM_GLYPHS_PASSED = 0;
    CURR_NUM_GLYPHS_FAILED = 0;
    CURR_NUM_ORBS_TANKED = 0;
    CURR_NUM_ORBS_SPAWNED = 0;
    TOTAL_NUM_ACTIVE_GLYPHS = 0;
    TOTAL_NUM_GLYPHS_PASSED = 0;
    TOTAL_NUM_GLYPHS_FAILED = 0;
    TOTAL_NUM_ORBS_SPAWNED = 0;
    TOTAL_NUM_ORBS_TANKED = 0;
    PLAYER.x = 10;
    PLAYER.y = 10;
    TARGET.x = 10;
    TARGET.y = 10;
    MAGICAL_ORBS.clear();
}
/**
 * Advances the memory blast forward by one game tick.
 */
function tick() {
    // If the pattern has been fully iterated over, then the memory blast is done.
    if (TICK_COUNT >= SEQUENCE.length) {
        clearInterval(TICK_TIMER);
        printStats();
    }
    // Reset graphic to default state.
    if (IS_MAGICAL_ORB_DELETED) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        IS_MAGICAL_ORB_DELETED = false;
    }
    ctx.putImageData(DEFAULT_ARENA_STATE_FULL, 0, 0);
    // Render target tile highlight before updating positions.
    highlightTile(TARGET, TARGET_TILE_STROKE);
    // Update state.
    updatePositions();
    advanceMemoryBlast();
    // Check for damage.
    if (DOUBLE_TROUBLE) {
        if (isDamagedByMagicalOrb()) {
            CURR_NUM_ORBS_TANKED += 1;
            TOTAL_NUM_ORBS_TANKED += 1;
        }
        deleteMagicalOrbs();
    }
    if (isDamagedByMemoryBlast()) {
        CURR_NUM_GLYPHS_FAILED += 1;
        TOTAL_NUM_GLYPHS_FAILED += 1;
    }
    else if (isPassedMemoryBlast()) {
        CURR_NUM_GLYPHS_PASSED += 1;
        TOTAL_NUM_GLYPHS_PASSED += 1;
    }
    // Render.
    renderTick();
    // Advance internal tick counter.
    TICK_COUNT += 1;
}
/**
 * Advances the memory blast state.
 * Mapping from integer to game event is defined here.
 */
function advanceMemoryBlast() {
    let event = SEQUENCE[TICK_COUNT];
    switch (event) {
        case EventType.FireGlyphActive:
            FIRE_GLYPH.isActive = true;
            SHADOW_GLYPH.isActive = false;
            ICE_GLYPH.isActive = false;
            LIGHTNING_GLYPH.isActive = false;
            GLYPH_SFX_1.play();
            break;
        case EventType.ShadowGlyphActive:
            FIRE_GLYPH.isActive = false;
            SHADOW_GLYPH.isActive = true;
            ICE_GLYPH.isActive = false;
            LIGHTNING_GLYPH.isActive = false;
            GLYPH_SFX_2.play();
            break;
        case EventType.IceGlyphActive:
            FIRE_GLYPH.isActive = false;
            SHADOW_GLYPH.isActive = false;
            ICE_GLYPH.isActive = true;
            LIGHTNING_GLYPH.isActive = false;
            GLYPH_SFX_3.play();
            break;
        case EventType.LightningGlyphActive:
            FIRE_GLYPH.isActive = false;
            SHADOW_GLYPH.isActive = false;
            ICE_GLYPH.isActive = false;
            LIGHTNING_GLYPH.isActive = true;
            GLYPH_SFX_4.play();
            break;
        case EventType.FireQuadrantStage1:
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = true;
            ICE_QUADRANT.isActive = true;
            LIGHTNING_QUADRANT.isActive = true;
            BLAST_SFX_1.play();
            break;
        case EventType.FireQuadrantStage2:
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            break;
        case EventType.ShadowQuadrantStage1:
            FIRE_QUADRANT.isActive = true;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = true;
            LIGHTNING_QUADRANT.isActive = true;
            BLAST_SFX_2.play();
            break;
        case EventType.ShadowQuadrantStage2:
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            break;
        case EventType.IceQuadrantStage1:
            FIRE_QUADRANT.isActive = true;
            SHADOW_QUADRANT.isActive = true;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = true;
            BLAST_SFX_3.play();
            break;
        case EventType.IceQuadrantStage2:
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            break;
        case EventType.LightningQuadrantStage1:
            FIRE_QUADRANT.isActive = true;
            SHADOW_QUADRANT.isActive = true;
            ICE_QUADRANT.isActive = true;
            LIGHTNING_QUADRANT.isActive = false;
            BLAST_SFX_4.play();
            break;
        case EventType.LightningQuadrantStage2:
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            break;
        case EventType.Reset:
            FIRE_GLYPH.isActive = false;
            SHADOW_GLYPH.isActive = false;
            ICE_GLYPH.isActive = false;
            LIGHTNING_GLYPH.isActive = false;
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            break;
        case EventType.End:
            FIRE_GLYPH.isActive = false;
            SHADOW_GLYPH.isActive = false;
            ICE_GLYPH.isActive = false;
            LIGHTNING_GLYPH.isActive = false;
            FIRE_QUADRANT.isActive = false;
            SHADOW_QUADRANT.isActive = false;
            ICE_QUADRANT.isActive = false;
            LIGHTNING_QUADRANT.isActive = false;
            MAGICAL_ORBS.clear();
            break;
        case EventType.Empty:
        default:
            break;
    }
}
/**
 * Determines whether the player receives damage from a magical orb.
 *
 * @returns true if there is at least one magical orb on the same tile as the player, else false.
 */
function isDamagedByMagicalOrb() {
    return MAGICAL_ORBS.has(PLAYER.toKey());
}
/**
 * Determines whether the player has passed a single glyph's memory blast.
 *
 * @returns true if the player has passed a glyph's memory blast.
 */
function isPassedMemoryBlast() {
    let currEvent = SEQUENCE[TICK_COUNT];
    let prevEvent = SEQUENCE[TICK_COUNT - 1];
    return (currEvent != prevEvent) && (MEMORY_BLAST_EVENTS.has(currEvent));
}
/**
 * Determines whether the player receives damage from the memory blast.
 */
function isDamagedByMemoryBlast() {
    return QUADRANTS.some(q => (q.isActive && q.contains(PLAYER)));
}
/**
 * Moves the player from its current position to TARGET by 1 tick.
 */
function updatePositions() {
    if (!TARGET) {
        return;
    }
    let initX = PLAYER.x;
    let initY = PLAYER.y;
    let deltaX = TARGET.x - PLAYER.x;
    let deltaY = TARGET.y - PLAYER.y;
    // Move the player, up to 2 tiles per tick.
    deltaX = (Math.abs(deltaX) <= 2) ? deltaX : (deltaX % 2) ? 1 : 2;
    deltaY = (Math.abs(deltaY) <= 2) ? deltaY : (deltaY % 2) ? 1 : 2;
    PLAYER.x += deltaX;
    PLAYER.y += deltaY;
    if (DOUBLE_TROUBLE) {
        spawnMagicalOrbs(initX, initY, deltaX, deltaY);
    }
}
/**
 * Spawns magical orbs based on the player's destination tile. Orbs last for 6 ticks.
 *
 * @param initX               The initial x-coordinate of the player's position.
 * @param initY               The initial y-coordinate of the player's position.
 * @param deltaX              The distance that the player travels in the x direction.
 * @param deltaY              The distance that the player travels in the y direction.
 */
function spawnMagicalOrbs(initX, initY, deltaX, deltaY) {
    let pos;
    let quad;
    // Only spawn the basic magical orb when the player has moved.
    if (deltaX != 0 || deltaY != 0) {
        pos = new Point(initX, initY);
        quad = Quadrant.getQuadrant(pos);
        MAGICAL_ORBS.set(pos.toKey(), new MagicalOrb(pos, quad.orbFill));
        CURR_NUM_ORBS_SPAWNED += 1;
        TOTAL_NUM_ORBS_SPAWNED += 1;
        // When Feeling Special is enabled, spawns an additional orb in front of the player.
        // * Diagonal movement: Increment both x and y to place one tile ahead.
        // * Straight movement: Increment the non-zero dimension.
        // * L-shaped movement: Increment both x and y to place one tile ahead.
        if (FEELING_SPECIAL) {
            // If the magnitude of delta is equal to 2, then reduce to 1.
            deltaX += (Math.abs(deltaX) == 2) ? ((deltaX > 0) ? -1 : 1) : 0;
            deltaY += (Math.abs(deltaY) == 2) ? ((deltaY > 0) ? -1 : 1) : 0;
            pos = new Point(PLAYER.x + deltaX, PLAYER.y + deltaY);
            quad = Quadrant.getQuadrant(pos);
            MAGICAL_ORBS.set(pos.toKey(), new MagicalOrb(pos, quad.orbFill));
            CURR_NUM_ORBS_SPAWNED += 1;
            TOTAL_NUM_ORBS_SPAWNED += 1;
        }
    }
}
/**
 * Deletes magical orbs that should be cleaned up.
 */
function deleteMagicalOrbs() {
    // If the player occupies the same tile as a magical orb, the player takes
    // damage and the orb should be deleted.
    if (MAGICAL_ORBS.has(PLAYER.toKey())) {
        MAGICAL_ORBS.delete(PLAYER.toKey());
        IS_MAGICAL_ORB_DELETED = true;
    }
    // Magical orbs should expire after being active for 6 ticks.
    let toDelete = [];
    for (const [pos, orb] of MAGICAL_ORBS) {
        if (orb && orb.spawnTick == TICK_COUNT - 6) {
            toDelete.push(pos);
        }
    }
    for (const pos of toDelete) {
        MAGICAL_ORBS.delete(pos);
    }
    IS_MAGICAL_ORB_DELETED = IS_MAGICAL_ORB_DELETED || toDelete.length > 0;
}
/// ------------------------------------------------------------------------------------------------
/// Util
/// ------------------------------------------------------------------------------------------------
/**
 * Returns a randomly chosen EventType of a glyph activating, given the previous EventType.
 *
 * @param excl                A single EventType to exclude from the random range.
 * @returns the random EventType.
 */
function randGlyphEvent(excl) {
    // Build a deep copy of GLYPH_EVENTS so we don't modify it.
    let validGlyphs = JSON.parse(JSON.stringify(GLYPH_EVENTS));
    // Consecutive glyphs may not repeat and must be adjacent to each other on the arena.
    let i;
    switch (excl) {
        case EventType.FireGlyphActive:
        case EventType.LightningGlyphActive:
            i = validGlyphs.indexOf(EventType.FireGlyphActive);
            validGlyphs.splice(i, 1);
            i = validGlyphs.indexOf(EventType.LightningGlyphActive);
            validGlyphs.splice(i, 1);
            break;
        case EventType.ShadowGlyphActive:
        case EventType.IceGlyphActive:
            i = validGlyphs.indexOf(EventType.IceGlyphActive);
            validGlyphs.splice(i, 1);
            i = validGlyphs.indexOf(EventType.ShadowGlyphActive);
            validGlyphs.splice(i, 1);
            break;
    }
    let j = Math.floor(Math.random() * validGlyphs.length);
    return validGlyphs[j];
}
