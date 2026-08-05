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
    <Section id="hakkimda">
      <SectionHeading eyebrow="01 — Hakkımda" title="Aviyonikle düşünen, sahada uçuran bir mühendis adayı" />

      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <p className="text-xl leading-relaxed text-zinc-200 md:text-[1.6rem] md:leading-[1.45]">
            Balıkesir Üniversitesi Elektrik-Elektronik Mühendisliği 3. sınıf
            öğrencisiyim. Aviyonik sistemler ve PCB tasarımı üzerine çalışıyorum.
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

      <div className="mt-14 grid gap-8 border-t border-subtle pt-10 sm:grid-cols-3">
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
