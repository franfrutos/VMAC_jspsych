const wrapper = (text, width = false, bottom = false) => {
    return `<div class = "inst" style = \"${(width)?"min-width:100%;": ""}
    ${(bottom)?"margin-bottom:60px;": ""}\"> ${text}</div>`
}

let ball_animation_frame_id = null;
let state = false;

const animBall = () => {
    const ball = document.querySelector("#virtual-chinrest-circle");
    const dx = -2;
    const x = parseInt(ball.style.left);
    ball.style.left = `${x + dx}px`;
    ball_animation_frame_id = requestAnimationFrame(animBall);    
}

const setBall = () => {
    const ball = document.querySelector("#virtual-chinrest-circle");
    if (ball != null){
        const square = document.querySelector("#virtual-chinrest-square");
        const rectX = document.querySelector(".inst").getBoundingClientRect().width - 30;
        const ballX = rectX * 0.85; // define where the ball is
        ball.style.left = `${ballX}px`;
        square.style.left = `${rectX}px`;
    }
}

const cal_c = (e) => {
    if (e.key == " " ||
    e.code == "Space" ||      
    e.keyCode == 32) {
        if (!state) {
            state = true;
             animBall();
        } else  {
            state = false;
            cancelAnimationFrame(ball_animation_frame_id);
            setBall();
        }
    }
}

const circle_c = (ctx, x, y, r, color) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

const diamond_c = (ctx, x, y, r, color) => {
    ctx.lineWidth = 3;
    ctx.beginPath();
        
    ctx.moveTo(x, y-r);
            
            // top left edge
    ctx.lineTo(x - r,  y);
            
            // bottom left edge
    ctx.lineTo(x, y + r);
            
            // bottom right edge
    ctx.lineTo(x + r, y);
            
            // closing the path automatically creates
            // the top right edge
    ctx.closePath();
     //context.linewidth = line_w;
    ctx.strokeStyle = color;
    ctx.stroke();
}

const line = (ctx, x, y, r, color, mode) => {
    ctx.lineWidth = 3;
    let fromx, fromy, tox, toy;
    if (mode == "r"){
        const theta = radians([45,135][random(0, 2)]);
        [fromx, fromy] = [(-r/2 * Math.cos(theta)) + x, (-r/2 * Math.sin(theta)) + y];
        [tox, toy] = [(r/2 * Math.cos(theta)) + x, (r/2 * Math.sin(theta)) + y];
    } else if (mode == "h") {
        [fromx, fromy] = [x-r/2, y];
        [tox, toy] = [x+r/2, y]
    } else {
        [fromx, fromy] = [x, y-r/2];
        [tox, toy] = [x, y+r/2]
    }

    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = color;
    ctx.stroke();
}


const cross_c = (ctx, x, y, r) => {
    ctx.lineWidth = 3;
    let fromx, fromy, tox, toy;
    for (let i = 0; i < 2; i++) {
        if (i) {
            [fromx, fromy] = [x-r/2, y];
            [tox, toy] = [x+r/2, y]
        } else {
            [fromx, fromy] = [x, y-r/2];
            [tox, toy] = [x, y+r/2]
        }
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }
}

const exp_c = () => {
    const c = document.getElementById("myCanvas1");
    if (c) {
        if (state) state = false;
        else state = true;
        if (state) {
            let ctx = c.getContext("2d");
            const coordinates = xy_circle(100);
            cross_c(ctx, 200, 150, 30);
            let x, y;
            for(let i = 0; i < 6; i++) {
                [x, y] = coordinates[i];
                [x, y] = [x + 200, y + 150];
                if (i == 2) {
                    diamond_c(ctx, x, y, 30, "#808080");
                    line(ctx, x, y, 30, "#fff", "h");
                } else if (i == 5) {
                    circle_c(ctx, x, y, 30, colorHigh);
                    line(ctx, x, y, 30, "#fff", "r");
                } else { 
                    circle_c(ctx, x, y, 30, "#808080");
                    line(ctx, x, y, 30, "#fff", "r");
                }
            }
            const c2 = document.getElementById("myCanvas2");
            if (c2) {
                let ctx = c2.getContext("2d");
                cross_c(ctx, 200, 150, 30);
                const coordinates = xy_circle(100);
                let x, y;
                for(let i = 0; i < 6; i++) {
                    [x, y] = coordinates[i];
                    [x, y] = [x + 200, y + 150];
                    if (i == 2) {
                        diamond_c(ctx, x, y, 30, "#808080");
                        line(ctx, x, y, 30, "#fff", "v");
                    } else if (i == 5) {
                        circle_c(ctx, x, y, 30, colorLow);
                        line(ctx, x, y, 30, "#fff", "r");
                    } else { 
                        circle_c(ctx, x, y, 30, "#808080");
                        line(ctx, x, y, 30, "#fff", "r");
                    }
                }
            }
        }
    }
    if (c) state = true;
    else state = false;
    console.log(state)
}

