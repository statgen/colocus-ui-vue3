const steps = [
  {
    id: 'step-1',
    title: "Select settings",
    attachTo: { element: '#subPanelSelect', on: 'right', },
    buttons: [
      { text: 'Next', action: 'next', },
    ],
    text: 'To narrow the range of data displayed in the table, you may select study, gene, phenotype, or tissue, or specify the region on a chromosome.',
  },
  {
    id: 'step-2',
    title: "Threshold settings",
    attachTo: { element: '#subPanelThreshold', on: 'right', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    text: 'To narrow the range of data displayed in the table, you may specify the -log10 p-value of either trait, the posterior probability (h4) or correlation (r<sup>2</sup>).',
  },
  {
    id: 'step-3',
    title: "View settings",
    attachTo: { element: '#subPanelView', on: 'right', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    text: 'Optionally color-code variant display, and optionally display Ensemble IDs and effect sizes.',
  },
  {
    id: 'step-4',
    title: "Data Table: Headers",
    attachTo: { element: '#searchDataTable thead tr:first-child', on: 'bottom', },
    // floatingUIOptions: { middleware: [offset({ mainAxis: -225, crossAxis: 0 })] },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    text: 'Sort the table by clicking one or more column headers, click again to remove',
  },
  {
    id: 'step-5',
    title: "Data Table: Rows",
    attachTo: { element: '#searchDataTable tbody tr:first-child', on: 'bottom', },
    floatingUIOptions: {
      placement: 'bottom',
    },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    classes: 'shepherd-step-limited',
    text: `Within each data row you can:
      <ul class="tut-ind-l1">
        <li>Hover over any item displayed with an ellipsis (…) to see full expansion</li>
        <li>Click on a row to go to the LocusZoom page</li>
        <li>Click the down-arrow button on either side of the row to open a Details panel</li>
        <li>Hover over cells in the Concord column to view details in tabular form</li>
      </ul>`,
  },
  {
    id: 'step-6',
    title: "Data Table: Details panel",
    attachTo: { element: '#dataTableDetails', on: 'bottom', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    text: `Within the Details panel, you can:
      <ul class="tut-ind-l1">
        <li>Click a button to go to the LocusZoom page</li>
        <li>Click links to go to local Manhattan and Gene pages for more detail</li>
        <li>Click links to go to phenotype and gene pages on the AMP knowledge portal for more detail</li>
      </ul>`,
  },
  {
    id: 'step-7',
    title: "Data Table: Footer",
    attachTo: { element: '#searchDataTable .v-data-table-footer', on: 'bottom', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Done', action: 'complete', },
    ],
    text: `The table footer allows you to:
      <ul class="tut-ind-l1">
        <li>Set rows displayed by selecting from drop-down</li>
        <li>Page through data by clicking arrow buttons</li>
        <li>Download currently displayed data by clicking green document download icon</li>
      </ul>`,
  },
]

export default steps
