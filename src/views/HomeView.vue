<template>
  <DefaultLayout>
    <div class="text-content-block">
      <h1>Home</h1>
      <p>This is the flow of data in the Colocus application.</p>
      <img alt="AMP Home" src="../../src/assets/app_overview.png" height="350" />

      <h2>Our goals</h2>
      <ul>
        <li>
          To facilitate cross-study exploration, evaluation, and visualization of potentially causal genes and omic features that underlie GWAS traits, using colocalized omic QTL and GWAS data.
        </li>
        <li>
          To allow assessment of the specificity and quality of gene/feature-GWAS colocalizations   through display of all  colocalized genes/features for a given GWAS signal and display of genes/features with >1 colocalization with local GWAS signals.
        </li>
        <li>
          To provide presentation-ready graphics to support findings
        </li>
      </ul>

      <h2>Main pages</h2>
      <p>
        <a href="/search" class="coLink font-weight-bold">Search page:</a> Your entryway to exploring the data in colocus.  From the Search page you can select a gene, and/or a trait of interest and set filters for data display such as the strength of the eQTL or GWAS signals and the posterior probability of colocalization.
      </p>
      <p>
        <a href="/studies" class="coLink font-weight-bold">Studies page:</a> Contains omic QTL and GWAS study information, including data sources and references.
      </p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
</script>

<style scoped>
ul {
  list-style-type: disc;
  padding-left: 1rem;
}
li {
  margin-top: 1rem;
}

h2 {
  margin-top: 1rem;
}

p {
  margin-top: 1rem;
}
</style>
