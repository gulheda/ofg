// Matches next.config.mjs's basePath so the CV link resolves correctly on
// GitHub Pages, where the site is served from a /ofg subpath.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const site = {
  name: "Ömer Faruk Gündüz",
  handle: "omerfaruk.gunduz",
  title: "Aviyonik Sistemler & PCB Tasarımı",
  tagline:
    "Teknofest İHA takımında elektronik alt sistem ekibini yöneten; güç dağıtımından RF haberleşmeye, aviyonik sistemleri tasarlayıp sahada uçuran bir Elektrik-Elektronik Mühendisliği öğrencisi.",
  email: "omerfarukgunduz5@gmail.com",
  phone: "0546 816 77 27",
  phoneHref: "tel:+905468167727",
  linkedin: "https://www.linkedin.com/in/farukomergunduz",
  cvUrl: `${basePath}/cv.pdf`,
  location: "Balıkesir, Türkiye",
} as const;

export const navLinks = [
  { href: "#hakkimda", label: "Hakkımda" },
  { href: "#yetkinlikler", label: "Yetkinlikler" },
  { href: "#projeler", label: "Projeler" },
  { href: "#deneyim", label: "Deneyim" },
  { href: "#egitim", label: "Eğitim" },
  { href: "#iletisim", label: "İletişim" },
] as const;
