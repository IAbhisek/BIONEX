import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Hand,
  Zap,
  Activity,
  BatteryCharging,
  ExternalLink,
  Wrench,
  Gauge,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

const images = {
  hero: '/images/bionex-front-hand.jpeg',
  inner: '/images/bionex-inner-circuit.jpeg',
  powerAc: '/images/power-supply-ac.jpeg',
  powerBattery: '/images/power-supply-battery.jpeg',
  overview: '/images/system-overview.jpeg',
};

const features = [
  {
    icon: Hand,
    title: '3D Printed Prosthetic Arm',
    text: 'Lightweight, customizable, and low-cost mechanical structure inspired by open-source prosthetic designs.',
  },
  {
    icon: Activity,
    title: 'EMG Based Control',
    text: 'Muscle activity is captured and processed to control finger movement and gripping actions.',
  },
  {
    icon: Cpu,
    title: 'ESP32 Processing Unit',
    text: 'ESP32 handles real-time signal processing, servo control, and future wireless expansion.',
  },
  {
    icon: Wrench,
    title: 'Servo Driven Fingers',
    text: 'MG996R high-torque servo motors actuate the fingers using tendon/string based movement.',
  },
  {
    icon: BatteryCharging,
    title: 'Regulated Power System',
    text: 'LM2596 buck converter provides stable regulated voltage for ESP32, sensors, and servo motors.',
  },
  {
    icon: ShieldCheck,
    title: 'Affordable Assistive Tech',
    text: 'Designed as a proof-of-concept prototype focused on accessibility and cost effectiveness.',
  },
];

const specs = [
  ['Project Name', 'Bionex Advanced Prosthetic Arm'],
  ['Domain', 'Biomedical Robotics / Assistive Technology'],
  ['Controller', 'ESP32 Microcontroller'],
  ['Actuators', 'MG996R Servo Motors'],
  ['Sensor Input', 'EMG / Muscle BioAmp Sensor'],
  ['Power Regulation', 'LM2596 Buck Converter'],
  ['Structure', '3D Printed Prosthetic Hand and Forearm'],
  ['Software', 'Arduino IDE, Embedded C'],
  ['Estimated Cost', 'Approx. ₹12,000'],
];

const workflow = [
  'Muscle signal is captured using EMG electrodes and sensor module.',
  'ESP32 reads and processes the analog signal in real time.',
  'Signal thresholding/control logic converts muscle activity into commands.',
  'Servo motors rotate according to the command.',
  'Tendon strings pull the fingers to perform grip/release movement.',
];

const gallery = [
  {
    title: 'Final Prototype',
    image: '/images/bionex-front-hand.jpeg',
  },
  {
    title: 'Internal Electronics',
    image: '/images/bionex-inner-circuit.jpeg',
  },
  {
    title: 'System Overview',
    image: '/images/system-overview.jpeg',
  },
  {
    title: 'AC Power Supply',
    image: '/images/power-supply-ac.jpeg',
  },
  {
    title: 'Battery Module',
    image: '/images/power-supply-battery.jpeg',
  },
];

