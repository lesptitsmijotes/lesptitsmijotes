import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, Phone, MapPin, Facebook } from "lucide-react"

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et Description */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
              width={160}
              height={70}
              className="mb-3 brightness-0 invert h-12 w-auto"
            />
            <p className="font-simonetta text-gray-300 mb-3 text-sm">
              Cuisine et traiteur africain - Des plats traditionnels préparés avec passion
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/1D7q4KvaMN/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff3131] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/les_ptits_mijotes?igsh=MWF5MGdzdXNiMDRocg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff3131] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@les.ptits.mijotes?_r=1&_t=ZN-92Px1hWuLfq"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff3131] transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-charmonman text-xl text-[#ff3131] mb-3">Navigation</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 font-simonetta text-sm">
              <li>
                <Link href="/" className="hover:text-[#ff3131] transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/galerie" className="hover:text-[#ff3131] transition-colors">
                  Galerie
                </Link>
              </li>
              <li>
                <Link href="/notre-histoire" className="hover:text-[#ff3131] transition-colors">
                  Notre histoire
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#ff3131] transition-colors">
                  Contact
                </Link>
              </li>
              <li className="col-span-2">
                <Link href="/services/particuliers" className="hover:text-[#ff3131] transition-colors">
                  Nos services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-charmonman text-xl text-[#ff3131] mb-3">Contact</h3>
            <ul className="space-y-2 font-simonetta text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="tel:+33695601821" className="hover:text-[#ff3131] transition-colors">
                  +33 6 95 60 18 21
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="mailto:contact@lesptitsmijotes.fr" className="hover:text-[#ff3131] transition-colors">
                  contact@lesptitsmijotes.fr
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Clermont-Ferrand, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center font-simonetta text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Les P&apos;tits Mijotés. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
