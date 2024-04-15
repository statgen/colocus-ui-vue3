<template>
  <div class="zozo">
    <span>{{ title }}</span>
    <v-tooltip activator="parent" location="top">
      <h2>Concordance of Direction of Effect Between Trait 1 and 2</h2><br>
      <span>
          Column denoting whether directions of effect for the two colocalized variants are discordant between the two traits. <br><br>

          There are two colocalized variants, one for each trait. The two colocalized variants have an effect size in the marginal summary statistics for each trait. <br>
          We can build a 2x2 table from these effect sizes: <br><br>

          ⎡ sign(β<sub>1,1</sub>) sign(β<sub>1,2</sub>) ⎤ <br>
          ⎣ sign(β<sub>2,1</sub>) sign(β<sub>2,2</sub>) ⎦ <br><br>

          Where sign(β<sub>1,1</sub>) is the effect direction of trait 1 variant in trait 1's marginal summary statistics, <br>
          sign(β<sub>1,2</sub>) is the effect direction of trait 1 variant in trait 2's marginal summary statistics, etc. <br><br>

          The effect directions for both variants are oriented toward the alternate allele (the second allele in the variant ID).<br><br>

          Discordance occurs when the pattern of effect size directions changes from the first to second variant,
          in other words: <br><br>

          sign(β<sub>1,1</sub>) * sign(β<sub>1,2</sub>) != sign(β<sub>2,1</sub>) * sign(β<sub>2,2</sub>) <br><br>

          Various colors are: <br><br>
          <span class="text-clcEffPos">Positive effect direction</span><br>
          <span class="text-clcEffNeg">Negative effect direction</span><br>
          <span class="text-clcEffZero">Effect is zero</span><br>
          <span class="text-clcEffNA">Effect is missing (NA)</span><br>
        </span>
    </v-tooltip>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
})
</script>

<style scoped>
</style>
