# Bionex Advanced Prosthetic Arm

A cost-effective, open-source 3D printed prosthetic robotic arm powered by EMG-based muscle signal control. Features real-time ESP32 processing, MG996R servo motors for finger actuation, and regulated power management.

## 🚀 Live Demo

Visit the project: [Bionex Website](https://bionex-one.vercel.app/)

## ⚙️ Features

- **EMG-Based Control**: Muscle activity captured via EMG sensors for intuitive control
- **3D Printed Design**: Lightweight, customizable, and affordable mechanical structure
- **ESP32 Microcontroller**: Real-time signal processing and servo control
- **MG996R Servo Motors**: High-torque actuators for smooth finger movement
- **Regulated Power Supply**: LM2596 buck converter for stable voltage regulation
- **Affordable Solution**: Designed as an accessible assistive technology prototype

## 🛠️ Tech Stack

**Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React Icons

**Hardware**: ESP32, EMG/Muscle BioAmp Sensor, MG996R Servo Motors, LM2596 Buck Converter, 3D Printed Prosthetic Hand

**Software**: Arduino IDE, Embedded C, Vite Build System

## 📁 Project Structure

```
src/
├── App.jsx          # Main React component
├── main.jsx         # Entry point
└── index.css        # Tailwind styles

public/images/
├── bionex-front-hand.jpeg
├── bionex-inner-circuit.jpeg
├── power-supply-ac.jpeg
├── power-supply-battery.jpeg
└── system-overview.jpeg
```

## 💻 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔨 Build for Production

```bash
npm run build
```

Output files will be in the `dist/` folder.

## 🌐 Deploy on Vercel

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- [Vercel Deployment Guide](https://vercel.com/docs/frameworks/vite)

## 👤 Author

**Abhishek Singh**

- GitHub: [IAbhisek](https://github.com/IAbhisek)
- LinkedIn: [Abhishek Singh](https://www.linkedin.com/in/abhishek-singh-803011239/)

## 📄 License

Open Source - Feel free to fork and contribute!
