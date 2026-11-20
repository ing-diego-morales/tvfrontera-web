// src/components/SocialFeed.tsx
import Image from "next/image";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

import { SITIO } from "@/lib/sitio";

const FACEBOOK_URL = SITIO.redes.facebook;
const INSTAGRAM_URL = SITIO.redes.instagram;
const TIKTOK_URL = SITIO.redes.tiktok;

type SocialProfile = {
  name: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  gradient: string;
};

const profiles: SocialProfile[] = [
  {
    name: "TV Frontera",
    handle: "Facebook",
    url: FACEBOOK_URL,
    icon: <FaFacebook size={22} className="text-[#1877F2]" />,
    gradient: "from-[#1877F2] to-[#0d5bbf]",
  },
  {
    name: "TV Frontera",
    handle: "Instagram",
    url: INSTAGRAM_URL,
    icon: <FaInstagram size={22} className="text-[#E1306C]" />,
    gradient: "from-purple-500 via-pink-500 to-yellow-400",
  },
  {
    name: "TV Frontera",
    handle: "TikTok",
    url: TIKTOK_URL,
    icon: <FaTiktok size={22} className="text-black" />,
    gradient: "from-black to-gray-800",
  },
];

export default function SocialFeed() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-indigo mb-8 text-center">
        Síguenos en nuestras redes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {profiles.map((p) => (
          <a
            key={p.handle}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white hover:shadow-xl transition-shadow"
          >
            <div className={`h-16 bg-gradient-to-r ${p.gradient}`} />
            <div className="flex flex-col items-center -mt-8 px-4 pb-5">
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow">
                <Image src="/logo.png" alt={p.name} width={64} height={64} className="object-cover" />
              </div>
              <p className="font-bold text-indigo mt-2">{p.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                {p.icon}
                <span>{p.handle}</span>
              </div>
              <span className="bg-indigo group-hover:bg-naranja text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                Seguir
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}