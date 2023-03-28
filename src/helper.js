// Script with functions to create trial timeline and stimulus:

/*
    Most of these function are a implementation from opensesame's function to calculate positions:
    https://github.com/open-cogsci/OpenSesame/blob/58dc9ffee3e9e19325e3302d6ae9d12764d5a8d7/libopensesame/python_workspace_api.py

    Functions to draw_display:
*/


const radians = (degrees) => { return degrees * (Math.PI / 180) }
const xy_from_polar = (phi, rho) => {

    // This function assume that the pole is at the coordenates [0, 0]
    if (typeof (rho) === "undefined") return;

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
        phi += 360 / n
    }

    return arr;
}

/* 
TODO: Hacer variable la presentación de los estímulos para la tarea de WM.

En los experimentos de WM metíamos un jitter para la primera presentación de los estímulos:
    300 - 600 milisegundos con el punto de fijación (jitter 1),
    después del encoding entre 1000 - 1500 ms (jitter 2) hasta la presentación del array de test.
Habria que introducir estos jitters en el show start time
    El array de memoria se presentaría después del jitter 1 y desaparecería en jitter 1 + 500 ms.
    El array de test aparecería en jitter 1 + 500 ms + jitter 2 y desaparecería en jitter 1 + 500 ms + jitter 2 + 3000 ms
*/

const draw_line = (length, width, angle, x, y, jitters) => {
    if (jitters) {
        return {
            obj_type: 'line',
            line_length: length,
            line_width: width,
            angle: angle,
            line_color: 'white',
            origin_center: true,
            show_start_time: jitters[0],
            show_end_time: (jitters.length > 1)? jitters[1]: null,
            startX: x,
            startY: y,
        };
    }
    return {
        obj_type: 'line',
        line_length: length,
        line_width: width,
        angle: angle,
        line_color: 'white',
        origin_center: true,
        show_start_time: 1700,
        startX: x,
        startY: y,
    };
}
const draw_cross = (radius, line_w, jitters) => {
    if (jitters) {
        return [{
            obj_type: 'line',
            line_length: radius / 2,
            line_width: line_w,
            angle: 0,
            show_start_time: 1000,
            line_color: 'white',
            origin_center: true,
        },
        {
            obj_type: 'line',
            line_length: radius / 2,
            line_width: line_w,
            angle: 90,
            show_start_time: 1000,
            line_color: 'white',
            origin_center: true,
        }];   
    }
    return [{
        obj_type: 'line',
        line_length: radius / 2,
        line_width: line_w,
        angle: 0,
        line_color: 'white',
        show_start_time: 1200,
        origin_center: true,
    },
    {
        obj_type: 'line',
        line_length: radius / 2,
        line_width: line_w,
        angle: 90,
        line_color: 'white',
        show_start_time: 1200,
        origin_center: true,
    }];

}

const draw_circle = (radius, line_w, color, x, y, jitters) => {
    if (jitters) {
        return {
            obj_type: 'circle',
            radius: radius,
            line_width: line_w,
            line_color: color,
            show_start_time: jitters[0],
            show_end_time: (jitters.length > 1)? jitters[1]: null,
            origin_center: true,
            startX: x,
            startY: y,
        };
    }
    return {
        obj_type: 'circle',
        radius: radius,
        line_width: line_w,
        line_color: color,
        show_start_time: 1700,
        origin_center: true,
        startX: x,
        startY: y,
    };
}

const draw_diamond = (length, line_w, color, x, y) => {
    return {
        obj_type: 'manual',
        startX: x,
        startY: y - length / 2,
        origin_center: true,
        show_start_time: 1700,
        drawFunc: (stimulus, canvas, context, elapsedTime, sumOfStep, length0 = length, width = line_w, color0 = color) => {
            context.beginPath();

            [x, y] = [stimulus.currentX, stimulus.currentY]
            context.moveTo(x, y);

            // top left edge
            context.lineTo(x - length0 / 2, y + length0 / 2);

            // bottom left edge
            context.lineTo(x, y + length0);

            // bottom right edge
            context.lineTo(x + length0 / 2, y + length0 / 2);

            // closing the path automatically creates
            // the top right edge
            context.closePath();

            context.lineWidth = width;
            context.strokeStyle = color0;
            context.stroke();

        },
    }
};