const codeExample = `#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

// ===== WIFI =====
const char* ssid = "Abhishek";
const char* password = "12345678";

WebServer server(80);

// ===== PINS =====
#define EMG_PIN 34
#define LED_PIN 2

int servoPins[5] = {5, 18, 19, 27, 26};
Servo servos[5];

// ===== SERVO =====
#define SERVO_OPEN 10
#define SERVO_CLOSE 120

// ===== EMG =====
#define SAMPLE_RATE 500
#define BUFFER_SIZE 64

int circular_buffer[BUFFER_SIZE];
int data_index = 0, sum = 0;

int EMG_THRESHOLD = 60;

bool closed = false;
bool wasActive = false;
bool emgEnabled = false;

unsigned long lastGestureTime = 0;
unsigned long gestureDelay = 800;

int lastEnvelope = 0;
float plotSmooth = 0;

// ==========================

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  // Attach servos
  for (int i = 0; i < 5; i++) {
    servos[i].attach(servoPins[i]);
  }

  // ===== STARTUP TEST =====
  moveAll(SERVO_CLOSE);
  blinkLED();
  delay(500);
  moveAll(SERVO_OPEN);
  blinkLED();
  delay(500);

  // ===== WIFI =====
  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/servo", handleServo);
  server.on("/toggleEMG", handleToggleEMG);
  server.on("/status", handleStatus);
  server.begin();
}

// ==========================

void loop() {
  if (emgEnabled) {
    static unsigned long past = 0;
    unsigned long present = micros();
    unsigned long interval = present - past;
    past = present;

    static long timer = 0;
    timer -= interval;

    if (timer < 0) {
      timer += 1000000 / SAMPLE_RATE;

      int raw = analogRead(EMG_PIN);
      float filtered = EMGFilter(raw);
      int envelope = getEnvelope(abs(filtered));

      lastEnvelope = envelope;
      bool isActive = envelope > EMG_THRESHOLD;

      if (isActive && !wasActive) {
        if ((millis() - lastGestureTime) > gestureDelay) {
          if (!closed) {
            moveAll(SERVO_CLOSE);
            closed = true;
          } else {
            moveAll(SERVO_OPEN);
            closed = false;
          }
          blinkLED();
          lastGestureTime = millis();
        }
      }

      wasActive = isActive;
      plotSmooth = 0.9 * plotSmooth + 0.1 * lastEnvelope;
      int plotVal = map(plotSmooth, 0, 200, -100, 100);
      Serial.println(plotVal);
    }
  }

  server.handleClient();
}

// ==========================

void blinkLED() {
  digitalWrite(LED_PIN, LOW);
  delay(150);
  digitalWrite(LED_PIN, HIGH);
}

void moveAll(int target) {
  for (int pos = 0; pos <= target; pos += 2) {
    for (int i = 0; i < 5; i++) {
      servos[i].write(pos);
    }
    delay(5);
  }
}

int getEnvelope(int abs_emg){
  sum -= circular_buffer[data_index];
  sum += abs_emg;
  circular_buffer[data_index] = abs_emg;
  data_index = (data_index + 1) % BUFFER_SIZE;
  return (sum / BUFFER_SIZE);
}

float EMGFilter(float input) {
  float output = input;
  {
    static float z1, z2;
    float x = output - 0.05159732*z1 - 0.36347401*z2;
    output = 0.01856301*x + 0.03712602*z1 + 0.01856301*z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2;
    float x = output - -0.53945795*z1 - 0.39764934*z2;
    output = x - 2*z1 + z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2;
    float x = output - 0.47319594*z1 - 0.70744137*z2;
    output = x + 2*z1 + z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2;
    float x = output - -1.00211112*z1 - 0.74520226*z2;
    output = x - 2*z1 + z2;
    z2 = z1;
    z1 = x;
  }
  return output;
}

// ==========================
// WEB SERVER HANDLERS

void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head><title>BIONEX</title>
<style>
body { font-family: Arial; text-align: center;
  background: #111; color: white; }
button { padding: 10px; margin: 10px; }
input[type=range] { width: 80%; }
canvas { background: black; }
</style></head>
<body>
<h2>BIONEX Control Panel</h2>
<div class="container">
  <p>Status: <span id="state">--</span></p>
  <p>Mode: <span id="mode">--</span></p>
  <p>EMG: <span id="emg">--</span></p>
  <button onclick="toggleEMG()">Toggle EMG Mode</button>
</div>
<div class="container">
  <h3>Servos</h3>
  Servo 1<br>
  <input type="range" min="0" max="180" 
    oninput="setServo(0,this.value)"><br>
  Servo 2<br>
  <input type="range" min="0" max="180" 
    oninput="setServo(1,this.value)"><br>
  Servo 3<br>
  <input type="range" min="0" max="180" 
    oninput="setServo(2,this.value)"><br>
  Servo 4<br>
  <input type="range" min="0" max="180" 
    oninput="setServo(3,this.value)"><br>
  Servo 5<br>
  <input type="range" min="0" max="180" 
    oninput="setServo(4,this.value)"><br>
</div>
<div class="container">
  <h3>EMG Graph</h3>
  <canvas id="graph" width="300" height="120"></canvas>
</div>
<script>
function toggleEMG(){ fetch('/toggleEMG'); }
function setServo(id,val){ 
  fetch('/servo?id='+id+'&val='+val); }
let canvas = document.getElementById("graph");
let ctx = canvas.getContext("2d");
let data = [];
function draw(val){
  if(data.length > 100) data.shift();
  data.push(val);
  ctx.clearRect(0,0,300,120);
  ctx.beginPath();
  for(let i=0;i<data.length;i++){
    ctx.lineTo(i*3,120 - data[i]/2);
  }
  ctx.strokeStyle = "lime";
  ctx.stroke();
}
setInterval(()=>{
  fetch('/status')
  .then(r=>r.json())
  .then(d=>{
    document.getElementById("state").innerText = d.state;
    document.getElementById("mode").innerText = d.mode;
    document.getElementById("emg").innerText = d.emg;
    draw(d.emg);
  });
},300);
</script></body></html>
)rawliteral";
  server.send(200,"text/html",html);
}

void handleServo() {
  int id = server.arg("id").toInt();
  int val = server.arg("val").toInt();
  if (id >= 0 && id < 5) {
    servos[id].write(val);
    blinkLED();
  }
  server.send(200,"text/plain","OK");
}

void handleToggleEMG() {
  emgEnabled = !emgEnabled;
  server.send(200,"text/plain","OK");
}

void handleStatus() {
  String json = "{";
  json += "\\"state\\":\\"" + String(closed ? "CLOSED" : "OPEN") + "\\",";
  json += "\\"emg\\":" + String(lastEnvelope) + ",";
  json += "\\"mode\\":\\"" + String(emgEnabled ? "EMG" : "MANUAL") + "\\"";
  json += "}";
  server.send(200,"application/json",json);
}`;

