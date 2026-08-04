import { CircuitBoard, Cpu, Waves } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const focusAreas = [
  {
    icon: Cpu,
    title: "Gömülü Sistemler",
    text: "STM32 ve ESP32 üzerinde bare-metal ve RTOS tabanlı firmware geliştirme.",
  },
  {
    icon: CircuitBoard,
    title: "PCB Tasarımı",
    text: "Şematikten üretime; sinyal bütünlüğü ve EMC gözetilerek kart tasarımı.",
  },
  {
    icon: Waves,
    title: "Güç & Sinyal",
    text: "Anahtarlamalı güç dönüştürücüleri ve sayısal sinyal işleme uygulamaları.",
  },
];

export default function About() {
  return (
    <Section id="hakkimda">
      <SectionHeading
        eyebrow="01 — Hakkımda"
        title="Devre şemasıyla düşünen bir mühendis"
      />
      <div className="grid gap-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="space-y-5 text-base leading-relaxed text-zinc-400">
            <p>
              Elektrik-Elektronik Mühendisliği öğrencisiyim. Elektroniğe olan ilgim,
              çocuklukta söktüğüm cihazların içindeki yeşil kartların nasıl çalıştığını
              merak etmemle başladı; bugün o kartları kendim tasarlıyorum.
            </p>
            <p>
              Donanım ile yazılımın kesiştiği yerde çalışmayı seviyorum: bir sensörün
              analog dünyasından gelen sinyali koşullamak, mikrodenetleyicide işlemek ve
              anlamlı veriye dönüştürmek — uçtan uca bu zincirin her halkasında üretken
              olmayı hedefliyorum.
            </p>
            <p>
              Boş zamanlarımda açık kaynak donanım projelerini inceliyor, lehim istasyonumun
              başında prototip üretiyor ve güç elektroniği üzerine literatür okuyorum.
            </p>
          </div>
        </Reveal>
        <div className="space-y-4 lg:col-span-2">
          {focusAreas.map((area, i) => (
            <Reveal key={area.title} variant="slide-left" delay={i * 0.1}>
              <div className="flex gap-4 rounded-xl border border-subtle bg-card p-5 transition-colors duration-300 hover:border-accent/30">
                <area.icon size={20} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">{area.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{area.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
