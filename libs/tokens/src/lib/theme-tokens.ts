/** Shared semantic color vocabulary across Button/Tag/Badge, on top of each component's own style-only variants (outline/ghost/link for Button, default/outline for Tag/Badge). `danger` is an alias of Button's older `destructive` -- both are kept, `destructive` isn't removed, to avoid a breaking rename for the sake of a naming preference. */
export type Severity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
export type ButtonVariant = Severity | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type TagVariant = Severity | 'default' | 'destructive' | 'outline';
export type DialogSize = 'sm' | 'md' | 'lg' | 'full';
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastVariantTokens {
  background: string;
  foreground: string;
  border: string;
  iconColor: string;
}

export interface ButtonVariantTokens {
  background: string;
  foreground: string;
  border: string;
}

/**
 * The palette category is the only part of the token contract that's expected to differ between
 * light and dark mode. Everything else (spacing, radius, component tokens) stays mode-agnostic --
 * component tokens should reference these via `var(--semiui-color-*)` rather than literal colors,
 * so they adapt automatically when the color palette swaps.
 */
export interface ColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  ring: string;
  muted: string;
  mutedForeground: string;
}

export interface ThemeTokens {
  color: ColorTokens;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  typography: {
    fontFamily: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontWeightMedium: string;
  };
  comp: {
    button: {
      radius: string;
      fontWeight: string;
      focusRing: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
      paddingX: Record<ButtonSize, string>;
      paddingY: Record<ButtonSize, string>;
      fontSize: Record<ButtonSize, string>;
      variants: Record<ButtonVariant, ButtonVariantTokens>;
    };
    input: {
      paddingX: string;
      paddingY: string;
      radius: string;
      fontSize: string;
      background: string;
      foreground: string;
      placeholderForeground: string;
      border: string;
      borderHover: string;
      borderFocus: string;
      focusRing: string;
      borderInvalid: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
    };
    select: {
      paddingX: string;
      paddingY: string;
      radius: string;
      fontSize: string;
      background: string;
      foreground: string;
      placeholderForeground: string;
      border: string;
      borderHover: string;
      borderFocus: string;
      focusRing: string;
      borderInvalid: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
      panelBackground: string;
      panelBorder: string;
      panelShadow: string;
      /** Shared by Cascade Select's and Auto Complete's panels (both reuse `comp.select.*` throughout): the option list's `max-height` before it scrolls. */
      panelMaxHeight: string;
      optionForeground: string;
      optionBackgroundHover: string;
      optionBackgroundSelected: string;
      optionForegroundSelected: string;
    };
    switch: {
      trackPadding: string;
      trackBorderWidth: string;
      radius: string;
      background: string;
      backgroundChecked: string;
      border: string;
      borderChecked: string;
      thumbBackground: string;
      focusRing: string;
      backgroundDisabled: string;
      transitionDuration: string;
      trackWidth: Record<ButtonSize, string>;
      trackHeight: Record<ButtonSize, string>;
      thumbSize: Record<ButtonSize, string>;
    };
    checkbox: {
      radius: string;
      border: string;
      borderChecked: string;
      background: string;
      backgroundChecked: string;
      foregroundChecked: string;
      focusRing: string;
      backgroundDisabled: string;
      borderDisabled: string;
      size: Record<ButtonSize, string>;
    };
    radio: {
      border: string;
      borderChecked: string;
      background: string;
      backgroundDisabled: string;
      borderDisabled: string;
      dotBackground: string;
      focusRing: string;
      size: Record<ButtonSize, string>;
    };
    popover: {
      background: string;
      border: string;
      shadow: string;
      radius: string;
      foreground: string;
      paddingX: string;
      paddingY: string;
    };
    tooltip: {
      background: string;
      foreground: string;
      radius: string;
      paddingX: string;
      paddingY: string;
      fontSize: string;
    };
    skeleton: {
      background: string;
      shimmer: string;
      radius: string;
    };
    avatar: {
      background: string;
      foreground: string;
      radius: string;
      statusOnline: string;
      statusAway: string;
      statusBusy: string;
      statusOffline: string;
      size: Record<'sm' | 'md' | 'lg' | 'xl', string>;
      fontSize: Record<'sm' | 'md' | 'lg' | 'xl', string>;
    };
    tag: {
      radius: string;
      fontSize: string;
      paddingX: string;
      paddingY: string;
      variants: Record<TagVariant, ButtonVariantTokens>;
    };
    breadcrumb: {
      foreground: string;
      currentForeground: string;
      separatorColor: string;
      fontSize: string;
      gap: string;
    };
    badge: {
      size: string;
      dotSize: string;
      fontSize: string;
      ringColor: string;
      variants: Record<TagVariant, ButtonVariantTokens>;
    };
    pagination: {
      radius: string;
      gap: string;
      size: string;
      border: string;
      background: string;
      foreground: string;
      backgroundHover: string;
      backgroundActive: string;
      foregroundActive: string;
      foregroundDisabled: string;
    };
    rating: {
      filledColor: string;
      emptyColor: string;
      gap: string;
      size: Record<ButtonSize, string>;
    };
    accordion: {
      border: string;
      radius: string;
      headerBackground: string;
      headerBackgroundHover: string;
      headerForeground: string;
      panelBackground: string;
      panelForeground: string;
      fontSize: string;
      fontWeight: string;
      paddingX: string;
      paddingY: string;
    };
    tabs: {
      border: string;
      gap: string;
      foreground: string;
      foregroundActive: string;
      foregroundDisabled: string;
      indicatorColor: string;
      indicatorThickness: string;
      fontSize: string;
      fontWeight: string;
      paddingX: string;
      paddingY: string;
    };
    stepper: {
      circleSize: string;
      circleBorder: string;
      circleBackground: string;
      circleForeground: string;
      circleBackgroundActive: string;
      circleForegroundActive: string;
      circleBackgroundCompleted: string;
      circleForegroundCompleted: string;
      connectorColor: string;
      connectorColorCompleted: string;
      labelColor: string;
      labelColorActive: string;
      descriptionColor: string;
      fontSize: string;
      gap: string;
    };
    slider: {
      trackSize: string;
      trackColor: string;
      fillColor: string;
      thumbSize: string;
      thumbBackground: string;
      thumbBorder: string;
      thumbBorderFocus: string;
      tickColor: string;
      tickSize: string;
      bubbleBackground: string;
      bubbleForeground: string;
    };
    chart: {
      gridColor: string;
      axisLabelColor: string;
      axisLabelFontSize: string;
      tooltipBackground: string;
      tooltipForeground: string;
      tooltipRadius: string;
      legendFontSize: string;
      legendGap: string;
      lineStrokeWidth: string;
      areaOpacity: string;
    };
    table: {
      border: string;
      radius: string;
      headerBackground: string;
      headerForeground: string;
      rowBackground: string;
      rowBackgroundStriped: string;
      rowBackgroundHover: string;
      rowBackgroundSelected: string;
      fontSize: string;
      cellPaddingX: string;
      cellPaddingY: string;
      sortIconColor: string;
      sortIconColorActive: string;
    };
    colorPicker: {
      svAreaSize: string;
      hueTrackHeight: string;
      thumbSize: string;
      hueThumbWidth: string;
      presetSize: string;
      presetGap: string;
      presetBorder: string;
      presetBorderSelected: string;
    };
    datePicker: {
      daySize: string;
      fontSize: string;
      dayForeground: string;
      dayForegroundOutsideMonth: string;
      dayBackgroundHover: string;
      dayBackgroundSelected: string;
      dayForegroundSelected: string;
      dayBorderToday: string;
      navBackgroundHover: string;
      weekdayForeground: string;
      monthLabelForeground: string;
    };
    carousel: {
      radius: string;
      arrowSize: string;
      arrowBackground: string;
      arrowBackgroundHover: string;
      arrowColor: string;
      dotSize: string;
      dotColor: string;
      dotColorActive: string;
      dotGap: string;
    };
    toast: {
      radius: string;
      shadow: string;
      paddingX: string;
      paddingY: string;
      gap: string;
      /** Every toast's width, e.g. `'24rem'`. */
      width: string;
      /** `backdrop-filter` value applied to every toast, e.g. `'blur(12px)'`. `'none'` disables it. Pairs with translucent variant backgrounds (see `variants.*.background`). */
      blur: string;
      variants: Record<ToastVariant, ToastVariantTokens>;
    };
    fileUpload: {
      border: string;
      borderDragOver: string;
      background: string;
      backgroundDragOver: string;
      radius: string;
      iconColor: string;
      hintColor: string;
      acceptColor: string;
      itemBackground: string;
      itemBorder: string;
      itemRadius: string;
      thumbSize: string;
      rejectionColor: string;
    };
    dialog: {
      backdropColor: string;
      panelBackground: string;
      panelBorder: string;
      radius: string;
      shadow: string;
      headerBorder: string;
      footerBorder: string;
      titleFontSize: string;
      titleFontWeight: string;
      padding: string;
      widths: Record<DialogSize, string>;
    };
    speedDial: {
      /** Radius of the trigger and of every mini action. `'var(--semiui-radius-full)'` gives the conventional circular FAB; a square-cornered preset sets its own. */
      radius: string;
      /** Elevation on the trigger and on every mini action. `'none'` for presets that don't use shadow. */
      shadow: string;
      /** Distance between the trigger and the fan of actions, and between the actions themselves. */
      gap: string;
      /** Diameter of one mini action, per the Speed Dial's `size`. Kept below the trigger's own size so the FAB stays visually dominant. */
      actionSize: Record<ButtonSize, string>;
      actionBackground: string;
      actionForeground: string;
      actionBorder: string;
      /** Delay step between consecutive actions in the staggered reveal, e.g. `'40ms'` -- the nth action waits n times this. `'0ms'` reveals them all at once. */
      stagger: string;
    };
    fullCalendar: {
      navButtonSize: string;
      navIconSize: string;
      /** Block-axis padding of the today/view-switch toolbar buttons. The inline axis reuses `var(--semiui-spacing-md)` -- it matches on every preset's spacing scale. */
      toolbarButtonPaddingY: string;
      titleFontSize: string;
      cellMinHeight: string;
      cellMinHeightWeek: string;
      eventsGap: string;
      eventPaddingX: string;
      eventPaddingY: string;
      eventFontSize: string;
    };
    treeTable: {
      checkboxColumnWidth: string;
      toggleSize: string;
      toggleMarginEnd: string;
      toggleIconSize: string;
    };
    richTextEditor: {
      toolbarGap: string;
      toolSize: string;
      toolIconSize: string;
      /** `font-size` of an `<h1>` inside the editable content, in `em` relative to the editor's own base font size. */
      contentHeadingFontSizeLg: string;
      /** `font-size` of an `<h2>` inside the editable content, in `em` relative to the editor's own base font size. */
      contentHeadingFontSizeMd: string;
      /** Vertical margin shared by headings, paragraphs, and lists inside the editable content, in `em`. */
      contentBlockSpacing: string;
      /** `padding-inline-start` of `<ul>`/`<ol>` inside the editable content, in `em`. */
      contentListIndent: string;
    };
    timeline: {
      markerIconSize: string;
      /** `min-width` of a connector segment when `orientation="horizontal"`; the vertical orientation's connector length instead maps directly to `var(--semiui-spacing-lg)`, which matches on every preset. */
      connectorMinLength: string;
      contentGap: string;
    };
    cascadeSelect: {
      /** `min-width` of one cascade column's panel. Deliberately narrower than a top-level Select dropdown, so it's its own token rather than reusing `comp.select.*` like the rest of Cascade Select does. */
      panelMinWidth: string;
    };
    contextMenu: {
      panelMinWidth: string;
    };
    autoComplete: {
      /** `padding-inline-end` reserved on the input so typed text never runs under the trailing clear/loading affordance. */
      inputPaddingEnd: string;
    };
    progressBar: {
      trackHeight: Record<ButtonSize, string>;
      labelFontSize: string;
    };
    scrollTop: {
      buttonSize: string;
      iconSize: string;
    };
    splitButton: {
      menuMinWidth: string;
    };
    imageCropper: {
      /** Rule-of-thirds grid line color, drawn over the cropped image itself rather than over app chrome -- conventionally a translucent white regardless of light/dark theme, but still a preset-owned value rather than a literal. */
      gridLineColor: string;
      zoomSliderMaxWidth: string;
    };
    organizationChart: {
      /** A node's box reuses `comp.popover.*` directly for background/border/radius/shadow, and
       * `var(--semiui-spacing-lg)` / `var(--semiui-spacing-md)` for its padding -- a node card is
       * genuinely a popover-style surface, and the padding matches on every preset's spacing scale.
       * Only what's actually new to this component gets its own token. */
      nodeMinWidth: string;
      nodeBackgroundSelected: string;
      nodeBorderSelected: string;
      toggleSize: string;
      /** Vertical connector length between a node and its children, and the horizontal gap between sibling subtrees. */
      gap: string;
    };
    knob: {
      /** The track reuses `var(--semiui-color-muted)` and the default arc/value-text color reuses
       * `var(--semiui-color-primary)` directly in CSS -- same precedent as Progress Bar's own
       * track/fill, which reuse those same two global tokens rather than declaring their own. Only
       * the sizing/label values below are genuinely new to this component. */
      valueFontSize: string;
      labelColor: string;
      labelFontSize: string;
    };
  };
}
