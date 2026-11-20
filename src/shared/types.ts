/** Contrato público compartido con el frontend. Ver API_CONTRACT.md. */

export interface Stat {
  value?: number;
  suffix?: string;
  text?: string;
  label: string;
}

export interface FlowStep {
  title: string;
  text: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  linkedin: string;
  github: string;
}

export interface Profile {
  name: string;
  brand: string;
  roles: string[];
  title: string;
  location: string;
  lead: string;
  stats: Stat[];
  about: { paragraphs: string[]; flow: FlowStep[] };
  contact: ContactInfo;
  resumeHref: string;
}

export type ProjectCategory = 'web' | 'architecture' | 'ai';

export interface Project {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  featured: boolean;
  links: { demo?: string; repo?: string };
  media: { poster?: string; webm?: string; mp4?: string; pngSequence?: string };
  order: number;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  tags: string[];
  bullets: string[];
  order: number;
}

export interface SkillGroup {
  id?: string;
  category: string;
  items: string[];
  order: number;
}

export type EducationType = 'education' | 'certification' | 'language';

export interface EducationItem {
  id?: string;
  type: EducationType;
  title: string;
  org: string;
  year: string;
  href?: string;
  order: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  source: 'ai' | 'knowledge';
  suggestions?: string[];
}
