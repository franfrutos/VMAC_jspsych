// Initialize jsPsych
const jsPsych = initJsPsych({

});

const seed = jsPsych.randomization.setSeed(Math.floor(Math.random()*9999));
jsPsych.data.addProperties({
    rng_seed: seed
});

console.log(`Random seed: ${seed}`)
// Run in JATOS server?
const jatos_run = window.jatos !== undefined || false;
if (jatos_run) console.log("Run in Jatos server.")
else console.log("Run in local machine.")

// Experiment parameters
const urlvar = jsPsych.data.urlVariables();
const norew = (urlvar.phase != undefined && ["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase)))? capitalize(urlvar.phase): "Extinction";
const blocks = (Number(urlvar.blocks) == 0)? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined)? false : urlvar.prac != "false" && true;
if (urlvar.phase == undefined) console.log("No phase parameter used. Default is Extinction.")
else if (!["Reversal", "Devaluation", "Omission"].includes(capitalize(urlvar.phase))) console.log(`WARNING: an invalid phase parameter was used. Phase has been set to Extinction.`);

console.log(`Experiment Parameters
Phase: ${norew}. Blocks: ${blocks}. Practice: ${prac}`);

const counterbalance = random(0, 4);
const trialObj = create_trials(blocks, norew, prac);
const [colorHigh, colorLow] = (blocks != 0)? trialObj["Reward"][1].colors: ["orange", "blue"];
if (blocks != 0) console.log(`Color high is ${colorHigh}. Color low is ${colorLow}.`)
