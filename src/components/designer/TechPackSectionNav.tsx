import React from 'react';
import { cn } from '@/lib/utils';

export type TechPackSection = 
  | 'overview' 
  | 'design-details' 
  | 'specifications' 
  | 'fabric-color' 
  | 'measurements' 
  | 'attachments';

interface TechPackSectionNavProps {
  activeSection: TechPackSection;
  onSectionChange: (section: TechPackSection) => void;
}

const sections: { id: TechPackSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'design-details', label: 'Design Details' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'fabric-color', label: 'Fabric & Color' },
  { id: 'measurements', label: 'Measurements' },
  { id: 'attachments', label: 'Attachments' },
];

export const TechPackSectionNav = ({ 
  activeSection, 
  onSectionChange 
}: TechPackSectionNavProps) => {
  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
            activeSection === section.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
};