const prac_c = () => {
    const c = document.getElementById("myCanvas");
    if (c) {
        if (state) state = false
        else state = true;
        if (state) {
            let ctx = c.getContext("2d");
            cross_c(ctx, 200, 150, 30);
            const coordinates = xy_circle(100);
            let x, y;
            for(let i = 0; i < 6; i++) {
                [x, y] = coordinates[i];
                [x, y] = [x + 200, y + 150];
                if (i == 2) {
                    diamond_c(ctx, x, y, 30, "#808080")
                    line(ctx, x, y, 30, "#fff", "h")
                }
                else { 
                    circle_c(ctx, x, y, 30, "#808080")
                    line(ctx, x, y, 30, "#fff", "r")
                }
            }
        }
    }
    const [h, v] = [document.getElementById("h"), document.getElementById("v")];
    //if (h == null) counter = 0;
    if (h) {
        if (state) state = false;
        else state = true;
        if (!state) {
            let ctxh = h.getContext("2d");
            let ctxv = v.getContext("2d");
            diamond_c(ctxh, 150, 75, 60, "#808080");
            line(ctxh,150, 75, 60, "#fff", "h");
            diamond_c(ctxv, 150, 75, 60, "#808080");
            line(ctxv, 150, 75, 60, "#fff", "v");
        }
    }
    if (h == null) state = true;
    else state = false;
}


const welcome = {
    type: jsPsychHtmlButtonResponse,
    stimulus: wrapper(`
    <p style="margin-bottom: 2rem;">??Binevenida/o al experimento!</p>
    <p>Antes de empezar, es necesario que realices este experimento en una <b>habitaci??n tenuamente iluminada</b>, con el menor n??mero de distracciones posible: <b>apagua el tel??fono (o ponlo en silencio)</b>.</p>
    <p style="margin-bottom: 2rem;"><b>No cierres ni recarges esta p??gina hasta que se te indique que el experimento ha finalizado</b>.</p>
    <p style="margin-bottom: 3rem;">Una vez te asegures de cumplir con lo expresado arriba, pulsa <b>continuar</b> para empezar.</p>`),
    choices: ['continuar']
};


// Instructions
// TODO: resize img container
const instructions_cal = {
    type:jsPsychInstructions,
    pages: [
        wrapper(`<p>Antes de comenzar con el experimento, vas a realizar una breve fase de calibraci??n.</p>
        <p>Dado que la tarea se hace online, no hay forma de controlar a qu?? distancia te encuentras de la pantalla. 
        Por tanto, no podemos saber c??mo percibir??s los est??mulos que te vamos a presentar. La calibraci??n servir?? para estimar
         a qu?? distancia te encuentras de la pantalla del ordenador, y as?? poder ajustar los est??mulos para que su tama??o percibido sea similar para todas las personas que realizen el experimento.</p>
        <p>Antes de empezar con la calibraci??n, <b>asegurate de adoptar una posici??n que te permita extender las manos al teclado con comodidad</b>. Adem??s, <b>debes intentar centrarte lo m??ximo que
        puedas en la pantalla de tu ordenador</b>. Es importante que adoptes una postura c??moda, ya que vas a tener que mantenerte en esa posici??n durante un tiempo.</p>`),
        wrapper(`<p>La calibraci??n va a tener dos fases. En primer lugar, no podemos presentarte un est??mulo de un tama??o determinado si no conocemos el tama??o de los pixeles de tu ordenador. </p>
        <p>Una forma sencilla de calcular esa correspondiencia consiste en pedirte que ajustes un objeto presentado por pantalla a un objeto real con un tama??o conocido. Para ello, servir??n tarjetas de tama??o estandarizado como lo son tarjetas de cr??dito/d??bito, carn??t de conducir, DNI o la tarjeta universitaria.</p>
        <div id="item" style="border: none; height: ${(53/85.6)*200}px; width: 200px; background-color: #ddd; position: relative; background-image: url('src/dni.jpg'); background-size: 100% auto; background-repeat: no-repeat;">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: 25px; height: 25px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
        </div>
        <p>Tal cual se presenta arriba, podr??s ajustar el tama??o del rect??ngulo a una de las tarjetas antes mencionadas. En caso de que no tengas ninguna tarjeta, tambi??n es posible utilizar una regla. En el caso de utilizar una regla la anchura de la tarjeta deber?? ser de de 85.6 mil??metros.</p>`),
        wrapper(`<p>Por ??ltimo, en la segunda fase vamos a realizar una peque??a prueba para estimar d??nde se encuentra tu punto ciego visual. El punto ciego es una regi??n de la retina donde realmente no hay visi??n, sin embargo, no solemos ser conscientes de su existencia dado que el punto ciego de un ojo suele quedar oculto por el rango de visi??n del otro.</p>
        <p>La posici??n del punto ciego va a variar en funci??n de la distancia a la que te encuentres de la pantalla. Por eso, esta prueba es tan importante, ya que es la que nos va a permitir estimar a que distancia te encuntras.</p>
        <p>Para que puedas practicar un poco, prueba lo siguiente:</p>
        <ol style="max-width:90%;">
        <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
        <li>T??pate el ojo derecho con la mano derecha.</li>
        <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
        <li>Cuando pulses la barra espaciadora el <b style = "color:red;">c??rculo rojo</b> comenzar?? a moverse. </li>
        <li>Pulsa la barra espaciadora cuando percibas que el c??rculo desaparece.</li>
        </ol>
        <div id="virtual-chinrest-circle" style="position: absolute;background-color: #f00; width: 30px; height: 30px; border-radius:50px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute;background-color: #000; width:30px; height:30px"></div>
        `, false, true),
        wrapper(`<p>Si quieres respasar las instrucciones, pulsa <b>retroceder</b> para volver a leerlas.</p>
        <p>Si no, pulsa <b>seguir</b>.</p>`, true)
    ],
    allow_keys: false,
    button_label_previous: "Retroceder",
    button_label_next: "Seguir",
    show_clickable_nav: true,
    on_load: () => {
        let state = false;
        // Animate ball instructions
        document.addEventListener("click", setBall);
        document.addEventListener("keydown", cal_c);
    },
    on_finish: () => {
        document.removeEventListener("click", setBall);
        document.removeEventListener("keydown", cal_c);
        state = false;
    }
}