function ImageCard({ src, alt, className = '', portrait = false }) {
  const handleImageError = (e) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.classList.add('grid', 'place-items-center', 'min-h-[260px]');
      parent.innerHTML =
        '<div style="text-align:center;color:#94a3b8;padding:24px"><div style="font-size:42px">🖼️</div><p style="font-weight:700;margin-top:12px">Add image in public/images</p><p style="font-size:14px;margin-top:6px">' +
        alt +
        '</p></div>';
    }
  };

  return (
    <div className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl ${portrait ? 'aspect-[3/4]' : ''} ${className}`}>
      <div className="relative h-full w-full overflow-hidden">
        {portrait ? (
          <>
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110"
            />
            <img
              src={src}
              alt={alt}
              className="relative h-full w-full object-cover object-center"
              onError={handleImageError}
            />
          </>
        ) : (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [codeExpanded, setCodeExpanded] = React.useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="text-2xl font-black tracking-tight">
            BIONEX<span className="text-cyan-300">.</span>
          </a>
          <div className="hidden gap-7 text-sm text-slate-300 md:flex">
            <a href="#overview" className="hover:text-cyan-300">Overview</a>
            <a href="#hardware" className="hover:text-cyan-300">Hardware</a>
            <a href="#code" className="hover:text-cyan-300">Code</a>
            <a href="#power" className="hover:text-cyan-300">Power</a>
            <a href="#gallery" className="hover:text-cyan-300">Gallery</a>
            <a href="#github" className="hover:text-cyan-300">Links</a>
          </div>
        </div>
      </nav>

      <section className="relative px-6 py-20 md:px-16 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0ea5e955,transparent_35%),radial-gradient(circle_at_bottom_left,#22d3ee33,transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-300">Bionex</p>
            <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
              Advanced Prosthetic Arm
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-300 md:text-xl">
              A cost-effective 3D printed prosthetic robotic arm powered by EMG-based muscle signal control,
              ESP32 processing, and servo-driven finger actuation.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#overview" className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
                View Project
              </a>
              <a href="#github" className="flex items-center gap-2 rounded-2xl border border-cyan-300/40 px-6 py-3 font-bold transition hover:bg-white/10">
                <ExternalLink size={18} /> GitHub
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <ImageCard src={images.hero} alt="Bionex prosthetic hand front view" portrait className="max-w-[420px] mx-auto" />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-16 lg:px-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl"
            >
              <f.icon className="mb-4 text-cyan-300" size={34} />
              <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
              <p className="leading-relaxed text-slate-300">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="overview" className="bg-slate-900/70 px-6 py-16 md:px-16 lg:px-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 text-4xl font-black">System Overview</h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-300">
              Bionex combines a 3D printed hand structure, wrist joint, ESP32 controller, servo motors,
              wiring section, and regulated power supply inside a compact forearm casing.
            </p>
            <div className="space-y-3">
              {workflow.map((w, i) => (
                <div key={w} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-400 font-bold text-slate-950">
                    {i + 1}
                  </span>
                  <p className="text-slate-200">{w}</p>
                </div>
              ))}
            </div>
          </div>
          <ImageCard src={images.overview} alt="Bionex system overview" />
        </div>
      </section>

      <section id="hardware" className="mx-auto max-w-7xl px-6 py-16 md:px-16 lg:px-24">
        <h2 className="mb-8 text-4xl font-black">Hardware Architecture</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageCard src={images.inner} alt="Bionex inner circuit" />
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-2xl font-bold">
              <Gauge className="text-cyan-300" /> Technical Specifications
            </h3>
            <div className="divide-y divide-white/10">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-4 py-3">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="code" className="mx-auto max-w-7xl px-6 py-16 md:px-16 lg:px-24">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="mb-5 text-4xl font-black">Arduino/ESP32 Implementation</h2>
            <p className="mb-6 max-w-3xl text-lg leading-relaxed text-slate-300">
              The complete firmware for the prosthetic arm includes WiFi-based web control, real-time EMG processing, servo actuation, and a live EMG visualization dashboard.
            </p>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
              <button
                onClick={() => setCodeExpanded(!codeExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition text-cyan-300 font-bold"
              >
                <span>{codeExpanded ? '▼' : '▶'} View Code</span>
                <span className="text-xs font-normal text-slate-400">{codeExpanded ? 'Hide' : 'Show'}</span>
              </button>
              {codeExpanded && (
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
            <h3 className="mb-4 text-2xl font-bold text-white">Key Features</h3>
            <ul className="space-y-4 text-slate-300">
              <li>• WiFi connectivity for wireless web-based servo control</li>
              <li>• Real-time EMG signal processing with multi-stage filters</li>
              <li>• Gesture recognition with configurable muscle activation threshold</li>
              <li>• Live EMG graph visualization on the control dashboard</li>
              <li>• Individual servo control (5 fingers) via web interface</li>
              <li>• Toggle between manual and EMG-based control modes</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="power" className="bg-slate-900/70 px-6 py-16 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-4xl font-black">Power Supply Design</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <ImageCard src={images.powerAc} alt="AC to DC power supply flow" />
            <ImageCard src={images.powerBattery} alt="Battery powered supply flow" />
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-6 py-16 md:px-16 lg:px-24">
        <h2 className="mb-3 text-4xl font-black">Gallery Page</h2>
        <p className="mb-8 max-w-3xl text-slate-300">
          A full gallery page for your prototype visuals, hardware details, and power module snapshots. Use this section to showcase your design journey and build progress.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {gallery.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-3">
              <ImageCard src={item.image} alt={item.title} />
              <h3 className="px-2 py-4 text-lg font-bold">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="github" className="mx-auto max-w-7xl px-6 py-16 text-center md:px-16 lg:px-24">
        <h2 className="mb-4 text-4xl font-black">Open Source Project Showcase</h2>
        <p className="mx-auto mb-8 max-w-3xl text-slate-300">
          Use this website as your portfolio project page, GitHub README visual reference, and project documentation landing page.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://github.com/IAbhisek/BIONEX" className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-slate-950" target="_blank" rel="noreferrer">
            <ExternalLink size={18} /> GitHub Repository
          </a>
          <a href="https://www.linkedin.com/in/abhishek-singh-803011239/" className="flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3 font-bold" target="_blank" rel="noreferrer">
            <ExternalLink size={18} /> LinkedIn
          </a>
          <a href="https://drive.google.com/file/d/1NpwTwCXp4gbQBssmA-ttI0mHZ0PEqtD2/view" className="flex items-center gap-2 rounded-2xl border border-cyan-300/40 px-6 py-3 font-bold" target="_blank" rel="noreferrer">
            <ExternalLink size={18} /> Demo Video
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Bionex Advanced Prosthetic Arm. Built by Abhishek Singh.
      </footer>
    </main>
  );
}
