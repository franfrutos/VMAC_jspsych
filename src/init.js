// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;
if (jatos_run) console.log("Run in Jatos server.")
else console.log("Run in local machine.")

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: () => {
        const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
        jatos.submitResultData(results)
            .then(jatos.endStudy)
            .catch(() => console.log("Something went wrong"));
    }
});

const seed = jsPsych.randomization.setSeed(Math.floor(Math.random()*9999));
jsPsych.data.addProperties({
    rng_seed: seed
});

const lab = false;

console.log(`Random seed: ${seed}`)

const counterbalance = random(0, 4);

console.log(`Counterbalance: ${counterbalance}`)

var trialObj;

