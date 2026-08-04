export type ProjectVisual = "mcu" | "power" | "sensor" | "signal";

export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo?: string;
  visual: ProjectVisual;
}

export const projects: Project[] = [
  {
    title: "STM32 Tabanlı Veri Toplama Kartı",
    description:
      "STM32F4 üzerinde çalışan, 4 kanallı 16-bit ADC ile analog sinyalleri örnekleyip USB üzerinden aktaran özgün tasarım bir veri toplama kartı. Şematik ve 4 katmanlı PCB tasarımı Altium Designer ile yapıldı.",
    tech: ["STM32", "C", "Altium Designer", "USB CDC", "DMA"],
    github: "https://github.com/gulheda",
    demo: undefined,
    visual: "mcu",
  },
  {
    title: "Senkron Buck Konvertör Tasarımı",
    description:
      "24V girişten 5V/3A çıkış üreten, %92 verimli senkron buck konvertör. Güç katı LTSpice ile simüle edildi, kapalı çevrim kompanzasyonu hesaplandı ve iki katmanlı PCB üzerinde doğrulandı.",
    tech: ["Power Electronics", "LTSpice", "KiCad", "Kontrol Teorisi"],
    github: "https://github.com/gulheda",
    demo: undefined,
    visual: "power",
  },
  {
    title: "ESP32 Ortam İzleme Düğümü",
    description:
      "Sıcaklık, nem ve hava kalitesi verilerini toplayıp MQTT üzerinden yayınlayan, derin uyku ile pil ömrü optimize edilmiş IoT sensör düğümü. Özel tasarım PCB ve 3B baskı muhafaza ile birlikte.",
    tech: ["ESP32", "C++", "MQTT", "EasyEDA", "Low Power"],
    github: "https://github.com/gulheda",
    demo: "https://github.com/gulheda",
    visual: "sensor",
  },
  {
    title: "Gerçek Zamanlı Sinyal Analiz Aracı",
    description:
      "Mikrofon ve harici ADC girişlerinden alınan sinyaller üzerinde FFT, filtreleme ve spektrogram analizi yapan Python tabanlı masaüstü araç. DSP algoritmaları NumPy ile vektörize edildi.",
    tech: ["Python", "NumPy", "DSP", "Matplotlib", "PyQt"],
    github: "https://github.com/gulheda",
    demo: "https://github.com/gulheda",
    visual: "signal",
  },
];
