// Experimental trials code
const timeline = [];

// This code is very repetitive. It will be good to change this in the future:
if (jatos_run) {
    jatos.onLoad(() => {
        // Setting parameters
        // This seems to be the solution to the problem with jatos
        // clors and blocks needs to be global
        const urlvar = jatos.urlQueryParameters;
        const norew = (urlvar.phase != undefined && ["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) ?
            capitalize(urlvar.phase) :
            "Extinction";
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined) ? false : urlvar.prac != "false" && true;


        if (urlvar.phase == undefined) console.log("No phase parameter used. Default is Extinction.")
        else if (!["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used: ${urlvar.phase}. Phase has been set to Extinction.`);

        console.log(`Experiment Parameters: Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}`);


        trialObj = create_trials(blocks, norew, prac);
        const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
        if (blocks != 0) console.log(`Color high is ${colorHigh}. Color low is ${colorLow}.`)  

        console.log("ID: " + jatos.urlQueryParameters.ID);

        // Participant ID:
        jsPsych.data.addProperties({
            ID: jatos.urlQueryParameters.ID,
        });

        // Experimental trials

        // Points necessary for earning medals. If reversal, points cut-offs are increased by a factor of 2
        const points_cut_off = [15500, 27200, 31900, 37300, 40000, 49300, 57000].map((p) => {
            return (norew == "Reversal") ? p * 2 : p;
        })


        let trialNum = 0, total_points = 0, BlockNum = 0;

        const trial = {
            type: jsPsychPsychophysics,
            stimuli: () => {
                const sF = (lab)? 4: jsPsych.data.get().last(1).values()[0].px2deg;
                const log = jsPsych.timelineVariable("trialLog");
                // Stimulus size is determined to an scaling factor that transform pixels to degrees of visual angle
                return draw_display(1.15 * sF, 0.1 * sF, 5.05 * sF, log, jsPsych.timelineVariable("colors"), jsPsych.timelineVariable("orientation"));
            },
            choices: ['g', 'c'],
            background_color: '#000000',
            canvas_width: () => {
                const sF = jsPsych.data.get().last(1).values()[0].px2deg;
                return sF * 15;
            },
            canvas_height: () => {
                const sF = jsPsych.data.get().last(1).values()[0].px2deg;
                return sF * 15;
            },
            data: () => {
                return {
                    tPos: jsPsych.timelineVariable("targetPos"),
                    sPos: jsPsych.timelineVariable("singPos"),
                    Phase: jsPsych.timelineVariable("Phase"),
                    condition: jsPsych.timelineVariable("condition"),
                    Block_num: (trialNum % 24 == 0) ? ++BlockNum : BlockNum,
                    trial_num: ++trialNum,
                }
            },
            on_finish: (data) => {
                data.correct_response = (jsPsych.timelineVariable("orientation") == "vertical") ? "g" : "c";
                data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)) ? 1 : 0;
                data.points = (data.correct) ?
                    compute_points(data.rt, data.condition, data.Phase) :
                    -compute_points(data.rt, data.condition, data.Phase);
                total_points = (total_points + data.points <= 0) ? 0 : total_points + data.points;
                data.total_points = total_points;
            },
            trial_duration: null,
            response_start_time: 1200,
        };


        const feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
                const response = jsPsych.data.get().last(1).values()[0].key_press;
                if (response !== null) {
                    const acc = jsPsych.data.get().last(1).values()[0].correct;
                    if (jsPsych.timelineVariable("Phase") == "Practice" || jsPsych.timelineVariable("Phase") == "Omission") {
                        return (acc) ? `<p style="color: yellow; font-size: 2rem;">Correcto</p>` :
                            `<p style="color: red; font-size: 2rem;">Error</p>`;
                    }
                    const bonus = (jsPsych.timelineVariable("condition") == "High" &&
                        (jsPsych.timelineVariable("Phase") != "Extinction" && jsPsych.timelineVariable("Phase") != "Devaluation")) ?
                        `<div style="background-color: ${(acc) ? `yellow` : `red`}; color: black; font-size: 2rem; font-weight: 600; padding: 40px;">${(acc) ?
                            `¡Puntos Extra!` :
                            `Perdidas Extra`}</div></br>` :
                        '<div></div></br>';
                    const points = jsPsych.data.get().last(1).values()[0].points;
                    const gains = (acc) ?
                        `<p style="color: yellow; font-size: 2rem;">+${points} puntos</p>` :
                        `<p style="color: red; font-size: 2rem;">ERROR: ${points} puntos</p>`
                    return bonus + gains;
                }
                return "<p style='font-size: 2rem;'>Demsisado lento. Intenta responder más rápido.</p>"
            },
            post_trial_gap: () => {
                const phase = jsPsych.data.get().last(1).values()[0].Phase;
                if ((phase == "Practice" && trialNum == 24) || (phase != "Reward" && trialNum == (24 * blocks) * 2)) return 1000
            },
            trial_duration: 700,
            choices: ["NO_KEYS"],
        }

        const rest = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
                const rank = find_ranking(points_cut_off, total_points);
                const disp_medals = (rank >= 0) ? `
                            <p>Has desbloqueado la siguiente medalla:</p>
                            <img src="src/img/medals/${get_medal(rank)}" width="150" height="150">` : "";
                const next = (rank <= 4) ?
                    `<p>Te quedan ${formatting(next_points(points_cut_off, rank + 1, total_points).toString())} puntos para desbloquear la siguiente medalla.</p>` :
                    "";

                return `
                        <p>Has completado ${BlockNum} de ${blocks * 2} Bloques.</p>
                        <p>Llevas ${formatting(total_points.toString())} puntos acumulados.</p>
                        ${disp_medals + next}
                        <p>Pulsa la barra espaciadora cuando quieras continuar.</p>
                        `
            },
            choices: [' '],
            on_finish: () => {
                if (jatos_run) {
                    const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
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
                    const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
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
                        ${medal + report_performance(rank)}
                        <p>Antes de salir de esta página nos gustaría que respondieses unas breves preguntas.</p>
                        <p>Pulsa la barra espaciadora para seguir.</p>`
            },
            choices: [' '],
            on_finish: () => {
                if (jatos_run) {
                    const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
                    jatos.submitResultData(results);
                }
                document.body.classList.remove("black");
                document.body.style.cursor = 'auto';
            }
        };

        // Conditional 
        const if_nodeRest = {
            timeline: [rest],
            conditional_function: () => {
                return (trialNum % 24 == 0 && trialNum != 24 * blocks) && (trialNum % 24 == 0 && trialNum != (24 * blocks) * 2);
            },
        }

        const reward = {
            timeline: [trial, feedback, if_nodeRest],
            timeline_variables: (blocks != 0) ? trialObj.Reward : [],
            repetitions: 1,
            randomize_order: false,
        }

        const noreward = {
            timeline: [trial, feedback, if_nodeRest],
            timeline_variables: (blocks != 0) ? trialObj[norew] : [],
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

        const procedure_cal = {
            timeline: [welcome, instructions_cal, full_on, resize],
            repetitions: 1,
            randomize_order: false,
        }

        const procedure_prac = {
            timeline: [instructions_prac, pre_prac, if_practice],
            repetitions: 1,
            randomize_order: false,
            post_trial_gap: () => { if (prac == false) return 1000 },
            on_finish: () => {
                if (trialNum == 24 || prac == false) {
                    document.body.classList.remove("black");
                    document.body.style.cursor = 'auto';
                    trialNum = 0;
                    BlockNum = 0;
                }
            }
        }

        const procedure_exp = {
            timeline: [instructions_exp, pre_exp, if_reward, transition, if_noreward],
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

        timeline.push(check, procedure_cal, procedure_prac, procedure_exp, report, full_off, questions, if_download);

        jatos.addAbortButton();
        jsPsych.run(timeline);
    })
} else {
    // Setting parameters
    const urlvar = jsPsych.data.urlVariables();
    const norew = (urlvar.phase != undefined && ["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) ?
        capitalize(urlvar.phase) :
        "Extinction";
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined) ? false : urlvar.prac != "false" && true;


    if (urlvar.phase == undefined) console.log("No phase parameter used. Default is Extinction.")
    else if (!["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used: ${urlvar.phase}. Phase has been set to Extinction.`);

    console.log(`Experiment Parameters
    Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}`);


    trialObj = create_trials(blocks, norew, prac);
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
    if (blocks != 0) console.log(`Color high is ${colorHigh}. Color low is ${colorLow}.`)

    console.log("ID" + urlvar.ID);

    jsPsych.data.addProperties({
        ID: urlvar.ID
    });

    // Experimental trial

    // Points necessary for earning medals. If reversal, points cut-offs are increased by a factor of 2
    const points_cut_off = [15500, 27200, 31900, 37300, 40000, 49300, 57000].map((p) => {
        return (norew == "Reversal") ? p * 2 : p;
    })


    let trialNum = 0, total_points = 0, BlockNum = 0;

    const trial = {
        type: jsPsychPsychophysics,
        stimuli: () => {
            const sF = (lab)? 4: jsPsych.data.get().last(1).values()[0].px2deg;
            const log = jsPsych.timelineVariable("trialLog");
            // Stimulus size is determined to an scaling factor that transform pixels to degrees of visual angle
            return draw_display(1.15 * sF, 0.1 * sF, 5.05 * sF, log, jsPsych.timelineVariable("colors"), jsPsych.timelineVariable("orientation"));
        },
        choices: ['g', 'c'],
        background_color: '#000000',
        canvas_width: () => {
            const sF = jsPsych.data.get().last(1).values()[0].px2deg;
            return sF * 15;
        },
        canvas_height: () => {
            const sF = jsPsych.data.get().last(1).values()[0].px2deg;
            return sF * 15;
        },
        data: () => {
            return {
                tPos: jsPsych.timelineVariable("targetPos"),
                sPos: jsPsych.timelineVariable("singPos"),
                Phase: jsPsych.timelineVariable("Phase"),
                condition: jsPsych.timelineVariable("condition"),
                Block_num: (trialNum % 24 == 0) ? ++BlockNum : BlockNum,
                trial_num: ++trialNum,
            }
        },
        on_finish: (data) => {
            data.correct_response = (jsPsych.timelineVariable("orientation") == "vertical") ? "g" : "c";
            data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)) ? 1 : 0;
            data.points = (data.correct) ?
                compute_points(data.rt, data.condition, data.Phase) :
                -compute_points(data.rt, data.condition, data.Phase);
            total_points = (total_points + data.points <= 0) ? 0 : total_points + data.points;
            data.total_points = total_points;
        },
        trial_duration: 3200,
        response_start_time: 1200,
    };


    const feedback = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const response = jsPsych.data.get().last(1).values()[0].key_press;
            if (response !== null) {
                const acc = jsPsych.data.get().last(1).values()[0].correct;
                if (jsPsych.timelineVariable("Phase") == "Practice" || jsPsych.timelineVariable("Phase") == "Omission") {
                    return (acc) ? `<p style="color: yellow; font-size: 2rem;">Correcto</p>` :
                        `<p style="color: red; font-size: 2rem;">Error</p>`;
                }
                const bonus = (jsPsych.timelineVariable("condition") == "High" &&
                    (jsPsych.timelineVariable("Phase") != "Extinction" && jsPsych.timelineVariable("Phase") != "Devaluation")) ?
                    `<div style="background-color: ${(acc) ? `yellow` : `red`}; color: black; font-size: 2rem; font-weight: 600; padding: 40px;">${(acc) ?
                        `¡Puntos Extra!` :
                        `Perdidas Extra`}</div></br>` :
                    '<div></div></br>';
                const points = jsPsych.data.get().last(1).values()[0].points;
                const gains = (acc) ?
                    `<p style="color: yellow; font-size: 2rem;">+${points} puntos</p>` :
                    `<p style="color: red; font-size: 2rem;">ERROR: ${points} puntos</p>`
                return bonus + gains;
            }
            return "<p style='font-size: 2rem;'>Demsisado lento. Intenta responder más rápido.</p>"
        },
        post_trial_gap: () => {
            const phase = jsPsych.data.get().last(1).values()[0].Phase;
            if ((phase == "Practice" && trialNum == 24) || (phase != "Reward" && trialNum == (24 * blocks) * 2)) return 1000
        },
        trial_duration: 700,
        choices: ["NO_KEYS"],
    }

    const rest = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const rank = find_ranking(points_cut_off, total_points);
            const disp_medals = (rank >= 0) ? `
                        <p>Has desbloqueado la siguiente medalla:</p>
                        <img src="src/img/medals/${get_medal(rank)}" width="150" height="150">` : "";
            const next = (rank <= 4) ?
                `<p>Te quedan ${formatting(next_points(points_cut_off, rank + 1, total_points).toString())} puntos para desbloquear la siguiente medalla.</p>` :
                "";

            return `
                    <p>Has completado ${BlockNum} de ${blocks * 2} Bloques.</p>
                    <p>Llevas ${formatting(total_points.toString())} puntos acumulados.</p>
                    ${disp_medals + next}
                    <p>Pulsa la barra espaciadora cuando quieras continuar.</p>
                    `
        },
        choices: [' '],
        on_finish: () => {
            if (jatos_run) {
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
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
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
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
                    ${medal + report_performance(rank)}
                    <p>Antes de salir de esta página nos gustaría que respondieses unas breves preguntas.</p>
                    <p>Pulsa la barra espaciadora para seguir.</p>`
        },
        choices: [' '],
        on_finish: () => {
            if (jatos_run) {
                const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).csv();
                jatos.submitResultData(results);
            }
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';
        }
    };

    // Conditional 
    const if_nodeRest = {
        timeline: [rest],
        conditional_function: () => {
            return (trialNum % 24 == 0 && trialNum != 24 * blocks) && (trialNum % 24 == 0 && trialNum != (24 * blocks) * 2);
        },
    }

    const reward = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocks != 0) ? trialObj.Reward : [],
        repetitions: 1,
        randomize_order: false,
    }

    const noreward = {
        timeline: [trial, feedback, if_nodeRest],
        timeline_variables: (blocks != 0) ? trialObj[norew] : [],
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

    const procedure_cal = {
        timeline: [welcome, instructions_cal, full_on, resize],
        repetitions: 1,
        randomize_order: false,
    }

    const procedure_prac = {
        timeline: [instructions_prac, pre_prac, if_practice],
        repetitions: 1,
        randomize_order: false,
        post_trial_gap: () => { if (prac == false) return 1000 },
        on_finish: () => {
            if (trialNum == 24 || prac == false) {
                document.body.classList.remove("black");
                document.body.style.cursor = 'auto';
                trialNum = 0;
                BlockNum = 0;
            }
        }
    }

    const procedure_exp = {
        timeline: [instructions_exp, pre_exp, if_reward, transition, if_noreward],
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

    timeline.push(check, procedure_cal, procedure_prac, procedure_exp, report, full_off, questions, if_download);

    jsPsych.run(timeline);
}

