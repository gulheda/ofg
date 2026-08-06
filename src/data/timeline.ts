export interface TimelineItem {
  period: string;
  title: string;
  subtitle: string;
  description: string;
}

export const experience: TimelineItem[] = [
  {
    period: "Tem — Ağu 2025",
    title: "Stajyer — Arıza Onarım ve Bakım Birimi",
    subtitle: "BEDAŞ (Boğaziçi Elektrik Dağıtım A.Ş.) — İstanbul",
    description:
      "Şehir şebekesindeki orta ve düşük gerilim arıza müdahale ekiplerine sahada eşlik ettim; besleme hatlarındaki arızaların tespiti, izolasyon ve onarım süreçlerini gözlemleyip pano ve trafo bakımlarında görev aldım. Sahadaki iş güvenliği prosedürlerini ve büyük ölçekli dağıtım şebekesinin işleyişini yakından öğrendim.",
  },
  {
    period: "2024 — Devam",
    title: "Aviyonik Sistemler Sorumlusu",
    subtitle: "Misya Havacılık ve Uzay Teknolojileri Topluluğu — Teknofest İHA",
    description:
      "Elektronik alt sistem ekibine liderlik ediyorum; İHA'nın güç dağıtım ağını tasarlıyor ve tüm aviyonik bileşenlerin entegrasyonunu yönetiyorum. Aviyonik sistem mimarisini oluşturuyor, datasheet analizleriyle maliyet-performans dengesi kurarak komponent seçimlerini gerçekleştiriyorum.",
  },
  {
    period: "Eyl 2024 — May 2025",
    title: "Aviyonik Sistemler Mühendisi",
    subtitle: "Tusmec Karma Robot Teknolojileri A.Ş.",
    description:
      "Sürü İHA sistemlerinin yazılım entegrasyonunu ve MAVLink tabanlı haberleşme altyapısını kurdum. Motor-pervane kombinasyonlarını test ederek itki/ağırlık oranını optimize ettim; mekanik montaj, lehimleme ve aviyonik entegrasyonu tamamladım. Prototip uçuş testlerini pilot olarak gerçekleştirip uçuş verilerinden stabilite sorunlarını tespit ederek çözdüm.",
  },
  {
    period: "2023 — 2024",
    title: "Aviyonik Sistemler Üyesi",
    subtitle: "Misya Havacılık ve Uzay Teknolojileri Topluluğu — Teknofest Model Uydu",
    description:
      "Uçuş bilgisayarı ve güç kartlarının PCB tasarımlarını Autodesk Eagle ile yaptım. Uydu ile yer istasyonu arasındaki haberleşme sistemini kurdum; telemetri verilerinin kesintisiz aktarımı için RF modüllerini entegre ettim ve güç/ağırlık kısıtlarına uygun komponentleri belirledim.",
  },
];

export const education: TimelineItem[] = [
  {
    period: "Ekim 2023 — Haziran 2027",
    title: "Elektrik-Elektronik Mühendisliği (Lisans, 3. sınıf)",
    subtitle: "Balıkesir Üniversitesi",
    description:
      "Aviyonik sistemler, güç elektroniği ve gömülü sistem tasarımı üzerine yoğunlaşıyorum. Teknofest yarışma takımlarında aldığım aktif görevlerle teorik eğitimi saha deneyimine dönüştürüyorum.",
  },
];
