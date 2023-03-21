
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

const aspect_ratio = 85.6/53;
const ResizePhase = () => {
    const display_element = document.querySelector(".inst");
    // Event listeners for mouse-based resize
    let dragging = false;
    let origin_x, origin_y;
    let cx, cy, curr_width, curr_height, to_height, to_width;
    const scale_div = display_element.querySelector("#item");
    if (scale_div != null) {
        function mouseupevent() {
            dragging = false;
        }
        display_element.addEventListener("mouseup", mouseupevent);
        function mousedownevent(e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
            origin_y = e.pageY;
            cx = parseInt(scale_div.style.width);
            cy = parseInt(scale_div.style.height);
        }
        display_element
            .querySelector("#jspsych-resize-handle")
            .addEventListener("mousedown", mousedownevent);
        function resizeevent(e) {
            if (dragging) {
                curr_height = scale_div.style.height;
                curr_width = scale_div.style.width;
                let dx = e.pageX - origin_x;
                let dy = e.pageY - origin_y;
                if (Math.abs(dx) >= Math.abs(dy)) {
                    to_width = Math.round(Math.max(20, cx + dx * 2));
                    to_height = Math.round(Math.max(20, cx + dx * 2) / aspect_ratio);
                }
                else {
                    to_height = Math.round(Math.max(20, cy + dy * 2));
                    to_width = Math.round(aspect_ratio * Math.max(20, cy + dy * 2));
                }
                // This limits the maximun size
                if (to_height >= 300 || to_height <= 100) {
                    scale_div.style.height = curr_height + "px";
                    scale_div.style.width = curr_width + "px";
                } else {
                    scale_div.style.height = to_height + "px";
                    scale_div.style.width = to_width + "px";
                }
            }
        }
        display_element.addEventListener("mousemove", resizeevent);
    }
}

const circle_c = (ctx, x, y, r, color) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = color2hex(color);
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
    ctx.strokeStyle = color2hex(color);
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
            [fromx, fromy] = [x-r/4, y];
            [tox, toy] = [x+r/4, y]
        } else {
            [fromx, fromy] = [x, y-r/4];
            [tox, toy] = [x, y+r/4]
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
    const urlvar = (jatos_run)? jatos.urlQueryParameters : jsPsych.data.urlVariables();
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];

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
                    diamond_c(ctx, x, y, 30, "gray");
                    line(ctx, x, y, 30, "#fff", "h");
                } else if (i == 5) {
                    circle_c(ctx, x, y, 30, colorHigh);
                    line(ctx, x, y, 30, "#fff", "r");
                } else { 
                    circle_c(ctx, x, y, 30, "gray");
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
                        diamond_c(ctx, x, y, 30, "gray");
                        line(ctx, x, y, 30, "#fff", "v");
                    } else if (i == 5) {
                        circle_c(ctx, x, y, 30, colorLow);
                        line(ctx, x, y, 30, "#fff", "r");
                    } else { 
                        circle_c(ctx, x, y, 30, "gray");
                        line(ctx, x, y, 30, "#fff", "r");
                    }
                }
            }
        }
    }
    if (c) state = true;
    else state = false;
}

const slider_c = () => {
    const c1 = document.getElementById("myCanvas1");
    const c2 = document.getElementById("myCanvas2");

    const urlvar = (jatos_run)? jatos.urlQueryParameters : jsPsych.data.urlVariables();
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];

    let [ctx1, ctx2] = [c1.getContext("2d"), c2.getContext("2d")];


    circle_c(ctx1, 75, 75, 60, colorHigh);
    circle_c(ctx2, 75, 75, 60, colorLow);

}

