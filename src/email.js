jatos.onLoad(() => {
    const jsPsych = initJsPsych({
        on_finish: () => {
            if (window.jatos) {
                //const href = null; uncomment this line and add the ref you want to redirect
                const results = jsPsych.data.get().json();
                jatos.submitResultData(results)
                    .then(jatos.endStudy) //change endStudy to endStudyAjax to use the below line of code
                    //.then(() => {if (href != null) window.location.href = href}) // change href to move to another webpage (e.g. SONA)
                    .catch(() => console.log("Something went wrong"));
            }
        }
    });


    const email_trial = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'text',
                    prompt: "Por favor, introduce tu correo electrónico universitario para poder registrar tu participación:",
                    name: 'email',
                    input_type: "email",
                    placeholder: "ejemplo@estudiante.uam.es",
                    required: true,
                    //validation: "^[a-zA-Z0-9._%+-]+@.*uam.es$", // No funciona
                    textbox_columns: 30,
                }
            ]
        ],
        required_error_text: "Debes introducir un correo valido (@estudiante.uam.es).",
        button_label_finish: "Enviar",
        required_question_label: "",
        on_finish: (data) => {
            jsPsych.data.addProperties({
                email: data.response.email,
                ID: jatos.studySessionData.subjID,
            });
        }
    }


    jsPsych.run([email_trial]);
})