// TODO: Show te instimulus in the instructions?
const instructions_exp = {
    type:jsPsychInstructions,
    pages: [
        wrapper(`<p>Has terminado la pr??ctica, ??muy bien!</p>
        <p>En el experimento van a cambiar unas pocas cosas respecto a lo que has hecho en la pr??ctica.</p>
        <p>En primer lugar, en funci??n de tu desempe??o en la tarea <b>podr??s ganar o perder una determinada cantidad de puntos</b> en cada ensayo. Si respondes correctamente ganar??s puntos, mientras que si fallas perder??s puntos. Por otro lado, si respondes r??pido ganar??s o perder??s m??s puntos, pero si tardas en responder la cantidad de puntos que ganes o pierdas disminuir??. Si tardas demasiado en responder no ganar??s o perder??s puntos. </p>
        <p>Para maximizar la cantidad de puntos que es posible obtener, intenta responder lo m??s r??pido que puedas sin cometer errores.</p>`),
        wrapper(`<p>Otra cosa que va a cambiar en el experimento es que en algunos ensayos uno de <b>los c??rculos que acompa??an al diamante pordr?? aparecer en otro color</b>. Los colores en los que puede aparecer el c??rculo son <b>${colors_t(colorHigh)}</b> y <b>${colors_t(colorLow)}</b>.</p>
        <div style = "display: flex; flex-direction: row; justify-content: space-around; margin: 30px auto;">
        <canvas id="myCanvas1" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
        <canvas id="myCanvas2" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
        </div>
        <p>Sin embargo, tu tarea sigue siendo la misma: discriminar la orientaci??n de la l??nea en el interior del diamante. Atender a los c??rculos solo perjudicar?? lo bien que hagas la tarea, por lo que <b>trata de ignorar el color de los c??rculos</b>.</p>`),
        wrapper(`<p>No obstante, <b>el color de los c??rculos tambi??n influir?? en la cantidad de puntos que puedas ganar</b>.</p>
        <p>Si el c??rculo se presenta en color <b>${colors_t(colorHigh)}</b>, se considerara ese ensayo como un ensayo bonus, por lo que <b>ganar??s (o perder??s) 10 veces m??s puntos</b>.</p>
        <p>En el caso de que uno de los c??rculos aparezca de color <b>${colors_t(colorLow)}</b>, <b>no ganar??s puntos extra</b>.</p>`),
        wrapper(`<p>Ahora va a empezar al experimento.</p>
        <p>Si quieres repasar las instrucciones, pulsa <b>retroceder</b>. Si quieres continuar, pulsa <b>seguir</b>.`, true),
    ],
    allow_keys: false,
    button_label_previous: "Retroceder",
    button_label_next: "Seguir",
    show_clickable_nav: true,
    post_trial_gap: 1000,
    on_load: () => {
        document.addEventListener("click", exp_c);

    },
    on_finish: () => {
        //Fade to black transition
        document.body.classList.add("black");
        document.body.style.cursor = 'none';
        document.removeEventListener("click", exp_c);

    },
    post_trial_gap: 1000,
}

