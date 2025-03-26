<template>
    <span @click.stop="onClick" class="text-no-wrap cursor-pointer coLink" >
      {{ theGene }}
    </span>
</template>

<script setup>
import { PAGE_NAMES } from '@/constants'
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()

const genePage = PAGE_NAMES.GENE

const props = defineProps({
  gene: '',
})

// some genes are just text string, but table1's "Other Genes Any Tissue" have format: 'gene (tissue)'
let theGene = props.gene.trim().split(' ')[0]

const onClick = () => {
  appStore[genePage].updateRoute = true
  appStore[genePage].selectedGene = theGene
}
</script>

<style scoped>
</style>