const slider_move = () => {
    let [h_p, l_p] = [document.getElementById("high-placeholder"), document.getElementById("low-placeholder")];
    let slider = document.getElementsByClassName("jspsych-slider");
    [h_p.textContent, l_p.textContent] = [100 - slider[0].value, slider[0].value];

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
                    diamond_c(ctx, x, y, 30, "gray")
                    line(ctx, x, y, 30, "#fff", "h")
                }
                else { 
                    circle_c(ctx, x, y, 30, "gray")
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
            diamond_c(ctxh, 150, 75, 60, "gray");
            line(ctxh,150, 75, 60, "#fff", "h");
            diamond_c(ctxv, 150, 75, 60, "gray");
            line(ctxv, 150, 75, 60, "#fff", "v");
        }
    }
    if (h == null) state = true;
    else state = false;
}


const welcome = {
    type: jsPsychHtmlButtonResponse,
    stimulus: wrapper(`
    <p style="margin-bottom: 2rem;">¡Bienevenida/o al experimento!</p>
    <p>Antes de empezar, es necesario que realices este experimento en una <b>habitación tenuemente iluminada</b>, con el menor número de distracciones posible: <b>apaga el teléfono (o ponlo en silencio)</b>.</p>
    <p style="margin-bottom: 2rem;"><b>No cierres ni recargues esta página hasta que se te indique que el experimento ha finalizado</b>.</p>
    <p style="margin-bottom: 3rem;">Una vez te asegures de cumplir con lo expresado arriba, pulsa <b>continuar</b> para empezar.</p>`),
    choices: ['continuar'],
};

const check = {
    type: jsPsychBrowserCheck,
    minimum_width: 1000,
    minimum_height: 500,
    window_resize_message: `
    <p>La ventana de tu navegador es demasiado pequeña para completar este experimento. En caso de que estés haciendo el experimento en una tablet o teléfono móvil, cierra la ventana y sal del experimento </p>
    <p> En caso de que estés haciendo el experimento en un ordenador, maximiza el tamaño de la ventana de tu navegador <b> pulsando la tecla F11 </b>. Si la ventana de tu navegador ya tiene su tamaño máximo, no podrás acceder al experimento.</p>
    <p>La anchura mínima de la ventana es de <span id="browser-check-min-width"></span> px.</p>
    <p>La anchura de tu ventana es de <span id="browser-check-actual-width"></span> px.</p>
    <p>La altura mínima de la ventana es de <span id="browser-check-min-height"></span> px.</p>
    <p>La altura de tu ventana es de <span id="browser-check-actual-height"></span> px.</p>`,
    resize_fail_button_text: `No puedo ajustar la pantalla`,
    inclusion_function: (data) => {
        return data.mobile == false;
      },
      exclusion_message: (data) => {
        if(data.mobile){
          return '<p>Debes hacer el experimento en un ordenador o un portátil.</p> <p>Puedes cerrar esta página cuando quieras.</p>';
        }
        return `<p>No cumples con los requisitos para participar en este experimento.</p> <p>Puedes cerrar esta página cuando quieras.</p>`
    },
};


