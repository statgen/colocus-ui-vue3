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
      { text: 'Next', action: 'next', },
    ],
  },
  {
    id: 'step-4',
    attachTo: { element: '#searchDataTable', on: 'bottom-start', },
    title: "Data Table",
    text: `
      <ul class="tut-ind-l1">
        <li>Sort by clicking one or more column headers, click again to remove</li>
        <li>Within each data row you can:</li>
        <ul class="tut-ind-l2">
          <li>Hover over any item displayed with an ellipsis (...) to see full expansion</li>
          <li>Hover over Trait 1 or Trait 2 to see links to further information (local Manhattan plot, link to details on AMP knowledge portal)</li>
          <li>Hover over Variant 1 or Variant 2 for a link to details on AMP knowledge portal</li>
          <li>Click elsewhere on a row (e.g., in the Study 1 column) to go to the LocusZoom page</li>
          <li>Hover over cells in the Concord column to view details in tabular form</li>
        </ul>
        <li>The table footer allows you to:</li>
        <ul class="tut-ind-l1">
          <li>Set rows displayed by selecting from drop-down</li>
          <li>Page through data by clicking arrow buttons</li>
          <li>Download currently displayed data by clicking green icon</li>
        </ul>
      </ul>`,
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Done', action: 'complete', },
    ],
  },
  ]

export default steps
