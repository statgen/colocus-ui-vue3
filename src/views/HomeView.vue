<template>
  <DefaultLayout>
    <div class="text-content-block">
      <h1>Home</h1>
      <p>This is the flow of data in the Colocus application. Click on the image to see a larger version.</p>
      <br/>

      <img 
        alt="AMP Home" 
        src="../../src/assets/colocus_big_overview.png" 
        height="600" 
        @click="dialog = true"
        style="cursor: pointer;"
      />

      <v-dialog v-model="dialog" max-width="90%">
        <v-card>
          <v-card-text class="pa-0">
            <img 
              alt="AMP Home" 
              src="../../src/assets/colocus_big_overview.png" 
              style="width: 100%; height: auto;"
            />
          </v-card-text>
        </v-card>
      </v-dialog>

      <h2>Our goals</h2>
      <ul>
        <li>
          To facilitate cross-study exploration, evaluation, and visualization of potentially causal genes and omic features that underlie GWAS traits, using colocalized omic QTL and GWAS data.
        </li>
        <li>
          To allow assessment of the specificity and quality of gene/feature-GWAS colocalizations   through display of all  colocalized genes/features for a given GWAS signal and display of genes/features with >1 colocalization with local GWAS signals.
        </li>
        <li>
          To provide presentation-ready graphics to support findings.
        </li>
      </ul>

      <h2>Main pages</h2>
      <p>
        <a href="/search" class="coLink font-weight-bold">Search page:</a> Your entryway to exploring the data in colocus.  From the Search page you can select a gene, and/or a trait of interest and set filters for data display such as the strength of the eQTL or GWAS signals and the posterior probability of colocalization.
      </p>
      <p>
        <a href="/gene" class="coLink font-weight-bold">Gene page:</a> Contains information about a specific gene of interest, including its colocalized features and associated GWAS signals.
      </p>
      <p>
        <a href="/qcstats" class="coLink font-weight-bold">QC statistics page:</a> Provides quality control statistics.
      </p>
      <p>
        <a href="/summarystats" class="coLink font-weight-bold">Summary statistics page:</a> Displays plots of summary statistics over all fine-mapped signals and colocalizations.
      </p>
      <p>
        <a href="/studies" class="coLink font-weight-bold">Studies page:</a> Contains omic QTL and GWAS study information, including data sources and references.
      </p>
      <p>
        <a href="/help" class="coLink font-weight-bold">Help page:</a> Contains information about how to use Colocus and frequently asked questions.
      </p>

      <h2>Funding</h2>
      <p></p>
      <div class="markdown-body" v-html="fundingContent"></div>

      <h2>Open Source</h2>
      <p>
        Colocus is open source software and licensed MIT. The source code is available on <a href="https://github.com/statgen/colocus" target="_blank" class="coLink font-weight-bold">GitHub</a>. We provide a Docker Compose setup for easy deployment on your own server.
      </p>

      <h2>Feedback</h2>
      <p></p>
      <div class="markdown-body" v-html="feedbackContent"></div>

      <p></p>

    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import fundingContent from '@/docs/funding.md'
import feedbackContent from '@/docs/feedback.md'

const dialog = ref(false)
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
