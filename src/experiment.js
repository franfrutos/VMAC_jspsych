// Experimental trials code
const run_experiment = () => {
    const timeline = [];

    // Setting parameters
    const urlvar = (jatos_run && jatos.urlQueryParameters != undefined) ? jatos.urlQueryParameters : 
    (jsPsych.data.urlVariables() != undefined)? jsPsych.data.urlVariables():
     {}; // If no urlvar
    const norew = (urlvar.phase != undefined && ["Reversal", "Devaluation", "Omission", "WM"].includes(capitalize(urlvar.phase))) ?
        capitalize(urlvar.phase) :
        "WM";
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const blocksWM = (Number(urlvar.blocksWM) == 0) ? 0 : (!isNaN(Number(urlvar.blocksWM))) ? Number(urlvar.blocksWM) : 15;
    const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined) ? false : (urlvar.prac == "true" || urlvar.prac == undefined) && blocks != 0;
    const pracWM = (urlvar.blocksWM == 0 && urlvar.blocksWM != undefined) ? false : (urlvar.pracWM == "true" || urlvar.pracWM == undefined) && blocksWM != 0;
    const gam = (urlvar.gamify == "true")? true: true;

    if (urlvar.phase == undefined) console.log("No phase parameter used. Default is WM.")
    else if (!["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used: ${urlvar.phase}. Phase has been set to Extinction.`);

    console.log(`Experiment Parameters
       Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}. BlocksWM: ${blocksWM}. Practice WM: ${pracWM}. Condition: ${condition}. gamify: ${gam}`);


    trialObj = create_trials(blocks, blocksWM, norew, prac, pracWM);
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
    if (blocks != 0) console.log(`Color high is ${colorHigh}. Color low is ${colorLow}.`)
    ID = (urlvar.ID != undefined)? urlvar.ID: randomID();
    if (jatos_run) jatos.studySessionData.subjID = ID; // Saving ID for the next component

    console.log("ID: " + ID);

    // Assign condition after VMAC practice is finished:
    const cond_func = {
        type: jsPsychCallFunction,
        func: () => assign_condition(urlvar.condition),
    }

    // Experimental trial

    // Points necessary for earning medals. If reversal, points cut-offs are increased by a factor of 1.3
    const points_cut_off = [15500, 27200, 31900, 37300, 40000, 49300, 57000].map((p) => {
        return (norew == "Reversal" & p != 15500) ? p * 1.3 : p;
    })


    let trialNum = 0, total_points = 0, BlockNum = 0, fail = true, cont = false, phase_out = "VMAC";

    const trial = {
        type: jsPsychPsychophysics,
        stimuli: () => {
            const sF = (lab) ? 40 : jsPsych.data.get().last(1).values()[0].px2deg; // If experiment is run in lab, custom px2deg
            const log = jsPsych.timelineVariable("trialLog");
            // Stimulus size is determined to an scaling factor that transform pixels to degrees of visual angle
            return draw_display(1.15 * sF, 0.2 * sF, 5.05 * sF, log, jsPsych.timelineVariable("colors"),
                jsPsych.timelineVariable("orientation"), jsPsych.timelineVariable("Phase"), jsPsych.timelineVariable("condition"),
                jsPsych.timelineVariable("jitters"));
        },
        choices: () => {
            if (jsPsych.timelineVariable("Phase").includes("WM")) {
                return ["c", "m"];
            } else return ["b", "j"];
        },
        background_color: '#000000',
        canvas_width: () => { // Canvas size depends on stimulus size by default. This prevents canvas to be too small
            const sF = (lab) ? 40 : jsPsych.data.get().last(1).values()[0].px2deg;
            return sF * 15; 
        },
        canvas_height: () => {
            const sF = (lab) ? 40 : jsPsych.data.get().last(1).values()[0].px2deg;
            return sF * 15;
        },
        data: () => {
            let color
            if (jsPsych.timelineVariable("Phase") != "Reversal") {
                color = (jsPsych.timelineVariable("condition") == "High") ? colorHigh : (jsPsych.timelineVariable("condition") == "Low")? colorLow: "none";
            } else {
                color = (jsPsych.timelineVariable("condition") == "Low") ? colorHigh : (jsPsych.timelineVariable("condition") == "High")? colorLow: "none";
            }
            return {
                tPos: jsPsych.timelineVariable("targetPos"),
                sPos: jsPsych.timelineVariable("singPos"),
                Phase: (jsPsych.timelineVariable("Phase").includes("WM_p")) ? "Practice WM" : jsPsych.timelineVariable("Phase"),
                condition: jsPsych.timelineVariable("condition"),
                Block_num: ((trialNum % 24 == 0 && jsPsych.timelineVariable("Phase").includes("Reward")) ||
                 (trialNum % 20 == 0 && jsPsych.timelineVariable("Phase").includes("WM"))) ? ++BlockNum : BlockNum,
                trial_num: ++trialNum,
                type_WM:  (jsPsych.timelineVariable("Phase").includes("WM")) ? jsPsych.timelineVariable("trial_type") : "none",
                counterbalance: counterbalance,
                color: color,
            }
        },
        on_finish: (data) => {
            if (jsPsych.timelineVariable("Phase").includes("WM")) {
                data.correct_response = (jsPsych.timelineVariable("orientation") == "Different") ? "c" : "m";
                data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)) ? 1 : 0;
                if (trialNum == 6 && jsPsych.timelineVariable("Phase") == "WM_p1" || trialNum == 20 && jsPsych.timelineVariable("Phase") == "WM_p2") {
                    trialNum = 0;
                    BlockNum = 0;
                }
                return;
            }
            data.correct_response = (jsPsych.timelineVariable("orientation") == "vertical") ? "j" : "b";
            data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)) ? 1 : 0;
            data.points = (data.correct) ?
                compute_points(data.rt, data.condition, data.Phase) :
                -compute_points(data.rt, data.condition, data.Phase);
            total_points = (total_points + data.points <= 0) ? 0 : total_points + data.points;
            data.total_points = total_points;
        },
        trial_duration: () => {
            //return null;
            const j = jsPsych.timelineVariable("jitters");
            const t1 = (jsPsych.timelineVariable("Phase") == "WM_p1") ? 3000 : 500;
            const t2 = (jsPsych.timelineVariable("Phase") == "WM_p1") ? 10000 : 3000;
            const isi = 1000;
            return (jsPsych.timelineVariable("Phase").includes("WM")) ? j[0] + t1 + j[1] + t2 + isi : 3700;
        }, //3200
        response_start_time: () => {
            const j = jsPsych.timelineVariable("jitters");
            const t1 = (jsPsych.timelineVariable("Phase") == "WM_p1") ? 3000 : 500;
            const isi = 1000;
            return (jsPsych.timelineVariable("Phase").includes("WM")) ? j[0] + t1 + j[1] + isi : 1700;
        },
    };


    const feedback = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const response = jsPsych.data.get().last(1).values()[0].key_press;
            if (response !== null) {
                const acc = jsPsych.data.get().last(1).values()[0].correct;
                if (jsPsych.timelineVariable("Phase") == "Practice" || jsPsych.timelineVariable("Phase") == "Omission" || jsPsych.timelineVariable("Phase").includes("WM_p")) {
                    return (acc) ? `<p style="color: #40E0D0; font-size: 2rem;">Correcto</p>` :
                        `<p style="color: #8765c2; font-size: 2rem;">Error</p>`;
                }
                if (jsPsych.timelineVariable("Phase") == "WM") {
                    return "";
                }
                const bonus = (jsPsych.timelineVariable("condition") == "High" &&
                    (jsPsych.timelineVariable("Phase") != "Extinction" && jsPsych.timelineVariable("Phase") != "Devaluation")) ?
                    `<div style="background-color: ${(acc) ? `#40E0D0` : `#8765c2`}; color: black; font-size: 2rem; font-weight: 600; padding: 40px;">${(acc) ?
                        `¡Puntos Extra!` :
                        `Perdidas Extra`}</div></br>` :
                    '<div></div></br>';
                const points = jsPsych.data.get().last(1).values()[0].points;
                const gains = (acc) ?
                    `<p style="color: #40E0D0; font-size: 2rem;">+${points} puntos</p>` :
                    `<p style="color: #8765c2; font-size: 2rem;">ERROR: ${points} puntos</p>`
                return bonus + gains;
            }
            if (jsPsych.timelineVariable("Phase") != "WM") return "<p style='font-size: 2rem;'>Demasiado lento. Intenta responder más rápido.</p>";
            else return "";
        },
        post_trial_gap: () => {
            const phase = jsPsych.data.get().last(1).values()[0].Phase;
            if ((phase == "Practice" && trialNum == 24) || (phase != "Reward" && trialNum == (24 * blocks) * 2)) return 1000;
        },
        trial_duration: 700,
        choices: ["NO_KEYS"],
        post_trial_gap: () => {
            const phase = jsPsych.timelineVariable("Phase");
            if (phase == "Practice") {
                if (trialNum == 24) {
                    return 1000;
                }
            }
            if (phase == "Reward") {
                if (blocks * 24 == trialNum) {
                    return 1000;
                }
            }
            if (phase == "WM") {
                if (blocksWM * 20 == trialNum) {
                    return 1000;
                }
            }
            return 0;
        },
        on_finish: () => {
            const phase = jsPsych.timelineVariable("Phase");
            if (phase == "Practice") {
                if (trialNum == 24) {
                    trialNum = 0;
                    BlockNum = 0;
                    document.body.classList.remove("black");
                    document.body.style.cursor = 'auto';
                }
            }
            if (phase == "Reward") {
                if (blocks * 24 == trialNum) {
                    document.body.classList.remove("black");
                    document.body.style.cursor = 'auto';
                }
            }
        }
    }


    const rest = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const phase = jsPsych.data.get().last(2).values()[0].Phase;
            const rank = find_ranking(points_cut_off, total_points);
            const disp_medals = (rank >= 0) ? `
                           <p>Has desbloqueado la siguiente medalla:</p>
                           <img src="src/img/medals/${get_medal(rank)}" width="150" height="150">` : "";
            const next = (rank <= 4) ?
                `<p>Te quedan ${formatting(next_points(points_cut_off, rank + 1, total_points).toString())} puntos para desbloquear la siguiente medalla.</p>` :
                "";

            return `
                       <p>Has completado ${BlockNum} de ${(phase == "WM") ? blocksWM : blocks} Bloques.</p>
                       ${(!phase.includes("WM")) ? `<p>Llevas ${formatting(total_points.toString())} puntos acumulados.</p>` : ""}
                       ${(gam && phase != "WM") ? disp_medals + next : ""}
                       <p>Pulsa la barra espaciadora cuando quieras continuar.</p>
                       `
        },
        choices: [' '],
        on_finish: () => {
            if (jatos_run) {
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
                jatos.submitResultData(results);
            }
        }
    }

    const transition = {
        type: jsPsychHtmlKeyboardResponse,
        // Hay que escalar los puntos en función de la segunda fase
        stimulus: () => {
            if (norew == "Reversal") {
                return `<p>Has terminado la primera mitad del experimento.</p>
                           <p>A partir de ahora van a cambiar las reglas que determinan los puntos que puedes ganar:</p>
                           <p>Si aparece el color ${colors_t(colorLow)}, ganarás 10 veces más puntos.</p>
                           <p>Si aparece el color ${colors_t(colorHigh)}, no ganarás puntos extra.</p>
                           <p>Pulsa la barra espaciadora para continuar con el experimento.</p>`
            }
            if (norew == "Extinction") {
                return `<p>Has terminado la primera mitad del experimento.</p>
                           <p style = "width: 80%; margin: auto">Ahora vas a continuar con la tarea, pero a partir de ahora el círculo ${colors_t(colorHigh)} ya no señala puntos extra. 
                           Ganarás los puntos que correspondan a tu rapidez en aciertos, 
                           como en el caso de los ensayos donde no hay colores o donde aparece el círculo ${colors_t(colorLow)}.</p>
                           <p>Pulsa la barra espaciadora para continuar con el experimento.</p>`
            } if (norew == "Omission") {
                return `<p>Has terminado la primera mitad del experimento.</p>
                           <p>Ahora vas a continuar con la tarea, <b style = "color:red"> pero ya no ganarás más puntos</b>.</p>
                           <p>Pulsa la barra espaciadora para continuar.</p>`
            }
            return `<p>Has terminado la primera mitad del experimento.</p>
                       <p>Ahora vas a continuar con la tarea, pero si aparece el círculo de ${colors_t(colorHigh)} la cantidad de puntos que ganarás será siempre 0.</p>
                       <p>Pulsa la barra espaciadora para continuar.</p>`;
        },
        choices: [" "],
        on_finish: () => {
            if (jatos_run) {
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
                jatos.submitResultData(results);
            }
        }
    }

    const report = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const rank = find_ranking(points_cut_off, total_points, r = true);
            const medal = (rank >= 0) ? `<p>Has acumulado ${formatting(total_points.toString())} puntos y desbloqueado la siguiente medalla: </p>
                       <img src="src/img/medals/${get_medal((rank > 5) ? rank - 1 : rank)}" width="150" height="150">` :
                `<p>Has acumulado ${formatting(total_points.toString())} puntos.</p>`;
            return `<p>Acabas de terminar el experimento.</p>
                       ${(gam) ? medal + report_performance(rank) : ""}
                       <p>Antes de salir de esta página nos gustaría que respondieses unas breves preguntas.</p>
                       <p>Pulsa la barra espaciadora para seguir.</p>`
        },
        choices: [' '],
        on_finish: () => {
            if (jatos_run) {
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
                jatos.submitResultData(results);
            }
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';
        },
        post_trial_gap: 1000,
    };

    // Conditional 

    const if_call = {
        timeline: [call_experimenter],
        conditional_function: () => {
            return lab;
        }
    }

    const if_nodeRest = {
        timeline: [rest],
        conditional_function: () => {
            const phase = jsPsych.data.get().last(2).values()[0].Phase
            if (phase == "WM") return (trialNum % 20 == 0 && trialNum != 20 * blocksWM)
            if (phase == "Practice WM") return false;
            if ((trialNum % 24 == 0 && trialNum != 24 * blocks) && (trialNum % 24 == 0 && trialNum != (24 * blocks) * 2)) {
                return true;
            } else {
                return false;
            };
        },
    }

    const reward = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocks != 0) ? trialObj.Reward : [],
        repetitions: 1,
        randomize_order: false,
        post_trial_gap: () => {
            if (blocks == 0) {
                document.body.classList.remove("black");
                document.body.style.cursor = 'auto';
                return 1000;
            }
            return 0;
        }
    }

    const noreward = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocks != 0) ? trialObj[norew] : [],
        repetitions: 1,
        randomize_order: false,
    }

    const wm = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocksWM != 0) ? trialObj[norew] : [],
        repetitions: 1,
        randomize_order: false,
    }

    const if_wm = {
        timeline: [wm],
        conditional_function: () => {
            return blocksWM != 0;
        }
    }

    const wm_p1 = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocksWM != 0) ? trialObj["WM_p1"] : [],
        repetitions: 1,
        randomize_order: false
    }

    const wm_p2 = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocksWM != 0) ? trialObj["WM_p2"] : [],
        repetitions: 1,
        randomize_order: false,
    }

    const if_transition = {
        timeline: [transition],
        conditional_function: () => {
            return norew != "WM";
        }
    }

    const if_wm_p1 = {
        timeline: [wm_p1],
        conditional_function: () => {
            return pracWM;
        }
    }

    const if_wm_p2 = {
        timeline: [wm_p2],
        conditional_function: () => {
            return pracWM;
        }
    }

    const if_reward = {
        timeline: [reward],
        conditional_function: () => {
            return blocks != 0;
        },
    }

    const procedure_wm_practice = {
        timeline: [prac_wm, if_wm_p1, prac_1_wm, if_wm_p2, prac_2_wm],
        repetitions: 1,
        randomize_order: false,
    }

    const post_inst_wm = {
        type: jsPsychSurveyMultiChoice,
        questions: () => {
            const arr = shuffle([
                {
                    prompt: "¿Cómo sabrás que linea deberás recordar en la tarea de memoria?",
                    name: 'test1',
                    options: shuffle(['Porque se te señalará con otra linea apuntando a uno de los circulos', 'Porque aparecerá en el interior de un circulo de color diferente',
                        'Porque aparecerá en el interior de un estímulo con forma diferente']),
                    required: true,
                    horizontal: false
                },
                {
                    prompt: "¿Si la orientación de la linea que debes recordar cambia, ¿qué tecla debes  pulsar?",
                    name: 'test2',
                    options: shuffle(['C', 'M', 'B']),
                    required: true,
                    horizontal: false
                }]);
            return arr.filter((q) => q != null);
        },
        on_finish: (data) => {
            const resp = data.response;
            fail = resp.test2 != 'C' || resp.test1 != 'Porque se te señalará con otra linea apuntando a uno de los circulos';
            phase_out = "WM";
            trialNum = 0;
            BlockNum = 0;
        }
    };
    const repeat = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            if (!fail && phase_out == "VMAC") {
                return wrapper(`<p>Ahora va a empezar al experimento.</p>
                   <p>El experimento va a constar de dos fases, una con ${`${blocks.toString()} bloque${(blocks > 1) ? `s` : ``}`} de 24 ensayos (25 minutos) y otra con ${`${blocksWM.toString()} bloque${(blocks > 1) ? `s` : ``}`} de 20 ensayos (30 minutos).</p>
                   <p>Entre bloques podrás descansar si lo necesitas.</p>
                   <p>La duración aproximada del experimento será de unos 55 minutos.</p>
                   <p>Pulsa comenzar para empezar el experimento.</p>`, true)
            } else if (!fail && phase_out == "WM") {
                return `<p>¡Has respondido correctamente a todas las preguntas! <p>
                   <p>Ahora vas a comenzar con la práctica. Pulsa comenzar cuando quieras empezar.</p>`
            } else {
                return `<p>Lamentablemente no has respondido correctamente a alguna de las preguntas.</p>
                   <p>Por favor, lee las instrucciones con detenimiento.</p>`
            }
        },
        choices: () => {
            return (!fail) ? ["Comenzar"] : ["Volver a leer las instrucciones"];
        },
        post_trial_gap: () => {
            return (!fail) ? 1000 : 0;
        }
    }
    const procedure_inst_wm = {
        timeline: [instructions_wm, post_inst_wm, repeat],
        loop_function: () => {
            return fail;
        },
        on_finish: () => {
            cont = (!fail) ? true : false;
            if (!fail && cont) {
                document.body.classList.add("black");
                document.body.style.cursor = 'none';
                trialNum = 0;
                BlockNum = 0;
            }
        },
        post_trial_gap: 0,
    }

    const procedure_wm = {
        timeline: [pre_wm, procedure_inst_wm, procedure_wm_practice, if_wm],
        repetitions: 1,
        randomize_order: false,
        //post_trial_gap: 1000,
    }

    const if_noreward = (norew != "WM") ? {
        timeline: [noreward],
        conditional_function: () => {
            return blocks != 0 || norew != "WM";
        }
    } : {
        timeline: [procedure_wm],
    }

    const practice = {
        timeline: [trial, feedback],
        timeline_variables: (blocks != 0) ? trialObj.Practice : [],
        repetitions: 1,
        randomize_order: false,
    }

    const if_practice = {
        timeline: [practice],
        conditional_function: () => {
            return prac;
        }
    }

    const if_resize = {
        timeline: [resize],
        conditional_function: () => {
            return !lab;
        }
    }

    const procedure_cal = {
        timeline: [welcome, instructions_cal, full_on, if_resize],
        repetitions: 1,
        randomize_order: false,
    }

    const procedure_prac = {
        timeline: [instructions_prac, pre_prac, if_practice],
        repetitions: 1,
        randomize_order: false,
        post_trial_gap: () => { if (prac == false) return 1000 },
    }


    const post_inst_exp = {
        type: jsPsychSurveyMultiChoice,
        questions: () => {
            const arr = shuffle([
                {
                    prompt: "¿Qué tecla debes pulsar si se te presenta una linea en posición vertical?",
                    name: 'line',
                    options: shuffle(['B', 'J', 'C']),
                    required: true,
                    horizontal: false
                },
                {
                    prompt: "¿A qué estímulo debes atender durante la tarea?",
                    name: 'feature',
                    options: shuffle(['Al estímulo con forma de rombo', 'Al estímulo con forma de círculo', 'Al estimulo con un color diferente']),
                    required: true,
                    horizontal: false
                },
                (condition.includes("A")) ? {
                    prompt: "¿En qué situaciones podrás ganar 10 veces más puntos?",
                    name: 'value',
                    options: shuffle([`Cuando en pantalla aparece el color ${colors_t(colorHigh)}`, `Cuando en pantalla aparece el color ${colors_t(colorLow)}`, 'Cuando en pantalla no aparece ningún color']),
                    required: true,
                    horizontal: false
                } : null,
            ]);
            return arr.filter((q) => q != null);
        },
        on_finish: (data) => {
            const resp = data.response;
            fail = resp.line != 'J' || resp.feature != 'Al estímulo con forma de rombo' || (resp.value != `Cuando en pantalla aparece el color ${colors_t(colorHigh)}` && resp.value != undefined);
            phase_out = "VMAC";
        }
    };

    const procedure_inst_exp = {
        timeline: [instructions_exp, post_inst_exp, repeat],
        loop_function: () => {
            return fail;
        },
        on_finish: () => {
            cont = (!fail) ? true : false;
            if (!fail && cont) {
                document.body.classList.add("black");
                document.body.style.cursor = 'none';
            }
        },
        //post_trial_gap: 0,
    }



    const slide = {
        type: jsPsychHtmlSliderResponse,
        stimulus: () => {
            random_high_pos = random(1, 3);
            return `<div style="width:auto; margin-bottom: 50px;">
               <p>¿Qué porcentaje de puntos crees que has ganado con cada color?</p>
               <div style="width:240px; float: left;">
                   <canvas id="myCanvas${random_high_pos}" width="150" height="150" style = "border-radius: 3%; background-color: #fff; margin: 10px 0;"></canvas>
               </div>
               <div style="width:240px; float: right;">
                   <canvas id="myCanvas${(random_high_pos == 1) ? 2 : 1}" width="150" height="150" style = "border-radius: 3%; background-color: #fff; margin: 10px 0;"></canvas>
               </div>
               </div>`
        },
        require_movement: true,
        labels: () => {
            let arr = [];
            arr[random_high_pos - 1] = `<span id="high-placeholder">50</span> % con el color ${colors_t(colorHigh)}`;
            arr[(random_high_pos == 2) ? 0 : 1] = `<span id="low-placeholder">50</span> % con el color ${colors_t(colorLow)}`;
            return arr;
        },
        prompt: "<p>Pulsa continuar cuando hayas acabado</p>",
        button_label: "Continuar",
        on_load: () => {
            document.addEventListener("click", slider_c);
            const slider = document.getElementsByClassName("jspsych-slider");
            slider[0].addEventListener("input", slider_move);

        },
        on_finish: (data) => {
            document.removeEventListener("click", slider_c);
            const out = (random_high_pos == 1) ? 100 - data.response : data.response;
            if (order == 1) {
                jsPsych.data.addProperties({
                    contingency_rating1: out,
                })
                data.Phase = "slider_1"
            } else {
                jsPsych.data.addProperties({
                    contingency_rating2: out,
                })
                data.Phase = "slider_2"
            }
        },
        //post_trial_gap: 500,
    };

    const slide_confidence = {
        type: jsPsychHtmlSliderResponse,
        stimulus: () => {
            random_high_pos = random(1, 3);
            return `<div style="width:auto; margin-bottom: 50px;">
               <p>En una escala del 1 (ninguna confianza) al 100 (total confianza), ¿cuánta seguridad tienes en tu respuesta anterior?</p>
               </div>`
        },
        require_movement: true,
        labels: ["Ninguna confianza", "Total confianza"],
        prompt: '<p id = "placeholder" style = "margin-bottom:50px;">Tu respuesta: 50</p>',
        button_label: "Continuar",
        slider_width: 750,
        on_load: () => {
            document.addEventListener("input", (e) => {
                let p = document.getElementById("placeholder");
                let slider = document.getElementsByClassName("jspsych-slider");
                p.textContent = `Tu respuesta: ${slider[0].value}`;
            
            });
        },
        on_finish: (data) => {
            if (order == 1) {
                jsPsych.data.addProperties({
                    confidence_rating1: data.response,
                })
                data.Phase = "slider_1"
            } else {
                jsPsych.data.addProperties({
                    confidence_rating2: data.response,
                })
                data.Phase = "slider_2"
            }
        },
        //post_trial_gap: 500,
    };


    const slider_proc = {
        timeline: [slider_instr, slide, slide_confidence],
        conditional_function: () => {
            return condition.includes("2") || (condition.includes("1") && phase_out == "WM")
        }
    }

    const procedure_exp = {
        timeline: [procedure_inst_exp, pre_exp, if_reward, slider_proc, if_transition, if_noreward, report, slider_proc],
        repetitions: 1,
        randomize_order: false,
        //post_trial_gap: 1000,
    }


    const download = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<p>¿Quieres descargar los datos?</p>`,
        choices: ["Sí", "No"],
        on_finish: (data) => {
            if (data.response == 0) {
                jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).localSave("csv", "example.csv");
            }
        }
    }

    const if_download = {
        timeline: [download],
        conditional_function: () => {
            return !jatos_run;
        }
    }

    const out_id = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const id = jsPsych.data.get().last(1).values()[0].ID;
            return `
                   <p>Antes de terminar del experimento, apunta tu código de participante: ${id}</p>
               `
        },
        choices: ["Salir del experimento"]
    }

    timeline.push(check, preload, consent_proc, procedure_cal, procedure_prac, cond_func, procedure_exp, full_off, questions, if_download);

    jsPsych.run(timeline);
}
// Go!
if (jatos_run) {
    jatos.onLoad(() => run_experiment());
} else {
    run_experiment();
}
