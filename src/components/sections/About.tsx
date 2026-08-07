import { CircuitBoard, Plane, Radio } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

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
    <Section id="hakkimda" className="bg-surface/10">
      <SectionHeading eyebrow="01 — Hakkımda" title="Aviyonikle düşünen, sahada uçuran bir mühendis adayı" />

      <div className="text-glass grid gap-10 p-6 md:p-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <p className="text-base leading-relaxed text-zinc-100 md:text-lg md:leading-[1.5]">
            Balıkesir Üniversitesi <span className="font-mono text-accent">Elektrik-Elektronik Mühendisliği</span> 3.
            sınıf öğrencisiyim. <span className="font-mono text-accent">Aviyonik sistemler</span> ve{" "}
            <span className="font-mono text-accent">PCB tasarımı</span> üzerine çalışıyorum.
          </p>
        </Reveal>
        <Reveal variant="slide-left" delay={0.12} className="lg:col-span-6">
          <div className="space-y-4 text-sm leading-relaxed text-zinc-400 lg:border-l lg:border-subtle lg:pl-10">
            <p>
              Teknofest İHA Yarışması&apos;nda elektronik alt sistem ekibini
              yönetiyor, güç dağıtım ağını tasarlıyor ve RF haberleşme
              altyapısını kuruyorum.
            </p>
            <p>
              Tusmec&apos;te sürü İHA entegrasyonu ve prototip uçuş testlerinde
              görev aldım: Autodesk Eagle ile PCB tasarladım, motor-pervane
              kombinasyonlarını optimize ettim ve test uçuşlarını pilot olarak
              bizzat gerçekleştirdim. BEDAŞ&apos;ta arıza onarım ekipleriyle
              sahada bulunarak şehir ölçeğindeki bir dağıtım şebekesinin nasıl
              işlediğini de yakından gördüm.
            </p>
            <p>
              Bir sistemin datasheet&apos;inden başlayıp şematiğine, kartına,
              montajına ve nihayet gökyüzündeki ilk uçuşuna kadar her aşamasında
              olmak — benim için mühendisliğin tam karşılığı bu.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="text-glass mt-8 grid gap-8 p-6 sm:grid-cols-3 md:p-8">
        {focusAreas.map((area, i) => (
          <Reveal key={area.title} variant="fade" delay={i * 0.08}>
            <div className="flex items-start gap-3">
              <area.icon size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <h3 className="text-sm font-medium text-zinc-100">{area.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{area.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
