
const wrapper = (text, width = false, amount = 100, bottom = false) => {
    return `<div class = "inst" style = \"${(width) ? `min-width:${amount}%;` : ""}
    ${(bottom) ? "margin-bottom:60px;" : ""}\"> ${text}</div>`
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
    if (ball != null) {
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
        } else {
            state = false;
            cancelAnimationFrame(ball_animation_frame_id);
            setBall();
        }
    }
}

const aspect_ratio = 85.6 / 53;
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
    ctx.lineWidth = 7;
    ctx.stroke();
}

const diamond_c = (ctx, x, y, r, color) => {
    ctx.lineWidth = 3;
    ctx.beginPath();

    ctx.moveTo(x, y - r);

    // top left edge
    ctx.lineTo(x - r, y);

    // bottom left edge
    ctx.lineTo(x, y + r);

    // bottom right edge
    ctx.lineTo(x + r, y);

    // closing the path automatically creates
    // the top right edge
    ctx.closePath();
    //context.linewidth = line_w;
    ctx.strokeStyle = color2hex(color);
    ctx.lineWidth = 7;
    ctx.stroke();
}

const line = (ctx, x, y, r, color, mode, i) => {
    ctx.lineWidth = 3;
    let fromx, fromy, tox, toy, pos;
    if (mode == "r") {
        pos = (i % 2 == 0)? 0: 1;
        const theta = radians([45, 135][pos]);
        [fromx, fromy] = [(-r / 2 * Math.cos(theta)) + x, (-r / 2 * Math.sin(theta)) + y];
        [tox, toy] = [(r / 2 * Math.cos(theta)) + x, (r / 2 * Math.sin(theta)) + y];
    } else if (mode == "h") {
        [fromx, fromy] = [x - r / 2, y];
        [tox, toy] = [x + r / 2, y]
    } else {
        [fromx, fromy] = [x, y - r / 2];
        [tox, toy] = [x, y + r / 2]
    }

    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();
}


const cross_c = (ctx, x, y, r) => {
    ctx.lineWidth = 3;
    let fromx, fromy, tox, toy;
    for (let i = 0; i < 2; i++) {
        if (i) {
            [fromx, fromy] = [x - r / 4, y];
            [tox, toy] = [x + r / 4, y]
        } else {
            [fromx, fromy] = [x, y - r / 4];
            [tox, toy] = [x, y + r / 4]
        }
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3.5;
        ctx.stroke();
    }
}

const exp_c = () => {
    const c = document.getElementById("myCanvas1");
    const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
    if (c!= null && state) state = false;
    else state = true;
    if (c) {
        if (state) state = false;
        else state = true;
        if (!state) {
            let ctx = c.getContext("2d");
            const coordinates = xy_circle(100);
            cross_c(ctx, 200, 150, 30);
            let x, y;
            for (let i = 0; i < 6; i++) {
                [x, y] = coordinates[i];
                [x, y] = [x + 200, y + 150];
                if (i == 2) {
                    diamond_c(ctx, x, y, 30, "gray");
                    line(ctx, x, y, 30, "#fff", "h");
                } else if (i == 5) {
                    circle_c(ctx, x, y, 30, colorHigh);
                    line(ctx, x, y, 30, "#fff", "r", i);
                } else {
                    circle_c(ctx, x, y, 30, "gray");
                    line(ctx, x, y, 30, "#fff", "r", i);
                }
            }
            const c2 = document.getElementById("myCanvas2");
            if (c2) {
                let ctx = c2.getContext("2d");
                cross_c(ctx, 200, 150, 30);
                const coordinates = xy_circle(100);
                let x, y;
                for (let i = 0; i < 6; i++) {
                    [x, y] = coordinates[i];
                    [x, y] = [x + 200, y + 150];
                    if (i == 2) {
                        diamond_c(ctx, x, y, 30, "gray");
                        line(ctx, x, y, 30, "#fff", "v");
                    } else if (i == 5) {
                        circle_c(ctx, x, y, 30, colorLow);
                        line(ctx, x, y, 30, "#fff", "r", i);
                    } else {
                        circle_c(ctx, x, y, 30, "gray");
                        line(ctx, x, y, 30, "#fff", "r", i);
                    }
                }
            }
        }
    }
    const [h, v] = [document.getElementById("h"), document.getElementById("v")];
    if (h != null && state) state = true;
    else state = false;
    //if (h == null) counter = 0;
    if (h) {
        if (state) state = false;
        else state = true;
        if (!state) {
            let ctxh = h.getContext("2d");
            let ctxv = v.getContext("2d");
            diamond_c(ctxh, 150, 75, 60, "gray");
            line(ctxh, 150, 75, 60, "#fff", "h");
            diamond_c(ctxv, 150, 75, 60, "gray");
            line(ctxv, 150, 75, 60, "#fff", "v");
        }
    }
}

const slider_c = () => {
    const c1 = document.getElementById("myCanvas1");
    const c2 = document.getElementById("myCanvas2");

    const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
    const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
    const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];

    let [ctx1, ctx2] = [c1.getContext("2d"), c2.getContext("2d")];


    circle_c(ctx1, 75, 75, 60, colorHigh);
    circle_c(ctx2, 75, 75, 60, colorLow);

}

