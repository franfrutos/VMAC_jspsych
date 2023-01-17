// Script with functions to create trial timeline and stimulus:

/*
    Most of these function are a implementation from opensesame's function to calculate positions:
    https://github.com/open-cogsci/OpenSesame/blob/58dc9ffee3e9e19325e3302d6ae9d12764d5a8d7/libopensesame/python_workspace_api.py

    Functions to draw_display:
*/


const radians = (degrees) => {return degrees * (Math.PI/180)}
const xy_from_polar = (phi, rho) => {

    // This function assume that the pole is at the coordenates [0, 0]
    if (typeof(rho) === "undefined") return;

    const phi0 = radians(phi);
    const x = rho * Math.cos(phi0);
    const y = rho * Math.sin(phi0);

    return [x, y];

}

const xy_circle = (rho, n = 6, phi0 = 30) => {
    const arr = [];
    let phi = phi0;

    for (let i = 0; i < n; i++) {
        arr.push(xy_from_polar(phi, rho))
        phi += 360/n
    }

    return arr;
}

const draw_line = (length, width, angle, x, y) => {
    return {
        obj_type: 'line',
        line_length: length,
        line_width: width,
        angle: angle,
        line_color: 'white', 
        origin_center: true,
        show_start_time: 1200,
        startX: x,
        startY: y,
    };
}
const draw_cross = (radius, line_w) => {
    return [{
        obj_type: 'line',
        line_length: radius,
        line_width: line_w,
        angle: 0,
        line_color: 'white', 
        origin_center: true,
    }, {
        obj_type: 'line',
        line_length: radius,
        line_width: line_w,
        angle: 90,
        line_color: 'white', 
        origin_center: true,
    }];

}

const draw_circle = (radius, line_w, color, x, y) => {
    return {
        obj_type: 'circle',
        radius: radius,
        line_width: line_w,
        line_color: color,
        show_start_time: 1200,
        origin_center: true,
        startX: x,
        startY: y,
    };
}

const draw_diamond = (length, line_w, color, x, y) => {
    return {
        obj_type: 'manual',
        startX: x,
        startY: y - length/2,
        origin_center: true,
        show_start_time: 1200,
        drawFunc: (stimulus, canvas, context, elapsedTime, sumOfStep, length0 = length, width = line_w, color0 = color) => {
            context.beginPath();
        
            [x, y] = [stimulus.currentX, stimulus.currentY]
            context.moveTo(x, y);
                    
                    // top left edge
            context.lineTo(x - length0/2,  y + length0/2);
                    
                    // bottom left edge
            context.lineTo(x, y + length0);
                    
                    // bottom right edge
            context.lineTo(x + length0/2, y + length0/2);
                    
                    // closing the path automatically creates
                    // the top right edge
            context.closePath();
            context.linewidth = line_w;
            context.strokeStyle = color0;
            context.stroke();
                    
        },
    }
};

const create = (shape, radius, width, color, x, y, orientation) => {
    if (shape == "diamond") {
        return [draw_diamond(radius*2, width, color, x, y), draw_line(radius, width, orientation, x, y)];
    } else {
        return [draw_circle(radius, width, color, x, y), draw_line(radius, width, orientation, x, y)];
    }
}

const set_attributes = (s, colors, targetOri) => {
    // Clarification: as return is used, breaks are not necessary
    const actualOri = (targetOri === "vertical") ? 90 : 0;
    switch(s) {
        case 0: 
            return ["circle", color2hex("gray"), shuffle([45, 135, 225, 315])[0]]
        case 1:
            return ["circle", color2hex(colors[0]), shuffle([45, 135, 225, 315])[0]]
        case 2: 
            return ["diamond", color2hex("gray"), actualOri]
        default:
            return ["circle", color2hex(colors[1]), shuffle([45, 135, 225, 315])[0]]
    }
}

const draw_display = (radius, width, rho, log, colors, targetOri) => {

    const arr = [];

    arr.push(...draw_cross(radius, width));

    const coordinates = xy_circle(rho); 
    
    let stimuli, x, y;

    for (let i = 0; i < 6; i++) {

        [x, y] = coordinates[i];

        // Non-singleton distractor shape and color
        attributes = set_attributes(log[i], colors, targetOri)

        stimuli = create(attributes[0], radius, width, attributes[1], x, y, attributes[2]);

        arr.push(...stimuli);
    }

    return arr;
}

// Functions to create trials:

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const random = (min, max, no) => {
    let rnum = Math.floor(Math.random() * (max - min)) + min;
    if (typeof no !== 'undefined'){
        while (no.indexOf(rnum) >= 0) {
            rnum = Math.floor(Math.random() * (max - min)) + min;
        }
    }
    return rnum;
}

const zeros  = (m, n) => {
    return Array.from({
        length: m
    }, 
    () => new Array(n).fill(0));
}

// Pick colors
const counterbalance = random(0, 4);
const pickColor = (counterbalance) => {
    switch(counterbalance) {
        case 0:
            return ["orange", "blue"];
        case 1:
            return ["blue", "orange"];
        case 2: 
            return ["green", "pink"]
        default:
            return ["pink", "green"]
    }
}

// Colors from: https://osf.io/6jhbt
const color2hex = (color) => {
    switch(color) {
        case "gray":
            return "#464646";
        case "pink":
            return "#C26187";
        case "green":
            return "#369141";
        case "orange":
            return "#C15F1E";
        default:
            return "#258DA5";
            
    }
}



// Experiment structure

    /* Coding scheme for the relevant shape target/singleton color:
        0: distractor, non-singleton
        1: singleton, high
        2: target
        3: singleton, low
    */

