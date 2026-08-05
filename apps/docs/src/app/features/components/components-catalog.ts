export interface ComponentCatalogEntry {
  slug: string;
  name: string;
  category: string;
  summary: string;
}

export const COMPONENT_CATEGORIES = ['Actions', 'Data display', 'Forms', 'Overlays', 'Navigation', 'Feedback'] as const;

/** Every component the library ships -- each one has its own reference page. */
export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  // Actions
  { slug: 'button', name: 'Button', category: 'Actions', summary: 'Variants, sizes, a loading state, and leading/trailing icons.' },
  { slug: 'tag', name: 'Tag', category: 'Actions', summary: 'A small label/chip with color variants and a removable state.' },
  { slug: 'badge', name: 'Badge', category: 'Actions', summary: 'A status dot or count anchored to another element.' },

  // Data display
  { slug: 'avatar', name: 'Avatar', category: 'Data display', summary: 'An image, initials, or fallback icon in a fixed-size frame.' },
  { slug: 'breadcrumb', name: 'Breadcrumb', category: 'Data display', summary: 'A trail of links back to the current page.' },
  { slug: 'divider', name: 'Divider', category: 'Data display', summary: 'A horizontal or vertical rule, with an optional label.' },
  { slug: 'skeleton', name: 'Skeleton', category: 'Data display', summary: 'A shimmering placeholder shown while content loads.' },
  { slug: 'rating', name: 'Rating', category: 'Data display', summary: 'A star rating, readonly or interactive.' },
  { slug: 'pagination', name: 'Pagination', category: 'Data display', summary: 'Page controls for a paged list or table.' },
  { slug: 'table', name: 'Table', category: 'Data display', summary: 'Sortable, paginated tabular data.' },
  { slug: 'chart', name: 'Chart', category: 'Data display', summary: 'Line and area charts driven by preset tokens.' },
  { slug: 'carousel', name: 'Carousel', category: 'Data display', summary: 'A slide deck with arrows and dot navigation.' },

  // Forms
  { slug: 'text-input', name: 'Text Input', category: 'Forms', summary: 'A text field that works with ngModel, reactive forms, or Signal Forms.' },
  { slug: 'password', name: 'Password', category: 'Forms', summary: 'A text input with a reveal/hide toggle.' },
  { slug: 'textarea', name: 'Textarea', category: 'Forms', summary: 'A multi-line text field.' },
  { slug: 'input-number', name: 'Input Number', category: 'Forms', summary: 'A numeric field with increment/decrement controls.' },
  { slug: 'otp', name: 'OTP', category: 'Forms', summary: 'A one-time-passcode input split across boxes.' },
  { slug: 'checkbox', name: 'Checkbox', category: 'Forms', summary: 'A checkbox supporting ngModel, reactive forms, and Signal Forms.' },
  { slug: 'radio-group', name: 'Radio Group', category: 'Forms', summary: 'A mutually-exclusive set of options.' },
  { slug: 'switch', name: 'Switch', category: 'Forms', summary: 'A binary on/off toggle.' },
  { slug: 'select', name: 'Select', category: 'Forms', summary: 'A single-choice dropdown with a filterable panel.' },
  { slug: 'multiselect', name: 'Multiselect', category: 'Forms', summary: 'A multi-choice dropdown with chips for selected values.' },
  { slug: 'date-picker', name: 'Date Picker', category: 'Forms', summary: 'A calendar panel supporting single, range, and multiple selection.' },
  { slug: 'color-picker', name: 'Color Picker', category: 'Forms', summary: 'A saturation/hue picker with preset swatches.' },
  { slug: 'slider', name: 'Slider', category: 'Forms', summary: 'A draggable range control, single or dual-thumb.' },

  // Overlays
  { slug: 'popover', name: 'Popover', category: 'Overlays', summary: 'A floating panel anchored to a trigger element.' },
  { slug: 'tooltip', name: 'Tooltip', category: 'Overlays', summary: 'A short label shown on hover or focus.' },
  { slug: 'dialog', name: 'Dialog', category: 'Overlays', summary: 'A modal panel with a backdrop.' },
  { slug: 'drawer', name: 'Drawer', category: 'Overlays', summary: 'A panel that slides in from a screen edge.' },
  { slug: 'toast', name: 'Toast', category: 'Overlays', summary: 'A transient notification stack.' },

  // Navigation
  { slug: 'accordion', name: 'Accordion', category: 'Navigation', summary: 'A data-driven, single- or multi-open panel list.' },
  { slug: 'tabs', name: 'Tabs', category: 'Navigation', summary: 'Switch between panels sharing the same space.' },
  { slug: 'stepper', name: 'Stepper', category: 'Navigation', summary: 'A linear sequence of steps with progress state.' },

  // Feedback
  { slug: 'error-message', name: 'Error Message', category: 'Feedback', summary: 'A small validation message, used by every form control.' },
  { slug: 'file-upload', name: 'File Upload', category: 'Feedback', summary: 'A dropzone with per-file previews and rejection reasons.' },
];

export interface ComponentCatalogGroup {
  category: string;
  items: ComponentCatalogEntry[];
}

export function groupByCategory(entries: readonly ComponentCatalogEntry[]): ComponentCatalogGroup[] {
  return COMPONENT_CATEGORIES.map((category) => ({
    category,
    items: entries.filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0);
}

export function findComponent(slug: string): ComponentCatalogEntry | undefined {
  return COMPONENT_CATALOG.find((entry) => entry.slug === slug);
}