const slider_move = () => {
    let [h_p, l_p] = [document.getElementById("high-placeholder"), document.getElementById("low-placeholder")];
    let slider = document.getElementsByClassName("jspsych-slider");
    [h_p.textContent, l_p.textContent] = (random_high_pos == 1)?
        [100 - slider[0].value, slider[0].value]:
        [slider[0].value, 100 - slider[0].value];

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
            for (let i = 0; i < 6; i++) {
                [x, y] = coordinates[i];
                [x, y] = [x + 200, y + 150];
                if (i == 2) {
                    diamond_c(ctx, x, y, 30, "gray")
                    line(ctx, x, y, 30, "#fff", "h")
                }
                else {
                    circle_c(ctx, x, y, 30, "gray")
                    line(ctx, x, y, 30, "#fff", "r", i)
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
            line(ctxh, 150, 75, 60, "#fff", "h");
            diamond_c(ctxv, 150, 75, 60, "gray");
            line(ctxv, 150, 75, 60, "#fff", "v");
        }
    }
    if (h == null) state = true;
    else state = false;
}

const pre_consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: wrapper(`<p>¡Gracias por tu interés en participar en el estudio!</p>
    <p>Antes de comenzar, te vamos a mostrar la hoja de información del estudio y sobre el tratamiento de tus datos, así como el consentimiento informado sobre tu participación.</p>
    <p>Al terminar deberás contestar algunas breves cuestiones socio-demográficas y de salud.</p>
    <p>Cuando quieras comenzar pulsa <b>continuar</b>.`, true, 80),
    choices: ['Continuar'],
}
const consentInf = {
    type: jsPsychHtmlButtonResponse,
    stimulus:function() {
/*         document.getElementById("jspsychTargetMLP").style.position = "static";
        document.getElementById("jspsychTargetMLP").style.height = "100%";
        document.getElementById("jspsychTargetMLP").style.width = "100%";
        document.getElementById("jspsychTargetMLP").style.top = "0%";
        document.getElementById("jspsychTargetMLP").style.left = "0%";
        document.getElementById("jspsychTargetMLP").style.margin = "0"; */


        var sf = '90%';
        var lh = '150%';
        var mWidth = '10px 0px';

        const htmlStr = `
        <div style = "max-width:70%; margin: 2% auto;border: 1px solid #ccc; padding: 0 5%;">
        <p><b>Hoja de Información</b><br>
        <i style = "font-size:14px">Departamente de Psicología Experimental de la Universidad de Granada</i></p>
        <hr>
        <div style = "text-align:left; font-size: 16px; padding-left: 10px;">
        <p>Nombre del estudio: Distracción visual y memoria de trabajo.</p>
        <p>Investigador responsable: Juan Lupiáñez.</p>
        <p>Alumno Responsable: Francisco Garre-Frutos | Email: <a href="mailto:fgfrutos@ugr.es">fgfrutos@ugr.es</a>.</p>
        <p>Código del estudio: VMACWM</p>
        </div>
        <hr>
        <p style = "font-size: 14px; text-align:left;">Lea esta información detenidamente: Se solicita su participación voluntaria en un estudio que se enmarca en el proyecto de investigación PSI2017-84926-P, financiada por el MINECO. El comité de ética de la Universidad de Granada ha aprobado la 
        realización de este proyecto con el código: 175/CEIH/2017.Antes de participar en el estudio, por favor lea la información que le proporcionamos a continuación.</p>
        <p style="font-size:16px"><b>Información sobre el estudio y su participación en el mismo</b></p>
        <div style="font-size:16px;line-height:190%;margin:${mWidth};font-size:${sf};line-height:${lh}; text-align:left;">
        <p><b>¿Cuál es el objetivo del estudio?</b><br>
        El objetivo es este estudio es continuar una investigación ya iniciada sobre la relación entre procesos de distracción visual y memoria, donde se busca estudiar posibles sustratos comunes a ambos procesos. Este estudio lo dirige el Dr. Juan Lupiáñez y su equipo colaborador. El estudio tendrá lugar en modalidad online, en el ordenador personal de la persona que realiza el estudio. 
        </p>
        <p><b>¿Qué procedimientos llevaré a cabo?</b><br>
        Su participación consistirá en contestar algunas preguntas y realizar sencillas tareas de ordenador en las que debe discriminar y responder a distintos estímulos mientras registramos el tiempo que tarda en emitir una respuesta a cada 
        estímulo, así como la precisión de la misma. En total el experimento durará aproxamadamente 60 minutos.
        </p>
        <p><b>¿Tiene algún inconveniente participar en el estudio?</b><br>
        La tarea de ordenador no presenta ningún inconveniente para el participante, más allá del cansancio que éste pueda sentir por realizar una tarea monótona de ordenador.
        </p>
        <p><b>¿Se me realizará algún tipo de evaluación médica o psicológica?</b><br>
        No, únicamente deberá realizar una tarea experimental en el ordenador.
        </p>
        <p><b>¿Tiene algún beneficio participar en el estudio?</b><br>
        Este estudio no le producirá ningún beneficio directo, pero proporcionará conocimientos científicos sobre la cognición y la conducta humana. Además si el participante estudia el grado de Psicología, será recompensado con dos papeletas experimentales.
        </p>
        <p><b>Confidencialidad</b><br>
        Para proteger su privacidad, la información recogida sobre usted se etiquetará tan sólo con un código numérico. Sus resultados se almacenarán en papel o en formato electrónico, sin identificarle por el nombre, y se utilizarán solamente dentro del contexto del proyecto. Los resultados derivados de este estudio pueden publicarse en alguna revista científica o
        congreso, sin prejuicio del compromiso de confidencialidad. El acceso a estos datos queda restringido a nuestro equipo de investigación.
        </p>
        <p><b>Acuerdo de participación en el estudio</b><br>
        Esta hoja contiene información para que usted pueda decidir si desea participar en este estudio. Si tiene alguna pregunta que permanezca sin contestar, por favor pregunte al encargado del estudio antes de firmar este formulario. Puede contactar con el investigador principal, Dr. Juan Lupiáñez a través del e-mail: <a href="mailto:jlupiane@ugr.es">jlupiane@ugr.es</a>.
        Si le surge cualquier duda que no desee transmitir al Dr. Juan Lupiáñez, puede usted ponerse en contacto con la Directora del CIMCYC, Dr. María Ruz a través de email (<a href="mailto:cimcyc@ugr.es">cimcyc@ugr.es</a>).
        <br><br>La participación en este estudio es voluntaria, y no tiene que participar en el estudio si usted no lo quiere. Si decide finalmente participar, recibirá una copia de esta descripción.
        </div>
        <p style="font-size:16px"><b>Información <u>adicional</u> sobre protección de datos</b></p>
        <div style="font-size:16px;line-height:190%;margin:${mWidth};font-size:${sf};line-height:${lh}; text-align:left;">
        <p><b>¿Quién es el responsable del tratamiento de sus datos?</b><br>
        <b>Identidad</b>: Secretaría General de la Universidad de Granada<br>
        Dirección postal: Hospital Real<br>
        Avenida del Hospicio s/n<br>
        18071 Granada<br>
        Teléfono: + 34 958 243021<br>
        Correo electrónico:<a href="mailto:protecciondedatos@ugr.es">protecciondedatos@ugr.es</a><br><br>
        <b>Contacto Delegada de protección de datos</b>: <a href="mailto:delegadapd@ugr.es">delegadapd@ugr.es</a>
        </p>
        <p><b>¿Con qué finalidad tratamos sus datos personales?</b><br>
        Explorar la captura atencional de los estímulos objetivos y distractores de los participantes con el fin de continuar con una investigación ya iniciada, y gestión de la recogida de datos personales.
        </p>
        <p><b>Plazo previsto de conservación de datos:</b><br>
        Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recabaron y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos.
        </p>
        <p><b>Decisiones automatizadas, perfiles y lógica aplicada:</b><br>
        Sus datos no se utilizarán para decisiones automatizadas ni para la elaboración de perfiles.
        </p>
        <p><b>¿Cuál es la legitimación para el tratamiento de sus datos?</b><br>
        El interesado dio su consentimiento explícito para el tratamiento de dichos datos personales los fines especificados. (Art. 6.1.a, y Art.9.2.a) del Reglamento General de Protección de datos del Reglamento General de Protección de Datos.
        </p>
        <p><b>¿Cuáles son sus derechos respecto al tratamiento de sus datos?</b><br>

        Usted tiene derecho:
        <ul style="padding-left:10%;">
        <li>Retirar el consentimiento prestado en el momento que lo desee.</li>
<li>Solicitar el acceso a los datos personales que tratamos sobre usted.</li>
<li>Solicitar su rectificación o supresión.</li>
<li>Solicitar la portabilidad de sus datos.</li>
<li>En determinadas circunstancias, solicitar la limitación del tratamiento de sus datos, en cuyo caso únicamente los
conservaremos para el ejercicio o la defensa de reclamaciones.</li>
<li>En determinadas circunstancias y por motivos relacionados con su situación particular, oponerse al tratamiento de
sus datos. La UGR dejará de tratar los datos, salvo por motivos legítimos o el ejercicio o la defensa de posibles
reclamaciones.</li>
        </ul>
        Estos derechos podrán ejercerse ante el responsable del tratamiento indicado anteriormente.<bR><br>
        La normativa e impresos están disponibles en la siguiente dirección:
        <a href="http://secretariageneral.ugr.es/pages/proteccion_datos/derechos">http://secretariageneral.ugr.es/pages/proteccion_datos/derechos</a><br><br>
        Puede asimismo obtener información en la siguiente dirección de correo electrónico: protecciondedatos@ugr.es<br><br>
        Asimismo, le informamos de que si usted presenta una solicitud para el ejercicio de estos derechos y considera que no
        ha sido atendida adecuadamente por nuestra institución, puede presentar una reclamación ante la Agencia Española de
        Protección de Datos de acuerdo con el procedimiento previsto en la siguiente dirección:
        <a href = "https://sedeagpd.gob.es/sede-electronica-web/vistas/formReclamacionDerechos/reclamacionDerechos.jsf">https://sedeagpd.gob.es/sede-electronica-web/vistas/formReclamacionDerechos/reclamacionDerechos.jsf</a>
        </p>
        <p><b>¿A qué destinatarios se comunicarán sus datos?</b><br>
        No se prevén cesiones o comunicaciones de datos. No se efectúan transferencias internacionales.
<p><b>¿Cómo hemos obtenido sus datos?</b><br>
Los datos personales objeto de tratamiento son los que usted mismo nos ha facilitado. Las categorías de datos que
tratamos son: <br><br>
Datos de carácter identificativo: Apellidos, nombre, DNI/NIF, correo electrónico, firma.<br>
Datos de características personales: edad, sexo.<br>
Datos de categorías especiales: salud (ejecución en la tarea de ordenador).
</p>
        </div>
        </div>`;

        return htmlStr;
    },
    choices: ['<p style="font-size:130%;line-height:0%;"><b>Continuar</b></p>'],
    button_html: '<button class="jspsych-btn" style = "margin-bottom:50px;">%choice%</button>'
};