// Instructions
const instructions_cal = {
    type:jsPsychInstructions,
    pages: [
        wrapper(`<p>Antes de comenzar con el experimento vas a realizar una breve fase de calibración, que va a consistir de en dos pequeñas pruebas. 
        Con la calibración vamos a ajustar el tamaño de los estímulos que te vamos a presentar a la distancia a la que te encuentras de la pantalla. Ahora vamos a explicarte cómo vamos a realizar este procedimiento antes de llevarlo a cabo.</p>
        <p>Antes de empezar con la calibración, <b>asegúrate de adoptar una posición que te permita extender las manos al teclado con comodidad</b>. Además, <b>debes intentar centrarte lo máximo que
        puedas en la pantalla de tu ordenador</b>. Intenta mantenerte en esa postura durante todo el experimento.</p>`),
        wrapper(`<p>La primera prueba va a consistir en ajustar un objeto presentado por pantalla a una tarjeta con un tamaño estandarizado. Servirán tarjetas de crédito/débito, carné de conducir, DNI o la tarjeta universitaria. 
        Deberás utilizar una de dichas tarjetas para hacer que la tarjeta que aparezca por pantalla tenga el mismo tamaño. Para ello, puedes <b>arrastrar la esquina inferior derecha de la tarjeta para cambiar su tamaño</b>.</p>
        <p>Puedes probar a ajustar el tamaño de la tarjeta para prácticar antes de proceder con la calibración:</p>
        <div id="item" style="border: none; height: 200px; width: ${aspect_ratio*200}px; background-color: #ddd; position: relative; background-image: url('src/img/dni.jpg'); background-size: 100% auto; background-repeat: no-repeat;">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: 25px; height: 25px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
        </div>
        <p>En caso de que no tengas ninguna tarjeta, también es posible utilizar una regla. Si optas por una regla, deberás ajustar la tarjeta para que tenga una anchura de 85.6 milímetros.</p>`),
        wrapper(`<p>En la segunda prueba vamos a estimar dónde se encuentra tu punto ciego visual, cuya posición va a depender de la distancia a la que te encuentres de la pantalla. Por tanto, esta prueba es fundamental para poder ajustar el tamaño de los estímulos en pantalla.</p>
        <p>Para que puedas familirarizarte con la tarea antes de la calibración, aquí te presentamos el procedimiento que vas a tener que llevar a cabo para que puedas practicar.</p>
        <p>Prueba lo siguiente:</p>
        <ol style="max-width:90%;">
        <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
        <li>Tápate el ojo derecho con la mano derecha.</li>
        <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
        <li>Cuando pulses la barra espaciadora el <b style = "color:red;">círculo rojo</b> comenzará a moverse.</li>
        <li>Pulsa la barra espaciadora cuando percibas que el círculo desaparece.</li>
        </ol>
        <div id="virtual-chinrest-circle" style="position: absolute;background-color: #f00; width: 30px; height: 30px; border-radius:50px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute;background-color: #000; width:30px; height:30px"></div>
        `, false, true),
        wrapper(`<p>Si quieres repasar las instrucciones, pulsa <b>retroceder</b> para volver a leerlas.</p>
        <p>Si no, pulsa <b>seguir</b> para empezar con la calibración.</p>`, true)
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
        document.addEventListener("click", ResizePhase);
    },
    on_finish: () => {
        document.removeEventListener("click", setBall);
        document.removeEventListener("keydown", cal_c);
        document.removeEventListener("click", ResizePhase);

        state = false;
    }
}


const full_on = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: `<p>Antes de empezar con la calibración, vamos a pasar a modo pantalla completa.</p>
    <p>En caso de que accidentamente salgas del modo pantalla completa, puedes volver activarlo pulsando la tecla <b>F11</b>.</p>
    <p>Pulsa el botón <b>pantalla completa</b> para empezar con la calibración.</p>`,
    button_label: "Pantalla completa",
};

const full_off = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
};

// Virtual chin-rest
const resize = {
    type: jsPsychVirtualChinrest,
    blindspot_reps: 5,
    resize_units: "none",
    post_trial_gap:500,
    viewing_distance_report: "none",
    item_path: 'src/img/dni.jpg',
    adjustment_prompt: `
    <div style="text-align: left;">
    <p>Haz clic y arrastra la esquina inferior derecha de la imagen hasta que tenga el mismo tamaño que una tarjeta de tamaño estandarizado sostenida contra la pantalla.</p>
    <p>Si no tienes acceso a una tarjeta real, puedes utilizar una regla para medir la anchura de la imagen. Debes asegurarte de que la anchura es de 85.6 mm (8.56 cm).</p>
    </div>`,
    adjustment_button_prompt: `Haz clic aquí cuando la imagen tenga el tamaño correcto`,
    blindspot_prompt: `<p>Ahora vamos a medir a qué distancia te encuentras de la pantalla:</p>
    <div>
    <ol style="max-width:80%; text-align: left;">
    <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
    <li>Tápate el ojo derecho con la mano derecha.</li>
    <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
    <li>Cuando pulses la barra espaciadora el <b style = "color:red;">círculo rojo</b> comenzará a moverse. </li>
    <li>Pulsa la barra espaciadora cuando percibas que el círculo desaparece.</li>
    </div>
    </ol>
    <p style = "margin-bottom: 30px;">Pulsa la barra espaciadora para empezar.</p>`,
    blindspot_measurements_prompt: `repeticiones pendientes: `,
    on_finish: (data) => {
        jsPsych.data.addProperties({px2deg: data.px2deg,
        viewing_distance: data.view_dist_mm,});
    }
};