const pre_prac = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Estas a punto de empezar la pr??ctica, recuerda:</p>
    <p><b>Si la l??nea en el interior del diamante es horizontal, pulsa C</b>.</p>
    <p><b>Si la l??nea en el interior del diamante es vertical, pulsa G</b>.</p>
    <p>Pulsa la barra espaciadora para empezar la pr??ctica.</p>`,
    choices: [' ']
};

const pre_exp = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Estas a punto de empezar el experimento, recuerda:</p>
    <p><b>Si la l??nea en el interior del diamante es horizontal, pulsa C</b>.</p>
    <p><b>Si la l??nea en el interior del diamante es vertical, pulsa G</b>.</p>
    <p>Pulsa la barra espaciadora para empezar el experimento.</p>`,
    choices: [' ']
};

const instructions_prac = {
    type:jsPsychInstructions,
    pages: [
        wrapper(`<p>Ya has terminado la calibraci??n, ahora vamos a empezar con el experimento.</p>
        <p>Durante la tarea se te presentar??n por pantalla 6 formas conformando un c??rculo imaginario. En primer lugar, deber??s atender a la <b>forma diferente</b> al resto. Esta siempre sar?? un <b>diamante</b>.</p>
        <canvas id="myCanvas" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
        <p>Lo que puedes ver arriba es un ejemplo de lo que ver??s durante el experimento.</p>`),
        wrapper(`<p>Dentro de cada forma aparecer?? una l??nea. Tu tarea consistir?? en <b>reportar la orientaci??n de la l??nea que se encuentra dentro del diamante</b>.</p>
        <div style = "display: flex; flex-direction: row; justify-content: space-around; margin-top: 30px;">
        <div>
        <canvas id="h" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la l??neas es horizontal, pulsa C.</b></p>
        </div>
        <div>
        <canvas id="v" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la l??neas es vertical, pulsa G.</b></p>
        </div>
        </div>
        <p>Es necesario que <b>utilices ambas manos</b> para emitir una respuesta. Para ello, <b>coloca el dedo ??ndice de tu mano izquierda sobre la tecla C</b> y <b>el dedo ??ndice de tu mano derecha sobre la telca G</b>
        mientras est??s realizando el experimento.</p>`),
        wrapper(`<p>Antes de empezar con el experimento, vas a realizar una breve fase de pr??ctica para que te familiarices con la tarea.</p>
        <p>Si quieres repasar las instrucciones, pulsa <b>retroceder</b>. Si quieres continuar, pulsa <b>seguir</b>.`)
    ],
    allow_keys: false,
    button_label_previous: "Retroceder",
    button_label_next: "Seguir",
    show_clickable_nav: true,
    post_trial_gap: 1000,
    on_load: () => {
        prac_c();
        document.addEventListener("click", prac_c);

    },
    on_finish: () => {
        //Fade to black transition
        document.body.classList.add("black");
        document.body.style.cursor = 'none';
        document.removeEventListener("click", prac_c);
        state = false;
    },
    //post_trial_gap: 2000,
}
// Virtual chin-rest
const resize = {
    type: jsPsychVirtualChinrest,
    blindspot_reps: 5,
    resize_units: "none",
    post_trial_gap:500,
    viewing_distance_report: "none",
    item_path: 'src/dni.jpg',
    adjustment_prompt: `
    <div style="text-align: left;">
    <p>Haz clic y arrastra la esquina inferior derecha de la imagen hasta que tenga el mismo tama??o que una tarjeta de tama??o estandarizado sostenida contra la pantalla.</p>
    <p>Si no tienes acceso a una tarjeta real, puedes utilizar una regla para medir la anchura de la imagen. Debes asegurarte de que la anchura es de 85.6 mm (8.56 cm).</p>
    </div>`,
    adjustment_button_prompt: `Haz clic aqu?? cuando cuando la imagen tenga el tama??o correcto`,
    blindspot_prompt: `<p>Ahora vamos a medir a qu?? distancia te encuentras de la pantalla:</p>
    <div>
    <ol style="max-width:80%; text-align: left;">
    <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
    <li>T??pate el ojo derecho con la mano derecha.</li>
    <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
    <li>Cuando pulses la barra espaciadora el <b style = "color:red;">c??rculo rojo</b> comenzar?? a moverse. </li>
    <li>Pulsa la barra espaciadora cuando percibas que el c??rculo desaparece.</li>
    </div>
    </ol>
    <p style = "margin-bottom: 30px;">Pulsa la barra espaciadora para empezar.</p>`,
    blindspot_measurements_prompt: `repeticiones pendientes: `,
    on_finish: (data) => {
        jsPsych.data.addProperties({px2deg: data.px2deg,
        viewing_distance: data.view_dist_mm,});
    }
};


