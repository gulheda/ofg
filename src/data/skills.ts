import {
  Cpu,
  CircuitBoard,
  Microchip,
  Code2,
  Sigma,
  PenTool,
  Layers,
  Activity,
  Zap,
  AudioWaveform,
  Wifi,
  Braces,
  FileCode2,
  Workflow,
  Boxes,
  Radio,
  type LucideIcon,
} from "lucide-react";

export interface Skill {
  name: string;
  icon: LucideIcon;
  category: "Donanım" | "Yazılım" | "Araçlar" | "Alanlar";
}

export const skills: Skill[] = [
  { name: "Embedded Systems", icon: Cpu, category: "Donanım" },
  { name: "PCB Design", icon: CircuitBoard, category: "Donanım" },
  { name: "Microcontrollers", icon: Microchip, category: "Donanım" },
  { name: "STM32", icon: Cpu, category: "Donanım" },
  { name: "ESP32", icon: Wifi, category: "Donanım" },
  { name: "Arduino", icon: Microchip, category: "Donanım" },
  { name: "C", icon: Code2, category: "Yazılım" },
  { name: "C++", icon: Braces, category: "Yazılım" },
  { name: "Python", icon: FileCode2, category: "Yazılım" },
  { name: "MATLAB", icon: Sigma, category: "Yazılım" },
  { name: "Altium Designer", icon: PenTool, category: "Araçlar" },
  { name: "KiCad", icon: Layers, category: "Araçlar" },
  { name: "LTSpice", icon: Activity, category: "Araçlar" },
  { name: "Proteus", icon: Workflow, category: "Araçlar" },
  { name: "EasyEDA", icon: Boxes, category: "Araçlar" },
  { name: "Power Electronics", icon: Zap, category: "Alanlar" },
  { name: "Signal Processing", icon: AudioWaveform, category: "Alanlar" },
  { name: "IoT", icon: Radio, category: "Alanlar" },
];