const instructions_prac = {
    type:jsPsychInstructions,
    pages: [
        wrapper(`<p>Ya has terminado la calibración, ahora vamos a empezar con el experimento.</p>
        <p>Durante la tarea se te presentarán por pantalla 6 figuras conformando un círculo imaginario. En primer lugar, deberás atender a la <b>figura que es diferente</b> al resto. Esta siempre será un <b>rombo</b>.</p>
        <canvas id="myCanvas" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
        <p>Lo que puedes ver arriba es un ejemplo de lo que verás durante el experimento.</p>`),
        wrapper(`<p>Dentro de cada figura aparecerá una línea. Tu tarea consistirá en <b>determinar la orientación de la línea que se encuentra dentro del rombo</b>.</p>
        <div style = "display: flex; flex-direction: row; justify-content: space-around; margin-top: 30px;">
        <div>
        <canvas id="h" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la línea es horizontal, pulsa C.</b></p>
        </div>
        <div>
        <canvas id="v" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la línea es vertical, pulsa G.</b></p>
        </div>
        </div>
        <p>Es necesario que <b>utilices ambas manos</b> para emitir una respuesta. Para ello, <b>coloca el dedo índice de tu mano izquierda sobre la tecla C</b> y <b>el dedo índice de tu mano derecha sobre la tecla G</b>
        mientras estás realizando el experimento.</p>`),
        wrapper(`<p>Antes de empezar con el experimento, vas a realizar una breve fase de práctica para que te familiarices con la tarea.</p>
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

const pre_prac = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Estas a punto de empezar la práctica, recuerda:</p>
    <p><b>Si la línea en el interior del diamante es horizontal, pulsa C</b>.</p>
    <p><b>Si la línea en el interior del diamante es vertical, pulsa G</b>.</p>
    <p>Pulsa la barra espaciadora para empezar la práctica.</p>`,
    choices: [' ']
};

const call_experimenter = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Antes de continuar, avisa al experimentador</p>`,
    choices: ['s']
};



const instructions_exp = {
    type: jsPsychInstructions,
    pages: () => {
        const urlvar = (jatos_run)? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];


        return [
            wrapper(`<p>Has terminado la práctica, ¡muy bien!</p>
            <p>En el experimento van a cambiar algunas respecto a lo que has hecho en la práctica.</p>
            <p>En primer lugar, en función de tu desempeño, en la tarea <b>podrás ganar o perder una determinada cantidad de puntos</b> en cada ensayo. Si respondes correctamente ganarás puntos, mientras que si fallas perderás puntos. 
            Por otro lado, cuanto más rápido respondas, más puntos ganarás (si la respuesta es correcta) o perderás (si no lo es), mientras que si respondes con mayor lentitud la cantidad de puntos ganados o perdidos será menor. En todo caso, si tardas demasiado en contestar no ganarás ni perderás puntos. </p>
            <p>Por tanto, para maximizar la cantidad de puntos que es posible obtener, intenta responder lo más rápido que puedas sin cometer errores.</p>`),
            wrapper(`<p>Otra cosa que va a cambiar en el experimento es que en algunos ensayos uno de <b>los círculos que acompañan al rombo podrán aparecer en otro color</b>. Los colores en los que puede aparecer el círculo son <b>${colors_t(colorHigh)}</b> y <b>${colors_t(colorLow)}</b>.</p>
            <div style = "display: flex; flex-direction: row; justify-content: space-around; margin: 30px auto;">
            <canvas id="myCanvas1" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
            <canvas id="myCanvas2" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
            </div>
            <p><b>El color de los círculos influirá en la cantidad de puntos que puedes ganar</b>.</p>
            <p>Si el círculo se presenta en color <b>${colors_t(colorHigh)}</b> <b>ganarás (o perderás) 10 veces más puntos</b> de lo habitual.</p>
            <p>En el caso de que uno de los círculos aparezca de color <b>${colors_t(colorLow)}</b> no ganarás ni perderás puntos extra.</p>
            <p>Sin embargo, tu tarea sigue siendo la misma: discriminar la orientación de la línea en el interior del diamante. Atender a los círculos solo perjudicará lo bien que hagas la tarea, por lo que <b>trata de ignorar el color de los círculos</b>.</p>`),
            wrapper(`<p>La cantidad de puntos que ganes se traducirá en la obtención de diferentes medallas que irás desbloqueando conforme avance el experimento:</p>
            <img src="src/img/medals/MedalDisplay.jpg" width="700" height="165">
            <p>Los puntos necesarios para ganar cada medalla están calibrados sobre la base de estudios previos, por lo que al final del experimento te informaremos cómo de bien lo has hecho respecto a otros participantes.</p>`),
            wrapper(`<p>Ahora va a empezar al experimento.</p>
            <p>El experimento va a constar de dos fases, cada una con ${`${blocks.toString()} bloque${(blocks > 1) ? `s` : ``}`} de 24 ensayos.</p>
            <p>Entre bloques podrás descansar si lo necesitas.</p>
            <p>La duración aproximada del experimento será de 40 minutos.</p>
            <p>Si quieres repasar las instrucciones, pulsa <b>retroceder</b>. Si quieres continuar, pulsa <b>seguir</b>.`, true),
        ]
    },
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


const pre_exp = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Estas a punto de empezar el experimento, recuerda:</p>
    <p><b>Si la línea en el interior del diamante es horizontal, pulsa C</b>.</p>
    <p><b>Si la línea en el interior del diamante es vertical, pulsa G</b>.</p>
    <p>Pulsa la barra espaciadora para empezar el experimento.</p>`,
    choices: [' ']
};

const slider_instr = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
        const urlvar = (jatos_run)? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];

        return wrapper(`
        <p>Antes de terminar, te vamos a realizar algunas breves preguntas.</p>
        <p>Como sabes, la cantidad de puntos que podías ganar dependía del color que se te presentaba en pantalla.</p>
        <p>En tu caso, se te han podido presentar el color ${colors_t(colorHigh)} o el color ${colors_t(colorLow)}.</p>
        <p>Ahora te vamos a pedir que estimes qué porcentaje de puntos has ganado con cada color, sobre el total de puntos que has ganado en la <b>segunda mitad del experimento</b>.</p>`)
    },
    choices: ["Continuar"]
}