const create = (shape, radius, width, color, x, y, orientation, jitters = false, phase) => {
    if (shape == "diamond") {
        return [draw_diamond(radius * 2, width, color, x, y, jitters), draw_line(radius, width / 2, orientation, x, y, jitters)];
    } else {
        return [draw_circle(radius, width, color, x, y, jitters), draw_line(radius, width / 2, orientation, x, y, jitters)];
    }
}

const set_attributes = (s, colors, targetOri) => {
    // Clarification: as return is used, breaks are not necessary
    const actualOri = (targetOri === "vertical") ? 90 : 0;
    switch (s) {
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

const draw_display = (radius, width, rho, log, colors, targetOri, phase, condition, jitters) => {

        // Function to gather information about WM trials
        console.log(log);
        const getWM = (log, pos = false) => {
            let arrayPos;
            if (pos == "t") {
                for (let i = 1; i < 7; i++) {
                    arrayPos = log.indexOf(i);
                    if (arrayPos >= 0) return arrayPos;
                }
                return;
            } else if (pos == "d") {
                for (let i = 7; i < 9; i++) {
                    arrayPos = log.indexOf(i);
                    if (arrayPos >= 0) return arrayPos;
                }
                return -1;
            }
    
            let tmp = [];
            // Orientation
            if (log.some((r) => [1, 3, 4].includes(r))) tmp[0] = "Same"
            else tmp[0] = "Different"
    
            // Value
            if (log.some((r) => [3, 5, 7].includes(r))) tmp[1] = "High"
            else if (log.some((r) => [4, 6, 8].includes(r))) tmp[1] = "Low"
            else tmp[1] = "Absent"
    
            // Trial type
            if (log.some((r) => [3, 4, 5, 6].includes(r))) tmp[2] = "Target"
            else if (log.some((r) => [7, 8].includes(r))) tmp[2] = "Distractor"
            else tmp[2] = "Absent"
    
            return tmp;
    
        }

    const arr = [];

    arr.push(...draw_cross(radius, width / 2, jitters));

    const n_display = (!phase.includes("WM")) ? 6 : 4;
    const phi0 = (!phase.includes("WM")) ? 30 : 45;

    const coordinates = xy_circle(rho, n = n_display, phi = phi0);
    const coord_post_cue = xy_circle(rho*.4, n = n_display, phi = phi0);

    let stimuli, x, y, pos_s, pos_t, ori, new_colors, t1, memory_time, test_time, isi;


    if (phase.includes("WM")) {
        new_colors = shuffle(["red", "yellow", "green", "pink", "blue", "orange"].filter((c) => c != colors[0] & c != colors[1]));
        if (condition != "Absent") {
            pos_s = (getWM(log, "d") >= 0)? getWM(log, "d"): getWM(log, "t");
            new_colors[pos_s] = (condition == "High") ? colors[0] : colors[1];
        } else pos_s = -1
        pos_t = getWM(log, pos = "t");
        console.log("target:",pos_t, new_colors[pos_t]);
        console.log("Singleton pos:", pos_s, (pos_s>= 0)? new_colors[pos_s]: "none");
        console.log("Distractor:", getWM(log, "d"));
        console.log("Change:", targetOri);
        t1 = (phase == "WM_p1")? 3000: 500;
        isi = 1000;
        memory_time = [jitters[0] + isi, jitters[0] + t1 +isi];
        test_time = memory_time[1] + jitters[1];
    
    }

    for (let i = 0; i < n_display; i++) {

        [x, y] = coordinates[i];

        if (phase.includes("WM")) {
            ori =  shuffle([0, 45, 90, 135, 225, 315])[0];
            if (phase.includes("WM_p")) new_colors[i] = "gray"
            memory = create("circle", radius, width, new_colors[i], x, y, ori, jitters = memory_time);
            ori = (targetOri == "Same" & i == pos_t)? ori: random(-1, 2, [0])*90+ori;
            test = create("circle", radius, width, new_colors[i], x, y, ori, jitters = [test_time]);
            stimuli = [...memory, ...test]; // meter post_cue    
            if (pos_t == i) {
                post_cue = draw_line(radius*1.5, width/2, [45, 135, 225, 315][i], coord_post_cue[i][0], coord_post_cue[i][1], [test_time]);
                stimuli.push(post_cue); 
            }           
        } else {
            // Non-singleton distractor shape and color
            attributes = set_attributes(log[i], colors, targetOri, phase);

            stimuli = create(attributes[0], radius, width, attributes[1], x, y, attributes[2]);
        }

        arr.push(...stimuli);
    }

    console.log(stimuli);

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
    if (typeof no !== 'undefined') {
        while (no.indexOf(rnum) >= 0) {
            rnum = Math.floor(Math.random() * (max - min)) + min;
        }
    }
    return rnum;
}

const zeros = (m, n) => {
    return Array.from({
        length: m
    },
        () => new Array(n).fill(0));
}

// Pick colors
const pickColor = (counterbalance) => {
    switch (counterbalance) {
        case 0:
            return ["orange", "blue"];
        case 1:
            return ["blue", "orange"];
        case 2:
            return ["green", "pink"];
        case 3:
            return ["yellow", "red"];
        case 4:
            return ["red", "yellow"];
        default:
            return ["pink", "green"];
    }
}

// Colors from: https://osf.io/6jhbt
const color2hex = (color) => {
    switch (color) {
        case "gray":
            return "gray";
        case "pink":
            return "pink";
        case "green":
            return "green";
        case "orange":
            return "orange";
        case "blue":
            return "blue";
        case "red":
            return "red";
        default:
            return "yellow";
        }
    }

// Experiment structure

/* Coding scheme for the relevant shape target/singleton color in the VMAC phase:
    0: distractor, non-singleton
    1: singleton, high
    2: target
    3: singleton, low
*/

/* Coding scheme for the relevant color/trial_type/orientation combinations in the WM phase:

        0: new color, non-target
        1: new color, target same
        2: new color, target diff
        3: high target same
        4: low target same
        5: high target diff
        6: low target diff
        7: high diistractor 
        8: low distractor

        Relevant information to define trial structure:
            orientation: if 1 or 3 or 4 = target same; if 2 or 5 or 6 target diff
            value: if 3 or 5 or 7 = value high; if 4 or 6 or 8 value low; else none (1 or 2 present, but no more numbers in array) 
            trial type: if 3 or 4 or 5 or 6 = target; if 7 or 8 distractors; else none (1 or 2 present, but no more numbers in array)
*/

const create_trials = (blocks, blocksWM, norew, prac = true, pracWM = true) => {
    if (blocks == 0 && blocksWM == 0) return;
    let distractorAbsent, distractorHigh, distractorLow, conditionLog, trials, blockN;
    const phases = ["Practice", "Reward", "WM_p1", "WM_p2", norew];
    let phaseLog = {};
    for (let phase of phases) {
        if (!prac && phase == "Practice") continue;
        if (blocks==0 && phase == "Reward")continue;
        if (blocksWM==0 && phase == "WM")continue;
        if (!pracWM && phase.includes("WM_p")) continue;
        phaseLog[phase] = [];
    }
    console.log(phaseLog)
    for (let j of Object.keys(phaseLog)) {
        if (!prac && j == "Practice") continue;
        if (blocks==0 && j == "Reward")continue;
        if (blocksWM==0 && j == "WM")continue;
        if (!pracWM && j.includes("WM_p")) continue;
        conditionLog = [];
        console.log(j)
        blockN = (j.includes("WM"))? blocksWM: blocks;
        for (let i = 0; i < blockN; i++) {
            if (j == "Practice" && i === 0) {
                distractorAbsent = zeros(Math.floor(24), 6); // Singleton Absent
                for (let i = 0; i < distractorAbsent.length; i++) {
                    distractorAbsent[i][random(0, 6)] = 2;
                }
                conditionLog = distractorAbsent;
                break;
            }
            console.log(j)
            if (j.includes("WM_p")) {
                console.log("a")
                const n = (j == "WM_p1")? 3: 10;
                let AbsentDiff = zeros(Math.floor(n), 4); // All new colors
                let AbsentSame = zeros(Math.floor(n), 4); // All new colors

                for (let i = 0; i < n; i++) {
                    AbsentDiff[i][random(0, 4)] = 1;
                    AbsentSame[i][random(0, 4)] = 2;
                }
                conditionLog = conditionLog.concat(
                    shuffle(
                        [].concat(AbsentSame, AbsentDiff)
                        )
                );
                break;
            }
            if (j == "WM") {

                let distractorHighSame = zeros(Math.floor(3), 4); //High-value color present
                let distractorLowSame = zeros(Math.floor(3), 4); // Low-value color present
                let AbsentSame = zeros(Math.floor(2), 4); // All new colors
                let distractorHighDiff = zeros(Math.floor(3), 4); //High-value color present
                let distractorLowDiff = zeros(Math.floor(3), 4); // Low-value color present
                let AbsentDiff = zeros(Math.floor(2), 4); // All new colors
                let targetHighSame = zeros(Math.floor(1), 4); //High-value color present
                let targetLowSame = zeros(Math.floor(1), 4); // Low-value color present
                let targetHighDiff = zeros(Math.floor(1), 4); //High-value color present
                let targetLowDiff = zeros(Math.floor(1), 4); // Low-value color present

                // Total: 20 trials per block

                // Setting target color
                targetHighSame[0][random(0, 4)] = 3;
                targetLowSame[0][random(0, 4)] = 4;
                targetHighDiff[0][random(0, 4)] = 5;
                targetLowDiff[0][random(0, 4)] = 6;


                for (let i = 0; i < 3; i++) {
                    // Setting target color
                    distractorHighSame[i][random(0, 4)] = 1;
                    distractorLowSame[i][random(0, 4)] = 1;
                    distractorHighDiff[i][random(0, 4)] = 2;
                    distractorLowDiff[i][random(0, 4)] = 2;

                    // Setting previous distractor color:
                    distractorHighSame[i][random(0, 4, [distractorHighSame[i].indexOf(1)])] = 7;
                    distractorLowSame[i][random(0, 4, [distractorLowSame[i].indexOf(1)])] = 8;
                    distractorHighDiff[i][random(0, 4, [distractorHighDiff[i].indexOf(2)])] = 7;
                    distractorLowDiff[i][random(0, 4, [distractorLowDiff[i].indexOf(2)])] = 8;
                }

                for (let i = 0; i < 2; i++) {
                    AbsentDiff[i][random(0, 4)] = 1;
                    AbsentSame[i][random(0, 4)] = 2;
                }
                conditionLog = conditionLog.concat(
                    shuffle(
                        [].concat(AbsentSame, AbsentDiff,
                            distractorHighSame, distractorHighDiff,
                            distractorLowSame, distractorLowDiff,
                            targetHighDiff, targetHighSame,
                            targetLowSame, targetLowDiff))
                );
                continue;
            }

            distractorHigh = zeros(Math.floor(10), 6); //High-value
            distractorLow = zeros(Math.floor(10), 6); // Low-value
            distractorAbsent = zeros(Math.floor(4), 6); // Singleton Absent


            // Filling distractor absent with targets (2s = target):
            for (let i = 0; i < distractorAbsent.length; i++) {
                distractorAbsent[i][random(0, 6)] = 2;
            }

            // Filling distractactor High (1s = singleton high; 2s = target):
            for (let i = 0; i < distractorHigh.length; i++) {
                distractorHigh[i][random(0, 6)] = 2;
                distractorHigh[i][random(0, 6, [distractorHigh[i].indexOf(2)])] = 1;
            }

            // Filling distractor low (3s = singleton low; 2s = target):
            for (let i = 0; i < distractorLow.length; i++) {
                distractorLow[i][random(0, 6)] = 2;
                distractorLow[i][random(0, 6, [distractorLow[i].indexOf(2)])] = 3;
            }

            // Combining the arrays and randomize order:
            conditionLog = conditionLog.concat(
                shuffle(
                    [].concat(distractorAbsent,
                        distractorHigh,
                        distractorLow)
                ));
        }
        phaseLog[j].push(conditionLog);
        console.log(conditionLog)
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

    // Function to gather information about VMAC trials
    const getSing = (j, i) => {
        let conds = (j == "Reversal") ? ["Low", "High"] : ["High", "Low"];
        if (phaseTrialLog[j][i].indexOf(1) > -1) return [phaseTrialLog[j][i].indexOf(1), conds[0]];
        if (phaseTrialLog[j][i].indexOf(3) > -1) return [phaseTrialLog[j][i].indexOf(3), conds[1]];
        return [-1, "Absent"];
    }

    // Function to gather information about WM trials
    const getWM = (j, i, pos = false) => {

        let log = phaseTrialLog[j][i];

        if (pos == "t") {
            for (let i = 1; i < 7; i++) {
                if (log.indexOf(i) >= 0) return log.indexOf(i);
            }
        } else if (pos == "d") {
            for (let i = 7; i < 9; i++) {
                if (log.indexOf(i) >= 0) return log.indexOf(i);
            }
            return -1;
        }

        let tmp = [];
        // Orientation
        if (log.some((r) => [1, 3, 4].includes(r))) tmp[0] = "Same"
        else tmp[0] = "Different"

        // Value
        if (log.some((r) => [3, 5, 7].includes(r))) tmp[1] = "High"
        else if (log.some((r) => [4, 6, 8].includes(r))) tmp[1] = "Low"
        else tmp[1] = "Absent"

        // Trial type
        if (log.some((r) => [3, 4, 5, 6].includes(r))) tmp[2] = "Target"
        else if (log.some((r) => [7, 8].includes(r))) tmp[2] = "Distractor"
        else tmp[2] = "Absent"

        return tmp;

    }

    for (let j of Object.keys(trialto)) {
        if (j == "WM_p1") trials = 6;
        else if (j == "WM_p2") trials = 20;
        else trials = (j == "WM") ? 20 * blocksWM : (j == "Practice") ? 24 : 24 * blocks;
        for (let i = 0; i < trials; i++) {
            if (!j.includes("WM")) {
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
            } else {
                trialto[j].push({
                    trialLog: phaseTrialLog[j][i],
                    targetPos: getWM(j, i, "t"),
                    singPos: getWM(j, i, "d"),
                    orientation: getWM(j, i)[0],
                    condition: getWM(j, i)[1],
                    trial_type: getWM(j, i)[2],
                    Phase: j,
                    counterbalance: counterbalance,
                    colors: pickColor(counterbalance),
                    jitters: [random(300, 601), random(1000, 1501)],

                })
            }
        }
    }
    return trialto;
}

// Function to compute the amount of points earned in each trial
const compute_points = (rt, condition, phase) => {
    if (rt === null || phase == "Practice" || phase == "Omission") return 0;
    if (condition == "High" && phase == "Devaluation") return 0;
    const bonus = (condition == "High" && phase != "Extinction") ? 1 : .1;
    const points = Math.floor((1000 - rt) * bonus);
    if (points < 0) return 0;
    return points;
}

// Function to translate colors to spanish
const colors_t = (color) => {
    if (color == "orange") return `<span style = 'color:${color2hex(color)}'>naranja</span>`
    if (color == "blue") return `<span style = 'color:${color2hex(color)}'>azul</span>`
    if (color == "green") return `<span style = 'color:${color2hex(color)}'>verde</span>`
    if (color == "red") return `<span style = 'color:${color2hex(color)}'>rojo</span>`
    if (color == "yellow") return `<span style = 'color:${color2hex(color)}'>amarillo</span>`
    return `<span style = 'color:${color2hex(color)}'>rosa</span>`
}

// Function that formate numbers
// Modified from: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const formatting = (x) => {
    x = x.split(".");
    inte = x[0].replace(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    decimal = (x[1] !== undefined) ? `.${x[1]}` : "";
    return inte + decimal;
}

const capitalize = (string) => {
    let lower = string.toLowerCase();
    return lower[0].toUpperCase() + lower.slice(1);
}

// Function to find participant points cut-off:
const find_ranking = (arr, points, r = false) => {
    // Transform array to bool and then sum up every element
    let rank = arr.map((e) => e < points).reduce((acc, cur) => acc + cur) - 1;
    return (rank > 5 && !r) ? rank - 1 : rank;
}

const get_medal = (rank) => {
    return (rank >= 0) ? `medal${rank}.png` : "";
}

// How many points until the next medal?
const next_points = (arr, ranking, points) => {
    return arr[ranking] - points;
}

const report_performance = (rank) => {
    const performance = (rank >= 0) ? [10, 30, 40, 60, 70, 90, 99][rank] : 10;
    return `<p>Esto significa que has acumulado ${(rank >= 0) ? "más" : "menos"} puntos que el ${performance}% de las personas que han hecho esta tarea.`
}

/* Function to save data:
const save = (data) => {

}*/
