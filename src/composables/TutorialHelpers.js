export function useTutorialHelpers() {

  const buildTourSteps = (tour, steps) => {
    return steps.map(step => ({
      ...step,
      classes: 'custom-shepherd-offset', // see global.css for definition
      buttons: step.buttons.map(button => {
        if (typeof button.action === 'string') {
          switch (button.action) {
            case 'next':
              return { ...button, action: () => tour.next() }
            case 'back':
              return { ...button, action: () => tour.back() }
            case 'complete':
              return { ...button, action: () => tour.complete() }
            default:
              return button
          }
        }
        return button
      })
    }))
  }

  return { buildTourSteps }
}
