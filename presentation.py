import marimo

__generated_with = "0.23.8"
app = marimo.App(
    width="full",
    app_title="Orbit — Simulador de tareas DevOps",
    layout_file="layouts/presentation.slides.json",
)


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    mo.Html(
        r"""
        <style>
        /* ============================================================
           Orbit — Presentación de slides (marimo + reveal.js)
           Tema oscuro DevOps / Terminal. Estilos embebidos.
           ============================================================ */

        :root {
          --bg:        #09090b;
          --bg-soft:   #111114;
          --panel:     #17171c;
          --border:    rgba(255, 255, 255, 0.10);
          --border-2:  rgba(255, 255, 255, 0.06);
          --txt:       #e9e9ee;
          --txt-dim:   #b4b4bd;
          --txt-mute:  #7c7c87;
          --emerald:   #10b981;
          --emerald-2: #34d399;
          --indigo:    #818cf8;
          --rose:      #fb7185;
          --mono: "JetBrains Mono", "SF Mono", "Fira Code", ui-monospace, Menlo, monospace;
          --sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        html, body, .marimo {
          background: var(--bg) !important;
          color: var(--txt);
          font-family: var(--sans);
        }

        .reveal-viewport { background-color: var(--bg) !important; color: var(--txt) !important; }
        .reveal-viewport .backgrounds, .reveal .backgrounds { background: transparent !important; }
        .reveal { color: var(--txt) !important; font-family: var(--sans) !important; }
        .reveal .slides { text-align: left; }

        body::before {
          content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(1000px 560px at 12% -10%, rgba(129,140,248,0.18), transparent 60%),
            radial-gradient(900px 540px at 92% 6%, rgba(16,185,129,0.16), transparent 60%);
        }
        body::after {
          content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(var(--border-2) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-2) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(circle at 50% 35%, #000 55%, transparent 100%);
          mask-image: radial-gradient(circle at 50% 35%, #000 55%, transparent 100%);
        }

        .reveal .slide, .slide {
          color: var(--txt);
          font-size: 19px;
          line-height: 1.5;
          padding: 8px 26px;
          max-width: 940px;
          margin: 0 auto;
          text-align: left;
        }

        .reveal .slide h1, .slide h1 {
          color: #fff !important;
          font-family: var(--sans) !important;
          font-size: 33px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          line-height: 1.12 !important;
          text-transform: none !important;
          margin: 0 0 4px !important;
        }
        .reveal .slide h2, .slide h2 {
          color: #fff !important;
          font-size: 26px !important;
          font-weight: 700 !important;
          text-transform: none !important;
          margin: 0 0 6px !important;
        }
        .reveal .slide h3, .slide h3 {
          color: var(--emerald-2) !important;
          font-size: 16px !important;
          font-weight: 650 !important;
          text-transform: none !important;
          margin: 0 0 4px !important;
        }
        .reveal .slide p, .slide p,
        .reveal .slide li, .slide li {
          color: var(--txt-dim) !important;
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        .reveal .slide strong, .slide strong { color: #fff; font-weight: 650; }
        .reveal .slide em, .slide em { color: var(--txt); font-style: italic; }
        .reveal .slide a, .slide a { color: var(--emerald-2) !important; text-decoration: none; }

        .slide code {
          font-family: var(--mono);
          font-size: 0.9em;
          color: var(--emerald-2);
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.20);
          border-radius: 6px;
          padding: 0.06em 0.38em;
        }
        .reveal .slide pre, .slide pre {
          width: 100%;
          background: #0c0c0f !important;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px !important;
          margin: 6px 0 !important;
          box-shadow: 0 10px 34px rgba(0,0,0,0.45);
          font-size: 14px !important;
        }
        .slide pre code {
          display: block;
          color: #d4d4d8 !important;
          background: none; border: none; padding: 0;
          font-size: 14px !important;
          line-height: 1.45;
          white-space: pre;
        }

        .kicker {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: var(--mono);
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--emerald-2);
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.24);
          padding: 5px 11px; border-radius: 999px;
          margin-bottom: 12px;
        }
        .kicker::before { content: "▍"; color: var(--emerald); margin-right: 2px; }

        .rule {
          height: 3px; width: 88px; border: 0;
          margin: 8px 0 16px;
          background: linear-gradient(90deg, var(--emerald), var(--indigo));
          border-radius: 3px;
        }

        .lead { font-size: 18px !important; color: var(--txt) !important; max-width: 62ch; }

        .grid { display: grid; gap: 12px; margin-top: 6px; }
        .grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid.cols-3 { grid-template-columns: repeat(3, 1fr); }

        .card {
          background: linear-gradient(180deg, var(--panel), var(--bg-soft));
          border: 1px solid var(--border);
          border-radius: 13px;
          padding: 14px 15px;
        }
        .card h3 { margin: 0 0 4px !important; }
        .card p  { margin: 0 !important; font-size: 14.5px !important; color: var(--txt-dim) !important; }
        .card .tag { display: inline-block; font-family: var(--mono); font-size: 11px; color: var(--indigo); letter-spacing: 0.06em; margin-bottom: 4px; }

        .metric { text-align: center; }
        .metric .num {
          font-family: var(--mono); font-size: 34px; font-weight: 800;
          background: linear-gradient(90deg, var(--emerald-2), var(--indigo));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .metric .lbl { color: var(--txt-mute); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }

        .pills { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
        .pill {
          font-family: var(--mono); font-size: 13px; color: var(--txt);
          background: var(--panel); border: 1px solid var(--border);
          border-radius: 8px; padding: 5px 10px;
        }
        .pill.em { border-color: rgba(16,185,129,0.38); color: var(--emerald-2); }
        .pill.in { border-color: rgba(129,140,248,0.38); color: var(--indigo); }
        .pill.danger { border-color: rgba(251,113,133,0.40); color: var(--rose); }

        .io { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 14px; margin-top: 10px; }
        .io .arrow { font-size: 26px; color: var(--emerald); text-align: center; }
        .io .box { background: #0c0c0f; border: 1px solid var(--border); border-radius: 12px; padding: 14px 15px; }
        .io .box .h { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--txt-mute); margin-bottom: 7px; }
        .io .box .nl { color: var(--txt); font-style: italic; font-size: 15px; }
        .io .box .cmd { font-family: var(--mono); color: var(--emerald-2); font-size: 14.5px; }

        .slide table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .reveal .slide th, .slide th {
          text-align: left !important; color: var(--emerald-2) !important;
          font-family: var(--mono); font-size: 11px !important; letter-spacing: 0.07em; text-transform: uppercase;
          border-bottom: 1px solid var(--border) !important; padding: 8px 10px !important; background: transparent !important;
        }
        .reveal .slide td, .slide td {
          color: var(--txt-dim) !important; font-size: 14px !important;
          border-bottom: 1px solid var(--border-2) !important; padding: 8px 10px !important;
        }
        .slide td code { font-size: 12.5px; }

        ul.check { list-style: none !important; padding-left: 0 !important; margin: 6px 0 0 !important; }
        ul.check li { position: relative; padding-left: 22px !important; margin: 7px 0 !important; }
        ul.check li::before { content: "▸"; position: absolute; left: 0; color: var(--emerald); font-weight: 700; }

        .foot { margin-top: 16px; color: var(--txt-mute); font-family: var(--mono); font-size: 12px; }

        .cover { text-align: center; padding: 6px 0; }
        .cover .logo { font-family: var(--mono); font-weight: 800; font-size: 14px; letter-spacing: 0.35em; color: var(--emerald-2); }
        .cover .title {
          font-size: 46px; font-weight: 850; letter-spacing: -0.03em; line-height: 1.06; margin: 12px 0;
          background: linear-gradient(120deg, #ffffff 28%, var(--emerald-2) 72%, var(--indigo));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .cover .sub { color: var(--txt-dim); font-size: 17px; max-width: 60ch; margin: 0 auto; }
        .cover .team { color: var(--txt-mute); font-size: 14px; margin-top: 22px; line-height: 1.85; }
        .cover .team strong { color: var(--txt); }

        .slide-diagram {
          background: #0c0c0f;
          border: 1px solid var(--border);
          border-radius: 13px;
          padding: 12px;
          margin: 4px auto 0;
        }
        .slide-diagram svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }

        .reveal .slide-stack { align-items: stretch !important; width: 100%; max-width: 940px; margin: 0 auto; }
        </style>

        <div class="slide cover">
          <div class="logo">◍ ORBIT</div>
          <div class="title">Del lenguaje natural<br>al comando que se ejecuta</div>
          <div class="sub">Tú escribes lo que quieres hacer. La IA propone el comando. Tú decides si corre.</div>
          <div class="team">
            <strong>UABC · Facultad de Ciencias · Sistemas Distribuidos · 2026-1</strong><br><br>
            Cristian A. Vargas · Jesús A. Sauceda · Francisco G. Parga · Axel T. Díaz<br>
            Docente: Jose Eleno Lozano Rizk
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">El problema</span>
          <h1>Saber qué quieres no es lo mismo que saber escribirlo</h1>
          <hr class="rule">
          <p class="lead">Muchas veces sabes <strong>qué tarea</strong> necesitas hacer en la computadora, pero no recuerdas el comando exacto. Y copiar y pegar comandos de internet puede ser <strong>peligroso</strong>.</p>
          <div class="grid cols-3">
            <div class="card"><h3>Es difícil de recordar</h3><p>Cada comando tiene sus reglas, símbolos y opciones.</p></div>
            <div class="card"><h3>Puede ser peligroso</h3><p>Un comando mal copiado puede borrar archivos o dañar el sistema.</p></div>
            <div class="card"><h3>No queda registro</h3><p>No sabes después qué pediste ni qué pasó.</p></div>
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">La idea</span>
          <h1>Orbit: tres pasos simples</h1>
          <hr class="rule">
          <div class="grid cols-3">
            <div class="card"><span class="tag">PASO 1</span><h3>Pides</h3><p>Escribes en español lo que quieres hacer, como si le hablaras a una persona.</p></div>
            <div class="card"><span class="tag">PASO 2</span><h3>Revisas</h3><p>La IA te muestra el comando que propone, con una explicación. Tú decides si lo aceptas, lo ajustas o lo descartas.</p></div>
            <div class="card"><span class="tag">PASO 3</span><h3>Ejecutas</h3><p>El comando corre de forma controlada y ves el resultado al instante.</p></div>
          </div>
          <p class="lead" style="margin-top:14px">Lo importante: <strong>nada corre sin tu aprobación</strong>.</p>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Un ejemplo</span>
          <h1>Así se ve en la práctica</h1>
          <hr class="rule">
          <div class="io">
            <div class="box">
              <div class="h">Tú escribes</div>
              <div class="nl">"muéstrame los programas que más memoria usan"</div>
            </div>
            <div class="arrow">➜</div>
            <div class="box">
              <div class="h">Orbit propone</div>
              <div class="cmd">ps aux | sort -k4 -rn | head</div>
            </div>
          </div>
          <p class="lead" style="margin-top:14px">Tú no tienes que recordar el comando. Solo dices qué necesitas y revisas la propuesta antes de que se ejecute.</p>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    arquitectura = mo.mermaid(
        """%%{init: {"theme":"dark", "themeVariables": {"primaryColor":"#17171c","primaryTextColor":"#e9e9ee","primaryBorderColor":"#34d399","lineColor":"#10b981","fontFamily":"monospace","fontSize":"15px","edgeLabelBackground":"#0c0c0f","tertiaryColor":"#0c0c0f","secondaryColor":"#1f1f26"}}}%%
    graph LR
    U([Usuario]) -->|escribe tarea| FE[Página web<br/>Next.js]
    FE -->|envía petición| BE[Servidor<br/>Flask]
    BE -->|pregunta a la IA| AI[(OpenAI)]
    AI -->|devuelve comando| BE
    BE -->|muestra propuesta| FE
    FE -->|usuario aprueba| BE
    BE -->|ejecuta| SH[[Terminal<br/>macOS]]
    SH -->|resultado| BE
    BE -.->|en vivo| FE
    """
    )
    mo.Html(
        f"""
        <div class="slide">
          <span class="kicker">Cómo está construido</span>
          <h1>Tres piezas que se comunican</h1>
          <hr class="rule">
          <div class="slide-diagram">{arquitectura}</div>
          <div class="foot">Página web (lo que ves) + Servidor (la lógica) + IA (genera el comando). El comando solo corre en tu máquina después de que tú lo apruebas.</div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Las herramientas</span>
          <h1>Con qué está hecho</h1>
          <hr class="rule">
          <div class="grid cols-2">
            <div class="card">
              <h3>🖥️ La página web</h3>
              <div class="pills">
                <span class="pill in">Next.js</span><span class="pill in">React</span><span class="pill">Tailwind</span>
              </div>
              <p style="margin-top:8px">Lo que ve y usa el usuario. Estilo de terminal, modo oscuro.</p>
            </div>
            <div class="card">
              <h3>⚙️ El servidor</h3>
              <div class="pills">
                <span class="pill em">Python</span><span class="pill em">Flask</span>
              </div>
              <p style="margin-top:8px">Recibe la petición, habla con la IA y ejecuta el comando con seguridad.</p>
            </div>
            <div class="card">
              <h3>🧠 La inteligencia artificial</h3>
              <div class="pills">
                <span class="pill em">OpenAI · gpt-4o-mini</span>
              </div>
              <p style="margin-top:8px">Transforma tu frase en un comando válido para macOS.</p>
            </div>
            <div class="card">
              <h3>🔐 La configuración</h3>
              <div class="pills">
                <span class="pill">.env</span><span class="pill">API Key</span>
              </div>
              <p style="margin-top:8px">La llave de OpenAI vive fuera del código, en un archivo aparte.</p>
            </div>
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Seguridad</span>
          <h1>Para que nada se ejecute a ciegas</h1>
          <hr class="rule">
          <div class="grid cols-2">
            <div class="card">
              <h3>① Bloqueo de comandos peligrosos</h3>
              <div class="pills">
                <span class="pill danger">borrar todo el disco</span>
                <span class="pill danger">apagar el sistema</span>
                <span class="pill danger">formatear</span>
              </div>
              <p style="margin-top:8px">Si la IA propone algo riesgoso, <strong>el servidor lo rechaza antes de correrlo</strong>.</p>
            </div>
            <div class="card">
              <h3>② Revisión humana</h3>
              <p>Tú ves el comando y su explicación antes de que se ejecute. Puedes aprobarlo, pedir cambios o cancelarlo.</p>
              <p style="margin-top:8px">Además hay un <strong>tiempo límite</strong>: si tarda más de 20 segundos, se detiene solo.</p>
            </div>
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    secuencia = mo.mermaid(
        """%%{init: {"theme":"dark", "themeVariables": {"primaryColor":"#17171c","primaryTextColor":"#e9e9ee","primaryBorderColor":"#34d399","lineColor":"#10b981","fontFamily":"monospace","fontSize":"14px","actorBkg":"#17171c","actorBorder":"#34d399","actorTextColor":"#e9e9ee","signalColor":"#b4b4bd","signalTextColor":"#e9e9ee","noteBkgColor":"#10b981","noteTextColor":"#06281f","edgeLabelBackground":"#0c0c0f"}}}%%
    sequenceDiagram
    autonumber
    participant U as Usuario
    participant FE as Página
    participant BE as Servidor
    participant AI as OpenAI
    participant SH as Terminal
    U->>FE: describe la tarea
    FE->>BE: envía el texto
    BE->>AI: pide el comando
    AI-->>BE: regresa propuesta
    BE-->>FE: muestra al usuario
    Note over FE: revisión humana
    U->>FE: clic en "Ejecutar"
    FE->>BE: aprobación
    BE->>BE: revisa seguridad
    BE->>SH: ejecuta el comando
    SH-->>BE: resultado
    BE-->>FE: resultado en vivo
    """
    )
    mo.Html(
        f"""
        <div class="slide">
          <span class="kicker">El flujo completo</span>
          <h1>Quién hace qué, paso a paso</h1>
          <hr class="rule">
          <div class="slide-diagram">{secuencia}</div>
          <div class="foot">El resultado aparece en la pantalla a medida que el comando va corriendo, no al final.</div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Por qué encaja en el curso</span>
          <h1>Ideas de sistemas distribuidos en el proyecto</h1>
          <hr class="rule">
          <div class="grid cols-2">
            <div class="card"><h3>Dos programas que se hablan</h3><p>La página y el servidor son procesos separados. Se comunican por internet (HTTP).</p></div>
            <div class="card"><h3>Resultados en vivo</h3><p>El servidor manda información al cliente <strong>poco a poco</strong>, no todo de golpe al final.</p></div>
            <div class="card"><h3>Coordinación de estados</h3><p>La página sabe en qué fase está (pidiendo, revisando, ejecutando) y se mantiene sincronizada con el servidor.</p></div>
            <div class="card"><h3>Dependencia de un servicio externo</h3><p>Usamos OpenAI, que está en otro lado de internet. Hay que manejar errores y tiempos de espera.</p></div>
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Demo</span>
          <h1>Cómo se prueba</h1>
          <hr class="rule">
          <div class="grid cols-2">
            <div class="card">
              <h3>Levantar el servidor</h3>
              <pre><code>cd backend
    source .venv/bin/activate
    python app.py</code></pre>
            </div>
            <div class="card">
              <h3>Levantar la página</h3>
              <pre><code>cd frontend
    npm run dev</code></pre>
            </div>
          </div>
          <p class="lead" style="margin-top:14px">Abrir <code>localhost:3000</code> → escribir una tarea → revisar → ejecutar.</p>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide">
          <span class="kicker">Cierre</span>
          <h1>Qué logramos y qué sigue</h1>
          <hr class="rule">
          <div class="grid cols-2">
            <div class="card">
              <h3>✔ Lo que funciona</h3>
              <ul class="check">
                <li>Traducir lenguaje natural a comandos válidos.</li>
                <li>Revisión humana antes de cada ejecución.</li>
                <li>Bloqueo de comandos peligrosos.</li>
                <li>Resultados en vivo mientras el comando corre.</li>
              </ul>
            </div>
            <div class="card">
              <h3>→ Lo que vendría después</h3>
              <ul class="check">
                <li>Conectar una base de datos real para consultas.</li>
                <li>Guardar el historial de tareas por usuario.</li>
                <li>Ejecutar en un entorno aún más aislado.</li>
                <li>Soporte para varios usuarios al mismo tiempo.</li>
              </ul>
            </div>
          </div>
        </div>
        """
    )
    return


@app.cell
def _(mo):
    mo.Html(
        r"""
        <div class="slide cover">
          <div class="logo">◍ ORBIT</div>
          <div class="title">Gracias</div>
        </div>
        """
    )
    return


if __name__ == "__main__":
    app.run()