const full_on = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: `<p>Antes de empezar con la calibraci??n, vamos a pasar a modo pantalla completa.</p>
    <p>En caso de que accidentamente salgas del modo pantalla completa, puedes volver activarlo pulsando la tecla <b>F11</b>.</p>
    <p>Pulsa el bot??n <b>pantalla completa</b> para empezar con la calibraci??n.</p>`,
    button_label: "Pantalla completa",
};

const full_off = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
};

const report = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
        const points = jsPsych.data.get().filter({trial_type: "psychophysics"}).select("points").sum();
        return `<p>Acabas de terminar el experimento.</p>
        <p>Has ganado ${formatting(points.toString())} puntos.</p>
        <p>??Muy bien!</p>
        <p>Antes de salir de esta p??gina nos gustar??a que respondieses unas breves preguntas.</p>
        <p>Pulsa continuar para seguir.</p>`
    },
    choices: ['Continuar'],
        on_finish: () => {
        if (jatos_run == true) {
            const results = jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).csv();
            jatos.submitResultData(results);
        }
    }
};

const check = {
    type: jsPsychBrowserCheck,
    minimum_width: 1000,
    minimum_height: 600,
    window_resize_message: `
    <p>La ventana de tu navegador es demasiado peque??a para completar este experimento. Por favor, maximiza el tama??o de la ventana de tu navegador. Si la ventana de tu navegador ya tiene su tama??o m??ximo, no podr??s acceder al experimento.</p>
    <p>La anchura m??nima de la ventana es de <span id="browser-check-min-width"></span> px.</p>
    <p>La anchura de tu ventana es de <span id="browser-check-actual-width"></span> px.</p>
    <p>La altura m??nima de la ventana es de <span id="browser-check-min-height"></span> px.</p>
    <p>La altura de tu ventana es de <span id="browser-check-actual-height"></span> px.</p>`,
    resize_fail_button_text: `No puedo ajustar la pantalla`,
    inclusion_function: (data) => {
        return data.mobile == false;
      },
      exclusion_message: (data) => {
        if(data.mobile){
          return '<p>Debes hacer el experimento en un ordenador o un port??til.</p> <p>Puedes cerrar esta p??gina cuando quieras.</p>';
        }
        return `<p>No cumples con los requisitos para participar en este experimento.</p> <p>Puedes cerrar esta p??gina cuando quieras.</p>`
    },
};

const questions = {
    type: jsPsychSurveyHtmlForm,
    preamble: `<h3 style="margin-bottom: 40px">Preguntas post-experimento:</h3>`,
    html: `<div id="form">
    <label class="statement">??Con qu?? frecuencia crees te has distraido durante la tarea (p.ej. por una notificaci??n del m??vil o ruido ambiental)?</label>
    <ul class='likert'>
      <li>
        <input type="radio" name="likert" value="1">
        <label>Nunca</label>
      </li>
      <li>
        <input type="radio" name="likert" value="2">
        <label></label>
      </li>
      <li>
        <input type="radio" name="likert" value="3">
        <label></label>
      </li>
      <li>
        <input type="radio" name="likert" value="4">
        <label></label>
      </li>
      <li>
        <input type="radio" name="likert" value="5">
        <label>Con mucha frecuencia</label>
      </li>
    </ul>
    <label class="statement">??Tienes alg??n comentario respecto al experimento? Puedes expresar tu opini??n debajo:</label>
    <textarea id="text" name="opinion" rows="5" cols="80" style = "display: block" placeholder="Creo que el experimento..."></textarea> </br>
    </div>
    <p style="display: block; margin-bottom: 50px">Una vez que hayas respondido a las preguntas, pulsa <b>terminar</b> para salir del experimento.</p>`,
    button_label: "Terminar",
    on_finish: (data) => {
        if (jatos_run) {
            const results = jsPsych.data.get().filter([{trial_type: "psychophysics"}, {trial_type: "survey-html-form"}]).csv();
            jatos.submitResultData(results);
        }
    }
  }