import { offset } from '@floating-ui/dom';

const steps = [
  {
    id: 'step-1',
    attachTo: { element: '#subPanelSelect', on: 'right', },
    buttons: [
      { text: 'Next', action: 'next', },
    ],
    title: "Select settings",
    text: 'To narrow the range of data displayed in the table, you may select study, gene, phenotype, or tissue, or specify the region on a chromosome.',
  },
  {
    id: 'step-2',
    attachTo: { element: '#subPanelThreshold', on: 'right', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    title: "Threshold settings",
    text: 'To narrow the range of data displayed in the table, you may specify the -log10 p-value of either trait, the posterior probability (h4) or correlation (r<sup>2</sup>).',
  },
  {
    id: 'step-3',
    attachTo: { element: '#subPanelView', on: 'right', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    title: "View settings",
    text: 'Optionally color-code variant display, and optionally display Ensemble IDs and effect sizes.',
  },
  {
    id: 'step-4',
    attachTo: { element: '#searchDataTable', on: 'top', },
    floatingUIOptions: { middleware: [offset({ mainAxis: -440, crossAxis: 0 })] },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    title: "Data Table: Headers",
    text: 'Sort the table by clicking one or more column headers, click again to remove',
  },
  {
    id: 'step-5',
    attachTo: { element: '#searchDataTable', on: 'top', },
    floatingUIOptions: { middleware: [offset({ mainAxis: -330, crossAxis: 0 })] },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Next', action: 'next', },
    ],
    title: "Data Table: Rows",
    text: `Within each data row you can:
      <ul class="tut-ind-l1">
        <li>Hover over any item displayed with an ellipsis (...) to see full expansion</li>
        <li>Hover over Trait 1 or Trait 2 to see links to further information (local Manhattan plot, link to details on AMP knowledge portal)</li>
        <li>Hover over Variant 1 or Variant 2 for a link to details on AMP knowledge portal</li>
        <li>Click elsewhere on a row (e.g., in the Study 1 column) to go to the LocusZoom page</li>
        <li>Hover over cells in the Concord column to view details in tabular form</li>
      </ul>`,
  },
  {
    id: 'step-6',
    attachTo: { element: '#searchDataTable', on: 'bottom', },
    buttons: [
      { text: 'Back', action: 'back', },
      { text: 'Done', action: 'complete', },
    ],
    title: "Data Table: Footer",
    text: `The table footer allows you to:
      <ul class="tut-ind-l1">
        <li>Set rows displayed by selecting from drop-down</li>
        <li>Page through data by clicking arrow buttons</li>
        <li>Download currently displayed data by clicking green document download icon</li>
      </ul>`,
  },
  ]

export default steps
