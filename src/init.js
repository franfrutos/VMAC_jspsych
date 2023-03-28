// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;
if (jatos_run) console.log("Run in Jatos server.")
else console.log("Run in local machine.")

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: () => {
        if (window.jatos) {
            const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
            jatos.submitResultData(results)
                .then(jatos.endStudy)
                .catch(() => console.log("Something went wrong"));    
        }
    }
});

const seed = jsPsych.randomization.setSeed(Math.floor(Math.random()*9999));
jsPsych.data.addProperties({
    rng_seed: seed
});

const lab = true;

console.log(`Random seed: ${seed}`)

const counterbalance = random(0, 6);

console.log(`Counterbalance: ${counterbalance}`)

var trialObj, order = 0, random_high_pos = random(1, 3);

