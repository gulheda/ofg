export interface Stat {
  value: number | string;
  suffix?: string;
  label: string;
  sub: string;
}

export const stats: Stat[] = [
  {
    value: 3,
    label: "Aktif Proje & Ekip",
    sub: "Teknofest İHA · Model Uydu · Tusmec",
  },
  {
    value: 2,
    label: "PCB Tasarımı",
    sub: "Uçuş bilgisayarı & güç kartı — Eagle",
  },
  {
    value: 1,
    label: "Sürü İHA Senkronizasyonu",
    sub: "MAVLink tabanlı çoklu araç haberleşmesi",
  },
  {
    value: "Pilot",
    label: "Prototip Uçuş Testleri",
    sub: "Uçuş verisi analiziyle stabilite çözümü",
  },
];
