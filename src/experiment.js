// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;

const timeline = [];  

let trialNum = 0;

// Experimental trial

const trial = {
    type: jsPsychPsychophysics,
    stimuli: () => {
        const sF  = jsPsych.data.get().last(1).values()[0].px2deg;
        const log = jsPsych.timelineVariable("trialLog");
        // Stimulus size is determined to an scaling factor that transform pixels to degrees of visual angle
        return draw_display(1.15*sF, 0.1*sF, 5.05*sF, log, jsPsych.timelineVariable("colors"), jsPsych.timelineVariable("orientation"));
    },
    choices: ['g', 'c'], 
    background_color: '#000000',
    canvas_width: () => {
        const sF  = jsPsych.data.get().last(1).values()[0].px2deg;
        return sF*15;
    },
    canvas_height: () => {
        const sF  = jsPsych.data.get().last(1).values()[0].px2deg;
        return sF*15;
    },
    data: () => {
        return {
            tPos: jsPsych.timelineVariable("targetPos"),
            sPos: jsPsych.timelineVariable("singPos"),
            Phase: jsPsych.timelineVariable("Phase"),
            condition: jsPsych.timelineVariable("condition"),
            trial_num: ++trialNum,
        }
    },
    on_finish: (data) => {
        data.correct_response = (jsPsych.timelineVariable("orientation") == "vertical") ? "g":"c";
        data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response))? 1: 0;
        data.points = (data.correct)? 
        compute_points(data.rt, data.condition, data.Phase):
        -compute_points(data.rt, data.condition, data.Phase);
    },
    //post_trial_gap: 500 + Math.floor(Math.random()*201),
    trial_duration: 3200,
    response_start_time: 1200,
};


const feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        const response = jsPsych.data.get().last(1).values()[0].key_press;
        if (response !== null) {
            const acc = jsPsych.data.get().last(1).values()[0].correct;
            if (jsPsych.timelineVariable("Phase") == "Practice" || jsPsych.timelineVariable("Phase") == "Extinction") {
                return (acc)? `<p style="color: yellow; font-size: 2rem;">Correcto</p>`:
                `<p style="color: red; font-size: 2rem;">Error</p>`;
            }
            const bonus = (jsPsych.timelineVariable("condition") == "High") ? 
            '<div style="background-color: yellow; color: black; font-size: 2rem; font-weight: 600; padding: 40px;">??Puntos Extra!</div></br>': 
            '<div></div></br>';
            const points = jsPsych.data.get().last(1).values()[0].points;
            const gains = (acc)? 
            `<p style="color: yellow; font-size: 2rem;">+${points} puntos</p>`:
            `<p style="color: red; font-size: 2rem;">ERROR: ${points} puntos</p>`
            return bonus + gains;
        }
        return "<p style='font-size: 2rem;'>Demsisado lento. Intenta responder m??s r??pido.</p>"
    },
    post_trial_gap: () => {
        const phase = jsPsych.data.get().last(1).values()[0].Phase;
        if ((phase == "Practice" && trialNum == 24) || (phase != "Reward" && trialNum == (24*blocks)*2)) return 1000
    },
    data: () => {
        return {
            trial_num: trialNum,
        }
    },
    trial_duration: 700,
    choices: ["NO_KEYS"],
}

const rest = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        return `
        <p>Has terminado un bloque experimental.</p></br>
        <p>Pulsa la barra espaciadora cuando quieras continuar con el siguiente.</p>
         `
    },
    choices: [' '],
    on_finish: () => {
        if (jatos_run) {
            const results = jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).csv();
            jatos.submitResultData(results);
        }
    }
}

const transition = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        if (norew == "Reversal") {
            return `<p>Has termnado la primera mitad del experimento.</p>
            <p>A partir de ahora van a cambiar las reglas que determinan los puntos que puedes ganar:</p>
            <p>Si aparece el color ${colors_t(colorLow)}, ganar??s 10 veces m??s puntos.</p>
            <p>Si aparece el color ${colors_t(colorHigh)}, no ganar??s puntos extra.</p></br>
            <p>Pulsa la barra espaciadora para continuar con el experimento.</p>`
        }
        return `<p>Has termnado la primera mitad del experimento.</p>
        <p>Ahora vas a continuar con la tarea, <b style = "color:red"> pero ya no ganar??s m??s puntos</b>.</p></br>
        <p>Pulsa la barra espaciadora para continuar.</p>`
    },
    choices: [" "],
    on_finish: () => {
        if (jatos_run) {
            const results = jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).csv();
            jatos.submitResultData(results);
        }
        if (blocks == 0) {
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';
        }
    }
}

// Conditional 
const if_nodeRest = {
    timeline: [rest],
        conditional_function: () => {
        const current_trial = jsPsych.data.get().last(1).values(0)[0].trial_num;
        return (current_trial % 24 == 0 && current_trial != 24*blocks) && (current_trial % 24 == 0 && current_trial != (24*blocks)*2);
    },
}

const reward = {
    timeline: [trial, feedback, if_nodeRest],
    timeline_variables: (blocks != 0)? trialObj.Reward: [],
    repetitions: 1,
    randomize_order: false,
}

const noreward = {
    timeline: [trial, feedback, if_nodeRest],
    timeline_variables: (blocks != 0)? trialObj[norew]: [],
    repetitions: 1,
    randomize_order: false,
}

const if_reward = {
    timeline: [reward],
    conditional_function: () => {
        return blocks != 0;
    }
}

const if_noreward = {
    timeline: [noreward],
    conditional_function: () => {
        return blocks != 0;
    }
}

const practice = {
    timeline: [trial, feedback],
    timeline_variables: (blocks != 0)? trialObj.Practice: [],
    repetitions: 1,
    randomize_order: false,
}

const if_practice = {
    timeline: [practice],
    conditional_function: () => {
        return prac;
    }
}

const procedure_cal = {
    timeline: [welcome, instructions_cal, full_on, resize],
    repetitions: 1,
    randomize_order: false,
}

const procedure_prac = {
    timeline: [instructions_prac, pre_prac, if_practice],
    repetitions: 1,
    randomize_order: false,
    post_trial_gap: () => {if (prac == false) return 1000},
    on_finish: (data) => {
        if (data.trial_num == 24 ||prac == false) {
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';
            trialNum = 0;
        }
    }
}

const procedure_exp = {
    // Pre_no: aqu??, el contenido va a variar en funci??n de la fase especificada.
    timeline: [instructions_exp, pre_exp, if_reward, transition, if_noreward],
    repetitions: 1,
    randomize_order: false,
    //post_trial_gap: 1000,
    on_finish: (data) => {
        if (data.trial_num == (24*blocks)*2) {
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';    
        }
    }
}

const download = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>??Quieres descargar los datos?</p>`,
    choices: ["S??", "No"],
    on_finish: (data) => {
        if (data.response == 0) {
            jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).localSave("csv", "example.csv");
        }
    }
}

const if_download = {
    timeline: [download],
    conditional_function: () => {
        return !jatos_run;
    }
}

timeline.push(check, procedure_cal, procedure_prac, procedure_exp, full_off, report, questions, if_download);

jsPsych.run(timeline);