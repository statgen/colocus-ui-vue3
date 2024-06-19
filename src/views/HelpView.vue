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
import { ref, watch, nextTick } from 'vue'
import helpContent from '@/docs/help/help.md'
import '@/styles/github-markdown.css'

const toc = ref(null)

const scrollToHeading = (id) => {
  const target = document.getElementById(id)
  if (target) {
    const toolbarHeight = document.querySelector('.v-toolbar').offsetHeight || 0
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - toolbarHeight
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })
  }
}

const handleLinkClick = (event) => {
  event.preventDefault()
  const targetId = event.target.getAttribute('href').substring(1)
  scrollToHeading(targetId)
}

watch(toc, async (newVal, oldVal) => {
  if (oldVal) {
    const oldLinks = oldVal.$el ? oldVal.$el.querySelectorAll('a') : oldVal.querySelectorAll('a')
    oldLinks.forEach(link => {
      link.removeEventListener('click', handleLinkClick)
    })
  }

  if (newVal) {
    await nextTick()
    const newLinks = newVal.$el ? newVal.$el.querySelectorAll('a') : newVal.querySelectorAll('a')
    newLinks.forEach(link => {
      link.addEventListener('click', handleLinkClick)
    })
  }
})
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
