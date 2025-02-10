<template>
  <v-col cols="2">
    <v-sheet ref="toc" class="position-fixed bg-clcBackground px-2 mt-2" elevation="0" border>
      <h1>Help</h1>
      <ul>
        <h6><a href="#tutorial-videos" @click.prevent="scrollToHeading('tutorial-videos')">Tutorial Videos</a></h6>
        <li class="ml-4"><a href="#colocalization" @click.prevent="scrollToHeading('colocalization')">Colocalization</a></li>
        <li class="ml-4"><a href="#user-interface" @click.prevent="scrollToHeading('user-interface')">User Interface</a></li>

        <h6><a href="#pages" @click.prevent="scrollToHeading('views')">Pages</a></h6>
        <li class="ml-4"><a href="#search-page" @click.prevent="scrollToHeading('search-page')">Search Page</a></li>
        <li class="ml-4"><a href="#locuszoom-page" @click.prevent="scrollToHeading('locuszoom-page')">LocusZoom Page</a></li>
        <li class="ml-4"><a href="#genome-wide-trait-page" @click.prevent="scrollToHeading('genome-wide-trait-page')">Genome-wide trait page</a></li>

        <h6><a href="#faq" @click.prevent="scrollToHeading('faq')">FAQ</a></h6>
      </ul>
    </v-sheet>
  </v-col>
  <v-col cols="6" class="mt-2">
    <div class="markdown-body" v-html="helpContent"></div>
  </v-col>
</template>

<script setup>
import { useTemplateRef, watch, nextTick } from 'vue'
import helpContent from '@/docs/help/help.md'
import '@/styles/github-markdown.css'
import { scrollToHeading } from '@/util/util'

const tocRef = useTemplateRef('toc')

</script>

<style scoped>
a {
  font-size: 1rem;
  text-decoration: none;
  color: rgba(var(--v-theme-clcAction), 1.0);
}

a:hover {
  font-weight: bold;
}

li {
  font-size: 1.15rem;
  margin-left: 1rem;
}

h6 a {
  color: rgba(var(--v-theme-clcAction), 1.0);
  font-size: 1.25rem;
}
</style>
