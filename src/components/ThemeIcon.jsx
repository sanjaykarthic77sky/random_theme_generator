import React from 'react';
import { 
  ShoppingBag, 
  Activity, 
  GraduationCap, 
  Compass, 
  UtensilsCrossed, 
  Building2, 
  Sparkles, 
  Code, 
  Globe, 
  Shield, 
  Rocket, 
  Cpu, 
  Palette, 
  Flame, 
  Zap,
  Layers,
  Heart,
  Smartphone,
  Cloud,
  Database,
  Briefcase
} from 'lucide-react';

const iconMap = {
  ShoppingBag,
  Activity,
  GraduationCap,
  Compass,
  UtensilsCrossed,
  Building2,
  Sparkles,
  Code,
  Globe,
  Shield,
  Rocket,
  Cpu,
  Palette,
  Flame,
  Zap,
  Layers,
  Heart,
  Smartphone,
  Cloud,
  Database,
  Briefcase
};

export const AVAILABLE_ICONS = Object.keys(iconMap);

export default function ThemeIcon({ name, className = "w-6 h-6", size }) {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent className={className} size={size} />;
}
