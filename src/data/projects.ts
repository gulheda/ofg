export interface Project {
  title: string;
  role: string;
  period: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    title: "Teknofest İHA Yarışması",
    role: "Aviyonik Sistemler Sorumlusu — Misya Havacılık ve Uzay Teknolojileri Topluluğu",
    period: "2024 — Devam",
    description:
      "Elektronik alt sistem ekibine liderlik ediyorum: İHA'nın güç dağıtım ağını tasarlıyor, datasheet analizleriyle maliyet-performans dengesini kurarak komponent seçimlerini yapıyor ve tüm aviyonik bileşenlerin entegrasyonunu yönetiyorum.",
    tech: ["Autodesk Eagle", "ArduPilot", "MAVLink", "Güç Dağıtımı"],
  },
  {
    title: "Teknofest Model Uydu Yarışması",
    role: "Aviyonik Sistemler Üyesi — Misya Havacılık ve Uzay Teknolojileri Topluluğu",
    period: "2023 — 2024",
    description:
      "Uçuş bilgisayarı ve güç kartlarının PCB tasarımlarını Autodesk Eagle ile gerçekleştirdim; kart boyutlarını yarışma gereksinimlerine göre optimize ettim. Uydu ile yer istasyonu arasındaki RF haberleşme sistemini kurarak telemetri verilerinin kesintisiz aktarımını sağladım.",
    tech: ["Autodesk Eagle", "PCB Tasarımı", "RF Modülleri", "Telemetri"],
  },
  {
    title: "Sürü İHA Senkronizasyonu",
    role: "Aviyonik Sistemler Mühendisi — Tusmec Karma Robot Teknolojileri A.Ş.",
    period: "2024 — 2025",
    description:
      "Sürü İHA sistemlerinin yazılım entegrasyonunu gerçekleştirdim; çoklu araçların senkronizasyonu için MAVLink tabanlı haberleşme altyapısını kurdum. Motor-pervane kombinasyonlarını sistematik olarak test ederek itki/ağırlık oranını ve uçuş süresini ölçülebilir biçimde iyileştirdim.",
    tech: ["MAVLink", "ArduPilot", "Python", "Uçuş Testi"],
  },
];
