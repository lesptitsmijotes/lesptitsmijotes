"use client"

import { useState, useEffect, useCallback } from "react"

interface HeroImage {
  id: string
  image_url: string
  alt_text: string
  order_index: number
}

interface HeroCarouselProps {
  images?: HeroImage[]
}

// Temporairement on utilise la même image, mais le carousel fonctionnera quand tu ajouteras de vraies images différentes
const DEFAULT_IMAGES = [
  "/african-cuisine-spread-traditional-dishes.jpg",
  "/african-cuisine-spread-traditional-dishes.jpg",
  "/african-cuisine-spread-traditional-dishes.jpg",
  "/african-cuisine-spread-traditional-dishes.jpg",
]

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Utiliser les images fournies ou les images par défaut
  const imageUrls = images && images.length > 0
    ? images.sort((a, b) => a.order_index - b.order_index).map(img => img.image_url)
    : DEFAULT_IMAGES

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % imageUrls.length
        return nextIndex
      })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [isClient, imageUrls.length])

  if (!isClient) {
    // Rendu initial côté serveur
    return (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('${imageUrls[0]}')` }}
      />
    )
  }

  return (
    <>
      {imageUrls.map((imageUrl, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-40" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        />
      ))}

      {/* Indicateurs de carousel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {imageUrls.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#ff3131] w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Aller à l'image ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}