const consentConf = {
    type: jsPsychHtmlButtonResponse,
    stimulus:function() {
/*         document.getElementById("jspsychTargetMLP").style.position = "static";
        document.getElementById("jspsychTargetMLP").style.height = "100%";
        document.getElementById("jspsychTargetMLP").style.width = "100%";
        document.getElementById("jspsychTargetMLP").style.top = "0%";
        document.getElementById("jspsychTargetMLP").style.left = "0%";
        document.getElementById("jspsychTargetMLP").style.margin = "0"; */


        const html = `
<div style=" text-align:left; font-size: 14px; max-width:90%; margin: 2% auto;border: 1px solid #ccc; padding: 0 5%;">
<p style="text-align:center";><b>CONSENTIMIENTO POR ESCRITO DEL/LA PARTICIPANTE SOBRE PARTICIPACIÓN Y TRATAMIENTO DE DATOS PERSONALES</b></p>

<ul style="text-align:left">
  <li>He leído la hoja de información que se me ha entregado.</li>
  <li>Comprendo que mi participación es voluntaria.
  <li>Comprendo que puedo retirarme del estudio:
      <ol>
      <li>Cuando quiera</li>
      <li>Sin tener que dar explicaciones</li>
    </ol>
  </li>
  </li>
</ul>

<p>Presto libremente mi conformidad para participar en el estudio. Los resultados obtenidos en este estudio solo serán utilizados para los fines específicos del mismo.</p>

<p>Derecho explícito de la persona a retirarse del estudio. Garantías de confidencialidad. La participación en el estudio es libre y voluntaria. En cualquier momento la persona podrá retirarse del estudio y siempre agradeceremos su participación. Los datos de los participantes serán anónimos en todo caso. En aquellas situaciones en las que sea necesario retener la identidad de la persona, los archivos asociando su nombre con el código de sus datos se mantendrán en ordenadores protegidos por contraseña de seguridad y/o en archivadores bajo llave custodiada por la investigadora principal. Los datos serán utilizados para su análisis y posterior estudio por la investigadora principal y los miembros del grupo investigador.</p>

<table border="1" cellpadding="1" cellspacing="1">
	<tbody>
		<tr>
			<td>
			<p style="text-align: center;"><strong>Responsable</strong></p>
			</td>
			<td style="text-align: left;">
			<p style="margin-left: 40px;">UNIVERSIDAD DE GRANADA</p>
			</td>
		</tr>
		<tr>
			<td>
			<p style="text-align: center;"><strong>Legitimación</strong></p>
			</td>
			<td>
			<p style="margin-left: 40px;">La/el interesada/o&nbsp;ha dado su consentimiento para el tratamiento de sus datos personales para uno o varios fines específicos; legitimado en el art. 6.1 a y. 9.2.a RGPD)</p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center;"><strong>Finalidad</strong></td>
			<td>
			<p style="margin-left: 40px;">Gestión de la recogida y tratamiento de datos personales. <span style="background-color:#ffffff;">Medición de variables relacionadas con hábitos de consumo, hábitos de sueño y ejercicio y variables psicológicas.</span></p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center;"><strong>Destinatarios</strong></td>
			<td>
			<p style="margin-left: 40px;">No se prevén cesiones o comunicaciones de datos</p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center;"><strong>Derechos</strong></td>
			<td>
			<p style="margin-left: 40px;">Tiene derecho a retirar su consentimiento y a solicitar el acceso, oposición, rectificación, supresión, portabilidad o limitación del tratamiento de sus datos, tal y como se explica en la información adicional</p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center;"><strong>Información adicional</strong></td>
			<td>
			<p style="margin-left: 40px;">La/el interesada/o ha leído y puede remitirse a esa información en el siguiente <a href="https://drive.ugr.es/index.php/s/ipDyMuDcKkPVgQM" onclick="window.open(this.href, '', 'resizable=no,status=no,location=no,toolbar=no,menubar=no,fullscreen=no,scrollbars=no,dependent=no'); return false;">enlace</a>.</p>
			</td>
		</tr>
	</tbody>
</table>
<br>
</div>
<br>`;
        return html;

    },
    on_finish: (data) => {
        if (data.response == 1) {
            not_consent = true;
        };

    },
    choices: ['<p style="font-size:110%;line-height:0%;"><b>Doy mi consentimiento</b></p>', '<p style="font-size:110%;line-height:0%;"><b>No doy mi consentimiento</b></p>'],
    button_html: '<button class="jspsych-btn" style = "margin-bottom:50px;">%choice%</button>'

};

