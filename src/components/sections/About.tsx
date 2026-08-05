import { CircuitBoard, Plane, Radio } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechnicalCorners from "@/components/ui/TechnicalCorners";

const focusAreas = [
  {
    icon: Plane,
    title: "Aviyonik Entegrasyon",
    text: "Uçuş bilgisayarı, güç ve haberleşme alt sistemlerinin uçtan uca entegrasyonu; montaj, lehimleme ve saha testleri.",
  },
  {
    icon: CircuitBoard,
    title: "PCB & Güç Dağıtımı",
    text: "Autodesk Eagle ile uçuş bilgisayarı ve güç kartı tasarımı; datasheet analiziyle komponent seçimi.",
  },
  {
    icon: Radio,
    title: "Otonom & Sürü Sistemler",
    text: "ArduPilot ve MAVLink ile çoklu İHA senkronizasyonu, RF telemetri ve haberleşme altyapıları.",
  },
];

export default function About() {
  return (
    <Section id="hakkimda">
      <SectionHeading
        eyebrow="01 — Hakkımda"
        title="Aviyonikle düşünen, sahada uçuran bir mühendis adayı"
      />
      <div className="grid gap-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="space-y-5 text-base leading-relaxed text-zinc-400">
            <p>
              Balıkesir Üniversitesi Elektrik-Elektronik Mühendisliği 3. sınıf
              öğrencisiyim. Aviyonik sistemler ve PCB tasarımı üzerine çalışıyorum;
              Teknofest İHA Yarışması&apos;nda elektronik alt sistem ekibini yönetiyor,
              güç dağıtım ağını tasarlıyor ve RF haberleşme altyapısını kuruyorum.
            </p>
            <p>
              Tusmec&apos;te sürü İHA entegrasyonu ve prototip uçuş testlerinde görev
              aldım: Autodesk Eagle ile PCB tasarladım, motor-pervane kombinasyonlarını
              optimize ettim ve test uçuşlarını pilot olarak bizzat gerçekleştirdim.
              Donanım entegrasyonundan saha testine kadar tüm aviyonik süreçleri
              yürütmek, işin en sevdiğim tarafı.
            </p>
            <p>
              Bir sistemin datasheet&apos;inden başlayıp şematiğine, kartına, montajına
              ve nihayet gökyüzündeki ilk uçuşuna kadar her aşamasında olmak — benim
              için mühendisliğin tam karşılığı bu.
            </p>
          </div>
        </Reveal>
        <div className="space-y-4 lg:col-span-2">
          {focusAreas.map((area, i) => (
            <Reveal key={area.title} variant="slide-left" delay={i * 0.1}>
              <div className="group relative flex gap-4 rounded-xl border border-subtle bg-card p-5 transition-colors duration-300 hover:border-accent/30">
                <TechnicalCorners />
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
