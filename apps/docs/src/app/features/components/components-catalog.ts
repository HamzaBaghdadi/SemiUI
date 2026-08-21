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
  { slug: 'toggle-button', name: 'Toggle Button', category: 'Actions', summary: 'A two-state button: unpressed outlined, pressed filled solid.' },
  { slug: 'split-button', name: 'Split Button', category: 'Actions', summary: 'A primary action with a caret that opens a menu of secondary actions.' },
  { slug: 'toggle-group', name: 'Toggle Group', category: 'Actions', summary: 'A segmented control of toggle-button-styled segments, single- or multi-select.' },
  { slug: 'speed-dial', name: 'Speed Dial', category: 'Actions', summary: 'A floating action button that expands into a linear list of mini action buttons.' },
  { slug: 'scroll-top', name: 'Scroll Top', category: 'Actions', summary: 'A floating button that appears on scroll and jumps back to the top.' },
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
  { slug: 'timeline', name: 'Timeline', category: 'Data display', summary: 'A vertical or horizontal sequence of events.' },
  { slug: 'tree-table', name: 'Tree Table', category: 'Data display', summary: 'A hierarchical table with expand/collapse rows and columns.' },
  { slug: 'splitter', name: 'Splitter', category: 'Data display', summary: 'Resizable panes divided by a draggable gutter.' },
  { slug: 'marquee', name: 'Marquee', category: 'Data display', summary: 'A continuously scrolling content loop.' },
  { slug: 'full-calendar', name: 'Full Calendar', category: 'Data display', summary: 'A month/week calendar grid with events.' },
  { slug: 'organization-chart', name: 'Organization Chart', category: 'Data display', summary: 'A hierarchical tree of nodes connected by lines, expand/collapse per branch.' },
  { slug: 'knob', name: 'Knob', category: 'Data display', summary: 'A radial gauge showing where a value sits between min and max.' },

  // Forms
  { slug: 'text-input', name: 'Text Input', category: 'Forms', summary: 'A text field that works with ngModel, reactive forms, or Signal Forms.' },
  { slug: 'auto-complete', name: 'Auto Complete', category: 'Forms', summary: 'A free-text input with a filtered suggestions panel.' },
  { slug: 'icon-field', name: 'Icon Field', category: 'Forms', summary: 'Adds a leading or trailing icon to any SemiUI field.' },
  { slug: 'float-label', name: 'Float Label', category: 'Forms', summary: 'A floating label wrapper for any SemiUI field, over/on/in variants.' },
  { slug: 'password', name: 'Password', category: 'Forms', summary: 'A text input with a reveal/hide toggle.' },
  { slug: 'textarea', name: 'Textarea', category: 'Forms', summary: 'A multi-line text field.' },
  { slug: 'input-number', name: 'Input Number', category: 'Forms', summary: 'A numeric field with increment/decrement controls.' },
  { slug: 'otp', name: 'OTP', category: 'Forms', summary: 'A one-time-passcode input split across boxes.' },
  { slug: 'checkbox', name: 'Checkbox', category: 'Forms', summary: 'A checkbox supporting ngModel, reactive forms, and Signal Forms.' },
  { slug: 'radio-group', name: 'Radio Group', category: 'Forms', summary: 'A mutually-exclusive set of options.' },
  { slug: 'switch', name: 'Switch', category: 'Forms', summary: 'A binary on/off toggle.' },
  { slug: 'select', name: 'Select', category: 'Forms', summary: 'A single-choice dropdown with a filterable panel.' },
  { slug: 'cascade-select', name: 'Cascade Select', category: 'Forms', summary: 'A hierarchical select where each level opens as an adjacent column.' },
  { slug: 'multiselect', name: 'Multiselect', category: 'Forms', summary: 'A multi-choice dropdown with chips for selected values.' },
  { slug: 'date-picker', name: 'Date Picker', category: 'Forms', summary: 'A calendar panel supporting single, range, and multiple selection.' },
  { slug: 'color-picker', name: 'Color Picker', category: 'Forms', summary: 'A saturation/hue picker with preset swatches.' },
  { slug: 'slider', name: 'Slider', category: 'Forms', summary: 'A draggable range control, single or dual-thumb.' },
  { slug: 'rich-text-editor', name: 'Rich Text Editor', category: 'Forms', summary: 'A contenteditable WYSIWYG editor with a formatting toolbar.' },
  { slug: 'image-cropper', name: 'Image Cropper', category: 'Forms', summary: 'A pan/zoom image cropper with a fixed crop frame.' },

  // Overlays
  { slug: 'popover', name: 'Popover', category: 'Overlays', summary: 'A floating panel anchored to a trigger element.' },
  { slug: 'tooltip', name: 'Tooltip', category: 'Overlays', summary: 'A short label shown on hover or focus.' },
  { slug: 'dialog', name: 'Dialog', category: 'Overlays', summary: 'A modal panel with a backdrop.' },
  { slug: 'drawer', name: 'Drawer', category: 'Overlays', summary: 'A panel that slides in from a screen edge.' },
  { slug: 'toast', name: 'Toast', category: 'Overlays', summary: 'A transient notification stack.' },
  { slug: 'context-menu', name: 'Context Menu', category: 'Overlays', summary: 'A right-click menu anchored at the cursor, with nested submenus.' },

  // Navigation
  { slug: 'accordion', name: 'Accordion', category: 'Navigation', summary: 'A data-driven, single- or multi-open panel list.' },
  { slug: 'tabs', name: 'Tabs', category: 'Navigation', summary: 'Switch between panels sharing the same space.' },
  { slug: 'stepper', name: 'Stepper', category: 'Navigation', summary: 'A linear sequence of steps with progress state.' },

  // Feedback
  { slug: 'error-message', name: 'Error Message', category: 'Feedback', summary: 'A small validation message, used by every form control.' },
  { slug: 'file-upload', name: 'File Upload', category: 'Feedback', summary: 'A dropzone with per-file previews and rejection reasons.' },
  { slug: 'progress-bar', name: 'Progress Bar', category: 'Feedback', summary: 'A linear progress indicator, determinate or indeterminate.' },
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