const welcome = {
    type: jsPsychHtmlButtonResponse,
    stimulus: wrapper(`
    <p style="margin-bottom: 2rem;">¡Bienevenida/o al experimento!</p>
    <p>Antes de empezar, es necesario que realices este experimento en una <b>habitación tenuemente iluminada</b>, con el menor número de distracciones posible: <b>apaga el teléfono (o ponlo en silencio)</b>, <b>que no haya nadie más en la habtación</b> y <b>asegurate de evitar cualquier tipo de ruido que pueda distraerte</b>.</p>
    <p>Para asegurarnos que puedes realizar el experimento de forma correcta, por favor, cierra cualquier programa que tengas abierto y todas las pestañas del navegador que no sean el experimento.</p>
    <p style="margin-bottom: 2rem;"><b>No cierres ni recargues esta página hasta que se te indique que el experimento ha finalizado</b>.</p>
    <p style="margin-bottom: 3rem;">Una vez te asegures de cumplir con lo expresado arriba, pulsa <b>continuar</b> para empezar.</p>`),
    choices: ['continuar'],
};

const limit = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: wrapper(`<p>Si estás leyendo esto, es que se ha alcanzado el número de participantes deseado. Por tanto, ahora mismo no es posible participar en el estudio.</p>
    <p>En el caso de que más adelante el estudio siga público en la página de SONA, podrás participar sin ningún problema.</p>
    <p>Cierra esta pestaña para abandonar el estudio.</p>`),
    choices: "NO_KEYS",
};