// TODO: Convertir esto en una función, siendo el parámetro el número de bloques, y las fases.
//       Crear un objeto para definir los ensayos de práctica.

const create_trials = (blocks, norew, prac = true) => {
    // Check all experiment text
    if (blocks == 0) return;
    // How many trials per phase?
    let distractorAbsent, distractorHigh, distractorLow, conditionLog, trials;
    const phases = ["Practice", "Reward", norew];
    let phaseLog = {};
    for (let phase of phases) {
        if (!prac && phase == "Practice") continue;
        phaseLog[phase] = [];
    }
    for (let j of Object.keys(phaseLog)) {
        conditionLog = [];
        for (let i = 0; i < blocks; i++) {
            if (j == "Practice" && i === 0) {
                distractorAbsent = zeros(Math.floor(24), 6); // Singleton Absent
                for (let i = 0; i < distractorAbsent.length; i++){
                    distractorAbsent[i][random(0, 6)] = 2;
                }
                conditionLog = distractorAbsent;
                break;
            }
            distractorHigh = zeros(Math.floor(10), 6); //High-value
            distractorLow = zeros(Math.floor(10), 6); // Low-value
            distractorAbsent = zeros(Math.floor(4), 6); // Singleton Absent
        
        
            // Filling distractor absent with targets (2s = target):
            for (let i = 0; i < distractorAbsent.length; i++){
                distractorAbsent[i][random(0, 6)] = 2;
            }
        
            // Filling distractactor High (1s = singleton high; 2s = target):
            for (let i = 0; i < distractorHigh.length; i++){
                distractorHigh[i][random(0, 6)] = 2;
                distractorHigh[i][random(0, 6, [distractorHigh[i].indexOf(2)])] = 1;
            }
        
            // Filling distractor low (3s = singleton low; 2s = target):
            for (let i = 0; i < distractorLow.length; i++){
                distractorLow[i][random(0, 6)] = 2;
                distractorLow[i][random(0, 6, [distractorLow[i].indexOf(2)])] = 3;
            }
        
            // Combining the arrays and randomize order:
            conditionLog = shuffle(conditionLog.concat(
                distractorAbsent,
                distractorHigh,
                distractorLow
                ));
        }
        phaseLog[j].push(conditionLog);
    }
    
    // Object with the final structure:
    let phaseTrialLog = {};
    for (let phase of Object.keys(phaseLog)) {
        phaseTrialLog[phase] = [].concat(...phaseLog[phase]);
    }
    
    // Setting timeline array
    let trialto = {};
    for (let phase of Object.keys(phaseLog)) {
        trialto[phase] = [];
    }

    const getSing = (j, i) => {
        let conds = (j == "Reversal")? ["Low", "High"]: ["High", "Low"];
        if (phaseTrialLog[j][i].indexOf(1) > -1) return [phaseTrialLog[j][i].indexOf(1), conds[0]];
        if (phaseTrialLog[j][i].indexOf(3) > -1) return [phaseTrialLog[j][i].indexOf(3), conds[1]];
        return [-1, "Absent"];
    }
    for (let j of Object.keys(trialto)) {
        trials = (j == "Practice")? 24: 24*blocks;
        for (let i = 0; i < trials; i++){
            trialto[j].push({
                trialLog: phaseTrialLog[j][i],
                targetPos: phaseTrialLog[j][i].indexOf(2),
                singPos: getSing(j, i)[0],
                orientation: shuffle(["horizontal", "vertical"])[0],
                condition: getSing(j, i)[1],
                Phase: j,
                counterbalance: counterbalance,
                colors: pickColor(counterbalance),
            })
        }
    }
    return trialto;
}

// Esto debe estar determinado por una variable de url


// Function to compute the amount of points earned in each trial
const compute_points = (rt, condition, phase) => {
    if (rt === null || phase == "Practice" || phase == "Devaluation") return 0
    const bonus = (condition == "High" && phase != "Extinction")? 1: .1;
    const points = Math.floor((1000 - rt) * bonus)
    if (points < 0) return 0;
    return points
}

// Function to translate colors to spanish
const colors_t = (color) => {
    if (color == "orange") return `<span style = "color:${color2hex(color)}">naranja</span>`
    if (color == "blue") return `<span style = "color:${color2hex(color)}">azul</span>`
    if (color == "green") return `<span style = "color:${color2hex(color)}">verde</span>`
    return `<span style = "color:${color2hex(color)}">rosa</span>`
}

// Function that formate numbers
// Modified from: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const formatting = (x) => {
    x = x.split(".");
    inte = x[0].replace(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    decimal = (x[1] !== undefined)? `.${x[1]}` : "";
    return inte + decimal;
}

const capitalize = (string) => {
    let lower = string.toLowerCase();
    return lower[0].toUpperCase() + lower.slice(1);
}

// Initialize jsPsych
const jsPsych = initJsPsych({

});

const urlvar = jsPsych.data.urlVariables();
const norew = (urlvar.phase != undefined && ["Reversal", "Devaluation"].includes(capitalize(urlvar.phase)))? capitalize(urlvar.phase): "Extinction";
const blocks = (Number(urlvar.blocks) == 0)? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined)? false : urlvar.prac != "false" && true;
if (urlvar.phase == undefined) console.log("No phase parameter used. Default is Extinction.")
else if (!["Reversal", "Devaluation"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used. Phase has been set to Extinction.`);

console.log(`Experiment Parameters
Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}`);

const trialObj = create_trials(blocks, norew, prac);
const [colorHigh, colorLow] = (blocks != 0)? trialObj["Reward"][1].colors: ["orange", "blue"];

