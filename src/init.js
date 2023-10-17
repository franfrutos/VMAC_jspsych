// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;
if (jatos_run) console.log("Run in Jatos server.")
else console.log("Run in local machine.")

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: () => {
        if (window.jatos) {
            finishCond();
            const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
            jatos.submitResultData(results)
                .then(jatos.startNextComponent)
                .catch(() => console.log("Something went wrong"));    
        }
    }
});

const seed = jsPsych.randomization.setSeed(Math.floor(Math.random()*9999));
jsPsych.data.addProperties({
    rng_seed: seed
});

const lab = false;


console.log(`Random seed: ${seed}`)

const counterbalance = random(0, 6);

console.log(`Counterbalance: ${counterbalance}`)

var trialObj, order = 0, random_high_pos = random(1, 3), condition, not_consent = false, ID;

// Preload all images:

const preload = {
    type: jsPsychPreload,
    images: [
        'src/img/wm/diferente.jpg',
        'src/img/wm/igual.jpg',
        'src/img/wm/memory_test.jpg',
        'src/img/wm/memory.jpg',
        'src/img/wm/secuencia.jpg',
        'src/img/dni.jpg',
        'src/img/medals/MedalDisplay.jpg',
        'src/img/medals/medal0.png',
        'src/img/medals/medal1.png',
        'src/img/medals/medal2.png',
        'src/img/medals/medal3.png',
        'src/img/medals/medal4.png',
        'src/img/medals/medal5.png',
    ],
    max_load_time: 60000,
    show_detailed_errors: true
}