const out_consent = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: wrapper(`<p>Si estás leyendo esto, es que no has dado el consentimiento necesario para participar en el estudio.</p>
    <p>En caso de que haya sido un error, puedes volver a acceder en el estudio desde <a href = "https://ugr-cimcyc.sona-systems.com/">la página de SONA</a>.</p>
    <p>Si has decidido no participar, puedes cerrar esta pestaña cuando quieras.</p>`, width = true, amount = 100),
    choices: "NO_KEYS",
};

const if_out_cons  = {
    timeline: [out_consent],
    conditional_function: () =>{
        return not_consent;
    }
}

const demo_quests = {
    type: jsPsychSurvey,
    pages: [
        [
            {
                type: 'multi-choice',
                prompt: "¿Cuál es tu género?",
                name: 'gender',
                options: ['Masculino', 'Femenino', 'No binario'],
                required: true
            },
            {
                type: 'text',
                prompt: "¿Cuál es tu edad?",
                name: 'age',
                input_type: "number",
                textbox_columns: 5,
                required: true,
            },
        ],
        [
            {
                type: 'text',
                prompt: "¿Cuál es tu Idioma Nativo?",
                input_type: "text",
                name: 'lenguage',
                textbox_columns: 10,
                required: true,
            },
            {
                type: 'multi-choice',
                prompt: "En caso de que el español no sea tu idioma nativo, ¿Cuál es tu nivel de español?",
                name: 'spanish_level',
                options: ["B1 - Intermedio", "B2 - Intermedio alto", "C1 - Avanzado", "C2 - Maestría"],
                required: false,
            },
        ],
        [
            {
                type: 'multi-choice',
                prompt: "¿Tienes problemas de visión?",
                name: 'vision',
                options: ["No", "Sí, pero uso gafas y/o lentillas", "Sí, y no uso gafas y/o lentillas"],
                required: true,
            },
            {
                type: 'multi-choice',
                prompt: "¿Tienes problemas en la percepción del color o algún tipo de daltonismo?",
                name: 'color_perception',
                options: ["No", "Sí"],
                required: true,
            },
        ],
    ],
    required_error_text: "Debes responder esta pregunta.",
    title: "Preguntas socio-demográficas",
    button_label_next: "Siguiente",
    button_label_back: "Anterior",
    button_label_finish: "Terminar"
};

 const consent_proc = {
    timeline: [pre_consent, consentInf, consentConf, if_out_cons, demo_quests],
    repetitions: 1,
    randomize_order: false,
    //post_trial_gap: 1000,
 }


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
        if (data.mobile) {
            return '<p>Debes hacer el experimento en un ordenador o un portátil.</p> <p>Puedes cerrar esta página cuando quieras.</p>';
        }
        return `<p>No cumples con los requisitos para participar en este experimento.</p> <p>Puedes cerrar esta página cuando quieras.</p>`
    },
};


