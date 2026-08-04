# Gülheda Kızılhan — Kişisel Portfolyo

Elektrik-Elektronik Mühendisliği kimliğini yansıtan, koyu temalı, premium bir kişisel portfolyo sitesi. İmza detayı: gerçek PCB topolojisinden esinlenen, fare ile etkileşimli, Canvas tabanlı arka plan.

## Teknolojiler

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** — tasarım sistemi ve tema
- **Framer Motion** — ölçülü scroll animasyonları
- **Canvas API** — PCB arka plan motoru
- **Lucide Icons**

## PCB Arka Plan Motoru

`src/lib/pcb/` altındaki motor, her yüklemede deterministik bir "kart" üretir:

- 45° kırılmalı bakır yollar (chamfered orthogonal routing)
- IC ayak izleri, pin çıkışları ve pin-1 işaretleri
- Via halkaları, SMD padler, direnç gövdeleri, stitching via kümeleri
- Diferansiyel çift hissi veren paralel yollar

Performans mimarisi: geometri yalnızca resize'da üretilir ve iki offscreen katmana
(nötr + accent) rasterize edilir. rAF döngüsü her karede sadece bitmap kompozit eder;
fare etrafındaki 150px'lik parlama, radial maske ile accent katmandan kesilir.
`devicePixelRatio`, `ResizeObserver`, `IntersectionObserver` (görünmeyince durur),
`prefers-reduced-motion` ve mobilde %60 azaltılmış yoğunluk desteklenir.

## Geliştirme

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # üretim derlemesi
```

## Özelleştirme

- İçerik: `src/data/` (site bilgileri, yetkinlikler, projeler, zaman çizelgeleri)
- `public/cv.pdf` dosyasını kendi CV'nizle değiştirin
- Renk paleti: `tailwind.config.ts`
