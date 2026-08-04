export interface TimelineItem {
  period: string;
  title: string;
  subtitle: string;
  description: string;
}

export const experience: TimelineItem[] = [
  {
    period: "2025 — Devam",
    title: "Donanım Tasarım Stajyeri",
    subtitle: "Elektronik Ar-Ge Laboratuvarı",
    description:
      "Karışık sinyal kartlarının şematik çizimi, PCB yerleşimi ve prototip testlerinde görev alıyorum. EMC ön uyumluluk ölçümleri ve tasarım gözden geçirmelerine katılıyorum.",
  },
  {
    period: "2024",
    title: "Gömülü Yazılım Stajyeri",
    subtitle: "Teknoloji Firması",
    description:
      "STM32 tabanlı ürün ailesinde HAL katmanı üzerinde sürücü geliştirdim; UART/SPI haberleşme protokolleri ve FreeRTOS görev yapıları üzerinde çalıştım.",
  },
  {
    period: "2023 — Devam",
    title: "Elektronik Birimi Üyesi",
    subtitle: "Üniversite Teknoloji Takımı",
    description:
      "İnsansız araç projelerinde güç dağıtım kartı tasarımı ve sensör entegrasyonundan sorumluyum. Takım içi PCB tasarım standartlarının oluşturulmasına katkı sağladım.",
  },
];

export const education: TimelineItem[] = [
  {
    period: "2022 — Devam",
    title: "Elektrik-Elektronik Mühendisliği (Lisans)",
    subtitle: "Üniversite",
    description:
      "Devre teorisi, elektromanyetik, güç elektroniği, sayısal tasarım ve sinyal işleme ağırlıklı müfredat. Gömülü sistemler ve PCB tasarımı üzerine seçmeli derslerle uzmanlaşma.",
  },
  {
    period: "2018 — 2022",
    title: "Fen Lisesi",
    subtitle: "Lise Eğitimi",
    description:
      "Matematik ve fizik ağırlıklı eğitim; TÜBİTAK proje yarışmalarında elektronik alanında proje deneyimi.",
  },
];

export interface Certificate {
  title: string;
  issuer: string;
  year: string;
}

export const certificates: Certificate[] = [
  { title: "Embedded Systems Essentials", issuer: "edX — ARM Education", year: "2025" },
  { title: "PCB Design for Real Hardware", issuer: "Udemy", year: "2024" },
  { title: "Python for Everybody", issuer: "Coursera — University of Michigan", year: "2024" },
  { title: "MATLAB Onramp", issuer: "MathWorks", year: "2023" },
];