// Instructions
const instructions_cal = {
    type: jsPsychInstructions,
    pages: [
        wrapper(`<p>Antes de comenzar con el experimento vas a realizar una breve fase de calibración, que va a consistir de en dos pequeñas pruebas. 
        Con la calibración vamos a ajustar el tamaño de los estímulos que te vamos a presentar a la distancia a la que te encuentras de la pantalla. Ahora vamos a explicarte cómo vamos a realizar este procedimiento antes de llevarlo a cabo.</p>
        <p>Antes de empezar con la calibración, <b>asegúrate de adoptar una posición que te permita extender las manos al teclado con comodidad</b>. Además, <b>debes intentar centrarte lo máximo que
        puedas en la pantalla de tu ordenador</b>. Intenta mantenerte en esa postura durante todo el experimento.</p>`),
        wrapper(`<p>La primera prueba va a consistir en ajustar un objeto presentado por pantalla a una tarjeta con un tamaño estandarizado. Servirán tarjetas de crédito/débito, carné de conducir, DNI o la tarjeta universitaria. 
        Deberás utilizar una de dichas tarjetas para hacer que la tarjeta que aparezca por pantalla tenga el mismo tamaño. Para ello, puedes <b>arrastrar la esquina inferior derecha de la tarjeta para cambiar su tamaño</b>.</p>
        <p>Puedes probar a ajustar el tamaño de la tarjeta para prácticar antes de proceder con la calibración:</p>
        <div id="item" style="border: none; height: 200px; width: ${aspect_ratio * 200}px; background-color: #ddd; position: relative; background-image: url('src/img/dni.jpg'); background-size: 100% auto; background-repeat: no-repeat;">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: 25px; height: 25px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
        </div>
        <p>En caso de que no tengas ninguna tarjeta, también es posible utilizar una regla. Si optas por una regla, deberás ajustar la tarjeta para que tenga una anchura de 85.6 milímetros.</p>`),
        wrapper(`<p>En la segunda prueba vamos a estimar dónde se encuentra tu punto ciego visual, cuya posición va a depender de la distancia a la que te encuentres de la pantalla. Por tanto, esta prueba es fundamental para poder ajustar el tamaño de los estímulos en pantalla.</p>
        <p>Para que puedas familirarizarte con la tarea antes de la calibración, aquí te presentamos el procedimiento que vas a tener que llevar a cabo para que puedas practicar.</p>
        <p>Intenta encontrar tu punto ciego antes de empezar la calibración:</p>
        <ol style="max-width:100%;">
        <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
        <li>Tápate el ojo derecho con la mano derecha.</li>
        <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
        <li>Cuando pulses la barra espaciadora el <b style = "color:red;">círculo rojo</b> comenzará a moverse. Atiende al círculo de reojo.</li>
        <li>Pulsa la barra espaciadora cuando percibas que el círculo desaparece.</li>
        </ol>
        <div id="virtual-chinrest-circle" style="position: absolute;background-color: #f00; width: 30px; height: 30px; border-radius:50px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute;background-color: #000; width:30px; height:30px"></div>
        `, false, 100, true),
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
    post_trial_gap: 500,
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
    <ol style="max-width:90%; text-align: left;">
    <li>Pon la mano izquierda en la <b>barra espaciadora</b>.</li>
    <li>Tápate el ojo derecho con la mano derecha.</li>
    <li>Atiende al cuadrado negro con el ojo izquierdo. No dejes de mirarlo.</li>
    <li>Cuando pulses la barra espaciadora el <b style = "color:red;">círculo rojo</b> comenzará a moverse. Atiendelo de reojo.</li>
    <li>Pulsa la barra espaciadora cuando percibas que el círculo desaparece.</li>
    </div>
    </ol>
    <p style = "margin-bottom: 30px;">Pulsa la barra espaciadora para empezar.</p>`,
    blindspot_measurements_prompt: `repeticiones pendientes: `,
    on_finish: (data) => {
        jsPsych.data.addProperties({
            px2deg: data.px2deg,
            viewing_distance: data.view_dist_mm,
        });
    }
};

const instructions_prac = {
    type: jsPsychInstructions,
    pages: [
        wrapper(`<p>Ya has terminado la calibración, ahora vamos a empezar con el experimento.</p>
        <p>Durante la tarea se te presentarán por pantalla 6 figuras conformando un círculo imaginario. En primer lugar, deberás atender a la <b>figura que es diferente</b> al resto. Esta siempre será un <b>rombo</b>.</p>
        <canvas id="myCanvas" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
        <p>Lo que puedes ver arriba es un ejemplo de lo que verás durante el experimento.</p>`),
        wrapper(`<p>Dentro de cada figura aparecerá una línea. Tu tarea consistirá en <b>determinar la orientación de la línea que se encuentra dentro del rombo</b>.</p>
        <div style = "display: flex; flex-direction: row; justify-content: space-around; margin-top: 30px;">
        <div>
        <canvas id="h" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la línea es horizontal, pulsa B.</b></p>
        </div>
        <div>
        <canvas id="v" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
        <p><b>Si la línea es vertical, pulsa J.</b></p>
        </div>
        </div>
        <p>Es necesario que <b>utilices ambas manos</b> para emitir una respuesta. Para ello, <b>coloca el dedo índice de tu mano izquierda sobre la tecla B</b> y <b>el dedo índice de tu mano derecha sobre la tecla J</b>
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
    <p><b>Si la línea en el interior del diamante es horizontal, pulsa B</b>.</p>
    <p><b>Si la línea en el interior del diamante es vertical, pulsa J</b>.</p>
    <p>Pulsa la barra espaciadora para empezar la práctica.</p>`,
    choices: [' '],
    on_finish: () => {
        const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const prac = (urlvar.blocks == 0 && urlvar.blocks != undefined) ? false : (urlvar.prac == "true" || urlvar.prac == undefined) && blocks != 0;

        if (blocks == 0 || prac == false) {
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';  
        }
    }
};

const call_experimenter = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Antes de continuar, avisa al experimentador o experimentadora.</p>`,
    choices: ['s']
};



const instructions_exp = {
    type: jsPsychInstructions,
    pages: () => {
        const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
        const gam = urlvar.gamify =="true" || false;
        const condition = (urlvar.condition != undefined)? capitalize(urlvar.condition): "A1";

        let out = [
            wrapper(`<p>Has terminado la práctica, ¡muy bien!</p>
            <p>En el experimento van a cambiar algunas respecto a lo que has hecho en la práctica.</p>
            <p>En primer lugar, en función de tu desempeño, en la tarea <b>podrás ganar o perder una determinada cantidad de puntos</b> en cada ensayo. Si respondes correctamente ganarás puntos, mientras que si fallas perderás puntos. 
            Por otro lado, cuanto más rápido respondas, más puntos ganarás (si la respuesta es correcta) o perderás (si no lo es), mientras que si respondes con mayor lentitud la cantidad de puntos ganados será menor. Si tardas demasiado en contestar o cometes errores ganarás menos puntos.</p>
            <p>Por tanto, para maximizar la cantidad de puntos que es posible obtener, intenta responder lo más rápido que puedas sin cometer errores.</p>`),
            wrapper(`<p>Otra cosa que va a cambiar en el experimento es que en algunos ensayos uno de <b>los círculos que acompañan al rombo podrán aparecer en otro color</b>. Los colores en los que puede aparecer el círculo son <b>${colors_t(colorHigh)}</b> y <b>${colors_t(colorLow)}</b>.</p>
            <div style = "display: flex; flex-direction: row; justify-content: space-around; margin: 30px auto;">
            <canvas id="myCanvas1" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
            <canvas id="myCanvas2" width="400" height="300" style = "border-radius: 3%; background-color: #000"></canvas>
            </div>
            ${(condition.includes("A"))?`<p><b>El color de los círculos influirá en la cantidad de puntos que puedes ganar</b>.</p>
            <p>Si el círculo se presenta en color <b>${colors_t(colorHigh)}</b> <b>ganarás (o perderás) 10 veces más puntos</b> de lo habitual.</p>
            <p>En el caso de que uno de los círculos aparezca de color <b>${colors_t(colorLow)}</b> no ganarás ni perderás puntos extra.</p>`:``}
            <p>Sin embargo, tu tarea sigue siendo la misma: discriminar la orientación de la línea en el interior del diamante. Atender a los círculos solo perjudicará lo bien que hagas la tarea, por lo que <b>trata de ignorar el color de los círculos</b>.</p>`),
            (gam)?wrapper(`
            <p>La cantidad de puntos que ganes se traducirá en la obtención de diferentes medallas que irás desbloqueando conforme avance el experimento:</p>
            <img src="src/img/medals/MedalDisplay.jpg" width="700" height="165">
            <p>Los puntos necesarios para ganar cada medalla están calibrados sobre la base de estudios previos, por lo que al final del experimento te informaremos cómo de bien lo has hecho respecto a otros participantes.</p>`): 
            null,
            wrapper(`<p>Todo lo demás seguirá siendo exactamente igual. Tu tarea consistirá en <b>determinar la orientación de la línea que se encuentra dentro del rombo</b>.</p>
            <div style = "display: flex; flex-direction: row; justify-content: space-around; margin-top: 30px;">
            <div>
            <canvas id="h" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
            <p><b>Si la línea es horizontal, pulsa B.</b></p>
            </div>
            <div>
            <canvas id="v" width="300" height="150" style = "border-radius: 3%; background-color: #000"></canvas>
            <p><b>Si la línea es vertical, pulsa J.</b></p>
            </div>
            </div>
            <p>Recuerda que es necesario que <b>utilices ambas manos</b> para emitir una respuesta. Para ello, <b>coloca el dedo índice de tu mano izquierda sobre la tecla B</b> y <b>el dedo índice de tu mano derecha sobre la tecla J</b>
            mientras estás realizando el experimento.</p>`),
            `<p>Antes de empezar el experimento, deberás contestar a unas breves preguntas para comprobar que has comprendido las instrucciones.</p>
            <p>Pulsa seguir si quieres empezar</p>`,
        ]

        return out.filter((p) => p != null);
    },
    allow_keys: false,
    button_label_previous: "Retroceder",
    button_label_next: "Seguir",
    show_clickable_nav: true,
    //post_trial_gap: 1000,
    on_load: () => {
        document.addEventListener("click", exp_c);

    },
    on_finish: () => {
        document.removeEventListener("click", exp_c);
    },
    //post_trial_gap: 1000,
}


const pre_exp = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Estas a punto de empezar el experimento, recuerda:</p>
    <p><b>Si la línea en el interior del diamante es horizontal, pulsa B</b>.</p>
    <p><b>Si la línea en el interior del diamante es vertical, pulsa J</b>.</p>
    <p>Pulsa la barra espaciadora para empezar el experimento.</p>`,
    choices: [' '],
    post_trial_gap: () => {
        const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        if(blocks == 0) return 1000;
        return 0;
    },
    on_finish: () => {
        const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        if (blocks == 0) {
            console.log("a")
            document.body.classList.remove("black");
            document.body.style.cursor = 'auto';  
        }
        order++;
    }
};

const slider_instr = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
        const urlvar = (jatos_run) ? jatos.urlQueryParameters : jsPsych.data.urlVariables();
        const blocks = (Number(urlvar.blocks) == 0) ? 0 : (!isNaN(Number(urlvar.blocks))) ? Number(urlvar.blocks) : 12;
        const condition = (urlvar.condition != undefined)? capitalize(urlvar.condition): "A1";
        const [colorHigh, colorLow] = (blocks != 0) ? trialObj["Reward"][1].colors : ["orange", "blue"];
        return wrapper(`
        <p>Antes de ${(order == 1)?`continuar`:`terminar`}, te vamos a ${(order == 2 && condition.includes("2"))?`volver a `:``}realizar una breve pregunta sobre el experimento.</p>
        ${(condition.includes('A'))?`<p>Como sabes, la cantidad de puntos que podías ganar en la tarea que${(order == 1)?` acabas de realizar`:
        ` has realizado al principio del experimento`} dependía del color de uno de los círculos que se te presentaba en pantalla.</p>`:
        `<p>Como sabes, en la tarea que${(order == 1)?` acabas de realizar`:
        ` has realizado al principio del experimento`} se te podían presentar círculos en diferentes colores.</p>`}
        <p>En tu caso, se te han podido presentar el color ${colors_t(colorHigh)} o el color ${colors_t(colorLow)}.</p>
        <p>Ahora te vamos a pedir que estimes qué porcentaje de puntos has ganado con cada color, sobre el total de puntos que has ganado ${(order == 2)?
        `<b>en la primera parte del experimento, en la que podías ganar puntos</b>`: ``}.</p>`)
    },
    choices: ["Continuar"]
}

const pre_wm = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>¡Acabas de llegar a la última parte del experimento!</p>
    <p>Ahora vas a realizar una tarea diferente.</p>
    <p>A partir de este momento <b>ya no ganarás puntos en función de tu rendimiento</b>.</p>
    <p>Aun así, continúa haciendo la siguiente tarea lo mejor que puedas.</p>
    <p>Pulsa la barra espaciadora para continuar.</p>
    `,
    choices: [' '],
    on_finish: () => {
        order++;
    }
}