const questions = {
    type: jsPsychSurveyHtmlForm,
    preamble: `<h3 style="margin-bottom: 40px">Preguntas post-experimento:</h3>`,
    html: `<div id="form">
    <label class="statement">¿Con qué frecuencia crees te has distraido durante la tarea (p.ej. por una notificación del móvil o ruido ambiental)?</label>
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
    <label class="statement">¿Tienes algún comentario respecto al experimento? Puedes expresar tu opinión debajo:</label>
    <textarea id="text" name="opinion" rows="5" cols="80" style = "display: block" placeholder="Creo que el experimento..."></textarea> </br>
    </div>
    <p style="display: block; margin-bottom: 50px">Una vez que hayas respondido a las preguntas, pulsa ${(lab)? `<b>continuar</b>`:`<b>terminar</b> para salir del experimento`}.</p>`,
    button_label: () => {
        return (lab)? "Continuar": "Terminar";
    },
    on_finish: (data) => {
        jsPsych.data.addProperties({
            distraction_rating: data.response["likert"] || "none",
            opinion_text: data.response["opinion"] || "none",
        })
        data.response = "none"
        if (jatos_run) {
            const results = jsPsych.data.get().filter([{trial_type: "psychophysics"}, { trial_type: "survey-html-form" }]).json();
            jatos.submitResultData(results);
        }
    }
  }