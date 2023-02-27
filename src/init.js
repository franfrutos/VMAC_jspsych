// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;
if (jatos_run) console.log("Run in Jatos server.")
else console.log("Run in local machine.")

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).csv())
});

const seed = jsPsych.randomization.setSeed(Math.floor(Math.random()*9999));
jsPsych.data.addProperties({
    rng_seed: seed
});

console.log(`Random seed: ${seed}`)

const counterbalance = random(0, 4);

// Experiment parameters
// Problem setting up query parameters for jatos!!!
var norew, prac, blocks, trialObj, colorHigh, colorLow;
if (!jatos_run) {
    const urlvar = jsPsych.data.urlVariables();
    norew = (urlvar.phase != undefined && ["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase)))? 
    capitalize(urlvar.phase): 
    "Extinction";
    blocks = (Number(urlvar.blocks) == 0)? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    prac = (urlvar.blocks == 0 && urlvar.blocks != undefined)? false : urlvar.prac != "false" && true;


    if (urlvar.phase == undefined) console.log("No phase parameter used. Default is Extinction.")
    else if (!["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used: ${urlvar.phase}. Phase has been set to Extinction.`);

    console.log(`Experiment Parameters
    Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}`);


    trialObj = create_trials(blocks, norew, prac);
    [colorHigh, colorLow] = (blocks != 0)? trialObj["Reward"][1].colors: ["orange", "blue"];
    if (blocks != 0) console.log(`Color high is ${colorHigh}. Color low is ${colorLow}.`)

} else {
    norew = "Extinction"; blocks = 12; prac = true; [colorHigh, colorLow] = [color2hex("orange"), color2hex("green")]; trialObj = create_trials(blocks, norew, prac);
}