const prac_wm = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: wrapper(`<p>Primero vas a realizar unos cuantos ensayos de práctica donde los estímulos aparecerán bastante tiempo en pantalla, para que seas capaz de acostumbrarte al ritmo de la tarea.</p>
    <p>Cuando quieras empezar, pulsa la barra espaciadora.</p>`, true, 70),
    choices: [' '],
}

const prac_1_wm = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: wrapper(`<p>Ahora que ya te has acostumbrado, vas a realizar unos cuantos ensayos de práctica más.</p>
    <p>Los siguientes ensayos se presentarán a velocidad normal.</p>
    <p>Antes de empezar, recuerda:</p><p>Si la orientación de la linea cambia, pulsa C.</p><p>Si la orientación de la linea es la misma, pulsa M.</p>
    <p>Pulsa la barra espaciadora para continuar.</p>`, true, 100),
    choices: [' '],

}

const prac_2_wm = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: wrapper(`<p>Ya has terminado la práctica, ¡Muy bien!</p>
    <p>Vas a empezar la última parte del experimento. A partir de ahora los círculos aparecerán en diferentes colores. Sin embargo, tu tarea consistirá en recordar la orientación de las lineas, así que trata de ignorar el color.</p>
    <p>Antes de emprezar, recuerda:</p><p>Si la orientación de la linea cambia, pulsa C.</p><p>Si la orientación de la linea es la misma, pulsa M.</p>
    <p>Pulsa la barra espaciadora para empezar.</p>`, true, 70),
    choices: [' '],

}

