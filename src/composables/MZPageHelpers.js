import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'


export function useMZPageHelpers() {
  const appStore = useAppStore()
  const MZPage = appStore[PAGE_NAMES.MULTIZOOM]

  const addMZPlot = (plotID, showPlotID, showGenSigLine, showRecombLine, variant, signalID, colocID, slot) => {
    if(!MZPage.plotSettings[plotID]) {
      MZPage.plotSettings[plotID] = { showPlotID, showRecombLine, showGenSigLine, variant, signalID, colocID, slot }
      makeMZColocsSignals()
    }
  }

  const deleteMZPlot = (plotID) => {
    if(MZPage.plotSettings[plotID]) {
      const colocID = MZPage.plotSettings[plotID].colocID
      const slot = MZPage.plotSettings[plotID].slot
      delete MZPage.rowSlotToPlotID[colocID][slot]
      delete MZPage.plotSettings[plotID]
    } else {
      console.warn(`Error trying to delete nonexistent plot: ${plotID}`)
    }
  }

  const deleteMZPlotsAll = () => {
    MZPage.plotSettings = {}
    MZPage.rowSlotToPlotID = {}
  }

  const getMZPlotID = (colocID, slot) => {
    return MZPage.rowSlotToPlotID?.[colocID]?.[slot] ?? null
  }

  const getMZSignals = () => {
    return Object.values(MZPage.plotSettings).map(v => v.signalID)
  }

  const makeMZColocsSignals = () => {
    MZPage.colocsSignals = Object.values(MZPage.plotSettings).map(v => `${v.colocID}-${v.signalID}`)
  }

  const setMZRowSlotPlotID= (colocID, slot, plotID) => {
    if (!MZPage.rowSlotToPlotID[colocID]) MZPage.rowSlotToPlotID[colocID] = {}
    MZPage.rowSlotToPlotID[colocID][slot] = plotID
  }

  return {
    addMZPlot,
    deleteMZPlot,
    deleteMZPlotsAll,
    getMZPlotID,
    getMZSignals,
    makeMZColocsSignals,
    setMZRowSlotPlotID,
  }
}
