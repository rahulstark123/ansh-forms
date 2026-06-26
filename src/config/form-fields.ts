import {
  Type, Mail, Phone, Hash, AlignLeft, ChevronDown, CheckSquare, Radio, Calendar, Star,
  Upload, PenTool, Link, CalendarClock, ToggleLeft, Heading, SlidersHorizontal,
  ShieldCheck, IndianRupee, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FormFieldConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  hasOptions?: boolean;
  displayOnly?: boolean;
  hidePlaceholder?: boolean;
  hideRequired?: boolean;
}

export const FIELD_TYPES: FormFieldConfig[] = [
  { type: "text", label: "Short Text", icon: Type },
  { type: "email", label: "Email Address", icon: Mail },
  { type: "phone", label: "Phone Number", icon: Phone },
  { type: "number", label: "Number Input", icon: Hash },
  { type: "currency", label: "Currency Amount", icon: IndianRupee, hidePlaceholder: true },
  { type: "url", label: "Website URL", icon: Link },
  { type: "textarea", label: "Paragraph Text", icon: AlignLeft },
  { type: "dropdown", label: "Select Dropdown", icon: ChevronDown, hasOptions: true },
  { type: "radio", label: "Radio Buttons", icon: Radio, hasOptions: true },
  { type: "checkbox", label: "Checkbox List", icon: CheckSquare, hasOptions: true },
  { type: "date", label: "Date Picker", icon: Calendar, hidePlaceholder: true },
  { type: "time", label: "Time Picker", icon: Clock, hidePlaceholder: true },
  { type: "datetime", label: "Date & Time", icon: CalendarClock, hidePlaceholder: true },
  { type: "toggle", label: "Yes / No Toggle", icon: ToggleLeft, hidePlaceholder: true },
  { type: "scale", label: "Linear Scale", icon: SlidersHorizontal, hidePlaceholder: true },
  { type: "rating", label: "Star Rating", icon: Star, hidePlaceholder: true },
  { type: "consent", label: "Terms Consent", icon: ShieldCheck, hidePlaceholder: true },
  { type: "file", label: "File Upload", icon: Upload, hidePlaceholder: true },
  { type: "signature", label: "E-Signature", icon: PenTool, hidePlaceholder: true },
  { type: "section", label: "Section Header", icon: Heading, displayOnly: true, hidePlaceholder: true, hideRequired: true },
];

export const DISPLAY_ONLY_FIELD_TYPES = new Set(
  FIELD_TYPES.filter((f) => f.displayOnly).map((f) => f.type)
);

export function isDisplayOnlyField(type: string): boolean {
  return DISPLAY_ONLY_FIELD_TYPES.has(type);
}

export function getFieldTypeConfig(type: string): FormFieldConfig | undefined {
  return FIELD_TYPES.find((f) => f.type === type);
}

const DEFAULT_LABELS: Record<string, string> = {
  text: "Short Text",
  email: "Email Address",
  phone: "Phone Number",
  number: "Number",
  currency: "Amount",
  url: "Website URL",
  textarea: "Long Answer",
  dropdown: "Select Option",
  radio: "Choose One",
  checkbox: "Select All That Apply",
  date: "Date",
  time: "Time",
  datetime: "Date & Time",
  toggle: "Yes or No",
  scale: "Rate on a Scale",
  rating: "Star Rating",
  consent: "I agree to the terms and conditions",
  file: "File Upload",
  signature: "Signature",
  section: "Section Title",
};

export function createDefaultField(fieldType: string) {
  const config = getFieldTypeConfig(fieldType);
  const defaultOptions = ["Option 1", "Option 2", "Option 3"];

  return {
    id: `${fieldType}_${Date.now()}`,
    type: fieldType,
    label: `New ${DEFAULT_LABELS[fieldType] || fieldType} Field`,
    placeholder:
      fieldType === "section"
        ? "Optional section description or instructions"
        : fieldType === "consent"
          ? "I have read and agree to the terms stated above."
          : fieldType === "url"
            ? "https://example.com"
            : fieldType === "currency"
              ? ""
              : "Enter your answer here",
    required: fieldType === "consent",
    options: config?.hasOptions ? defaultOptions : undefined,
    scaleMin: fieldType === "scale" ? 1 : undefined,
    scaleMax: fieldType === "scale" ? 10 : undefined,
    scaleMinLabel: fieldType === "scale" ? "Low" : undefined,
    scaleMaxLabel: fieldType === "scale" ? "High" : undefined,
    currencyCode: fieldType === "currency" ? "INR" : undefined,
    currencySymbol: fieldType === "currency" ? "₹" : undefined,
  };
}