const instructions_wm = {
    type: jsPsychInstructions,
    pages: () => {
        cont = false; fail = true;
        return [
            wrapper(`<p>A lo largo de esta segunda tareas te encontrarás con la siguiente estructura en pantalla:</p>
            <img src="src/img/wm/memory.jpg" width="300" height="300", style="border-radius:5%; margin: 30px 0">`, true),
            wrapper(`<p>Tu tarea consistirá en recordar la orientación de las lineas en el interior de todos los círculos.</p>
            <img src="src/img/wm/memory.jpg" width="300" height="300", style="border-radius:5%; margin: 30px 0">`, true),
            wrapper(`<p>Pasado un tiempo, los estímulos desapareceran durante un breve periodo de tiempo. Cuando reaparezcan, se te señalará la orientación de la linea que debes recordar.</p>
            <img src="src/img/wm/memory_test.jpg" width="300" height="300", style="border-radius:5%; margin: 30px 0">`),
            `${wrapper(`
            <p>En función de si la orientación de la linea señalada ha cambiado o no de una presentación a otra, debes dar una de las siguientes respuestas:</p>`)}
            <div style ="display:flex; justify-content:space-evenly; margin: 30px auto;">
            <div style="width:420px;">
                 <img src="src/img/wm/diferente.jpg" width=auto" height="150", style="border-radius:5%">
                <p>Si la orientación de la linea cambia, pusla C.</p>
            </div>
                <div style="width:420px;">
                <img src="src/img/wm/igual.jpg" width=auto" height="150", style="border-radius:5%">
                <p>Si la orientación de la linea es la misma, pusla M.</p>
            </div>
            </div>
            <p>Al igual que en la fase previa, debes <b>emplear ambas manos</b> para emitir una respuesta. cuando realizes la tarea, <b>posa el dedo índice de tu mano izquierda sobre la tecla C y el dedo índice de tu mano derecha sobre la tecla M</b>. Mantente en esa posición durante toda la tarea.</p>`,
            wrapper(`<p>En resumen esta será la secuencia de eventos: </p>
            <img src="src/img/wm/secuencia.jpg" width="900" height="200", style="border-radius:1%; margin:30px auto;">
            <p>Mirando al punto de fijación en todo momento, trata de recordar las orientaciones de todas las lineas de los 4 círculos. Una vez que se te señale uno de los círculos, debes decidir si la orientación ha cambiado o no. </p>`),
            wrapper(`<p>Antes de comenzar, vas a responder unas breves preguntas para asegurarnos de que has entendido las instrucciones.</p>
            <p>Pulsa seguir para empezar.</p>`),
        ]
    },
    on_finish: () => {
        cont = false;
        fail = true;
        console.log(fail, cont)
    },
    allow_keys: false,
    button_label_previous: "Retroceder",
    button_label_next: "Seguir",
    show_clickable_nav: true,
    //post_trial_gap: 1000,
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
    <p style="display: block; margin-bottom: 50px">Una vez que hayas respondido a las preguntas, pulsa ${(lab) ? `<b>continuar</b>` : `<b>terminar</b> para salir del experimento`}.</p>`,
    button_label: () => {
        return (lab) ? "Continuar" : "Terminar";
    },
    on_finish: (data) => {
        jsPsych.data.addProperties({
            distraction_rating: data.response["likert"] || "none",
            opinion_text: data.response["opinion"] || "none",
        })
        data.response = "none"
        if (jatos_run) {
            const results = jsPsych.data.get().filter([{ trial_type: "psychophysics" }, { trial_type: "survey-html-form" }]).json();
            jatos.submitResultData(results);
        }
    }
}