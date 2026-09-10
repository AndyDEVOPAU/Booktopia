import React, { useEffect, useState } from "react";

// Placeholder promo copy + images — swap these for real campaign banners
// whenever there's actual promo content/assets to plug in. Using picsum.photos
// (a placeholder image service) with fixed seeds so each slide's image stays
// stable across renders instead of changing every reload.
const SLIDES = [
  { seed: "booktopia-promo-1", title: "Summer Reading Sale", subtitle: "Up to 30% off bestsellers" },
  { seed: "booktopia-promo-2", title: "New Releases Are In", subtitle: "Fresh off the press, ready to ship" },
  { seed: "booktopia-promo-3", title: "Member Deals", subtitle: "Exclusive discounts, every week" },
];

const ROTATE_MS = 4500;

export default function PromoSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div
        className="relative mx-auto w-full max-w-[1150px] overflow-hidden rounded-md"
        style={{ height: 255 }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.seed}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <img
              src={`https://picsum.photos/seed/${slide.seed}/1150/255`}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-center bg-text/40 px-8">
              <h3 className="text-2xl font-semibold text-background">{slide.title}</h3>
              <p className="mt-1 text-sm text-background/90">{slide.subtitle}</p>
            </div>
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.seed}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-background" : "bg-background/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
