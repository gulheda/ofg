import {
  Activity,
  Box,
  CircuitBoard,
  Code2,
  Compass,
  Fan,
  FileCode2,
  FileSearch,
  Flame,
  Gauge,
  GitBranch,
  Network,
  PenTool,
  Plane,
  Radio,
  RadioTower,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface Skill {
  name: string;
  icon: LucideIcon;
  category: "Aviyonik" | "PCB & Elektronik" | "Yazılım" | "Araçlar";
}

export const skills: Skill[] = [
  { name: "Aviyonik Sistemler", icon: Plane, category: "Aviyonik" },
  { name: "ArduPilot", icon: Compass, category: "Aviyonik" },
  { name: "MAVLink", icon: Radio, category: "Aviyonik" },
  { name: "Sürü İHA Entegrasyonu", icon: Network, category: "Aviyonik" },
  { name: "RF & Telemetri", icon: RadioTower, category: "Aviyonik" },
  { name: "Uçuş Testi & Pilotaj", icon: Gauge, category: "Aviyonik" },
  { name: "PCB Tasarımı", icon: CircuitBoard, category: "PCB & Elektronik" },
  { name: "Güç Dağıtım Tasarımı", icon: Zap, category: "PCB & Elektronik" },
  { name: "Devre Analizi", icon: Activity, category: "PCB & Elektronik" },
  { name: "Lehimleme", icon: Flame, category: "PCB & Elektronik" },
  { name: "Datasheet Analizi", icon: FileSearch, category: "PCB & Elektronik" },
  { name: "Motor-Pervane Optimizasyonu", icon: Fan, category: "PCB & Elektronik" },
  { name: "Python", icon: FileCode2, category: "Yazılım" },
  { name: "C", icon: Code2, category: "Yazılım" },
  { name: "Git", icon: GitBranch, category: "Araçlar" },
  { name: "Autodesk Eagle", icon: PenTool, category: "Araçlar" },
  { name: "Proteus", icon: Workflow, category: "Araçlar" },
  { name: "SolidWorks", icon: Box, category: "Araçlar" },
];
