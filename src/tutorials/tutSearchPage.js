const steps = [
  {
    id: 'step-1',
    attachTo: { element: '#subPanelSelect', on: 'right', },
    modalOverlayOpeningRadius: 7,
    title: "Select settings",
    text: 'To narrow the range of data displayed in the table, you may select study, gene, phenotype, or tissue, or specify the region on a chromosome.',
    buttons: [
      { text: 'Next', action: 'next', },
    ],
  },
  {
    id: 'step-2',
    attachTo: { element: '#subPanelThreshold', on: 'right', },
    title: "Threshold settings",
    text: 'To narrow the range of data displayed in the table, you may specify the -log10 p-value of either trait, the posterior probability (h4) or correlation (r<sup>2</sup>).',
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
  },
  {
    id: 'step-3',
    attachTo: { element: '#subPanelView', on: 'right', },
    title: "View settings",
    text: 'Optionally color-code variant display, and optionally display Ensemble IDs and effect sizes.',
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Done', action: 'complete', },
    ],
  },
  ]

export default steps
