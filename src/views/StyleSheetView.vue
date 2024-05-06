<template>
  <v-col class="ml-2 mb-4">
    <v-row class="d-block mt-2">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <p class="text-clcAction">
        <v-icon icon="mdi-filter-outline" class="mx-3 text-clcAction" size="40px"/>
        Action color
      </p>

    </v-row>
    <v-row>
      <div class="bg-clcBackground div-size">Background color</div>
      <div class="text-clcAction div-size">Action color</div>
      <div class="bg-clcBackground div-size"><v-icon icon="mdi-filter-outline" class="mx-3 text-clcAction" size="40px"/></div>
    </v-row>
    <v-row>
      <div class="div-size1">
        <h1>Heading 1 (no background)</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </v-row>
    <v-row>
      <div class="bg-clcBackground div-size1">
        <h1>Heading 1 (with background)</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </v-row>
    <v-row class="d-flex ml-2">
      <div style="height: 50px" />
      <div class="spacer borderer bg-something on-something">background color with appropriate text color contrast</div>
      <div class="spacer borderer bg-something on-clcAction">background color with appropriate text color contrast</div>
      <div class="spacer borderer text-something">text color</div>
      <div class="spacer border-something">border color (doesn't seem to work)</div>
      <h1 class="shade-class spacer">shades</h1>
    </v-row>
    <v-row>
      <div class=" div-size my-8 bg-black">
        <table>
          <thead>
          <tr>
            <td></td>
            <td>Trait 1</td>
            <td>Trait 2</td>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td class="rpad">Variant 1</td>
            <td class="bg-clcEffPos">+</td>
            <td class="bg-clcEffNeg">-</td>
          </tr>
          <tr>
            <td class="rpad">Variant 2</td>
            <td class="bg-clcEffZero">0</td>
            <td class="bg-clcEffNA">NAN</td>
          </tr>
          </tbody>
        </table>
      </div>
    </v-row>

    <v-row>
      <h1 :style="{color: '#ffffff'}">header</h1>
      <br/>
      <table>
        <thead>
          <tr>
            <td>Original V1</td>
            <td>Original V2</td>
            <td>V1 hex</td>
            <td>V2 hex</td>
            <td>Formatted V1</td>
            <td>Formatted V2</td>
            <td>V1 hex</td>
            <td>V2 hex</td>
            <td>V1 MD5</td>
            <td>V2 MD5</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, index) in t1v" :key="index">
            <td><span class="mx-2" :style="{color: colorHasher.hex(v)}">{{f(v)}}</span></td>
            <td><span class="mx-2" :style="{color: colorHasher.hex(t2v[index])}">{{f(t2v[index])}}</span></td>
            <td>{{colorHasher.hex(v)}}</td>
            <td>{{colorHasher.hex(t2v[index])}}</td>
            <td><span class="mx-2" :style="{color: myColorHasher(v)}">{{f(v)}}</span></td>
            <td><span class="mx-2" :style="{color: myColorHasher(t2v[index])}">{{f(t2v[index])}}</span></td>
            <td>{{colorHasher.hex(f(v))}}</td>
            <td>{{colorHasher.hex(f(t2v[index]))}}</td>
            <td><span class="mx-2" :style="{color: myMD5Hasher(v)}">{{f(v)}}</span></td>
            <td><span class="mx-2" :style="{color: myMD5Hasher(t2v[index])}">{{f(t2v[index])}}</span></td>
            <td>{{colorHasher.hex(md5(f(v)))}}</td>
            <td>{{colorHasher.hex(md5(f(t2v[index])))}}</td>
          </tr>
        </tbody>
      </table>
    </v-row>

  </v-col>
</template>

<script setup>
import { md5 } from 'js-md5'
import { colorHasher, formatVariantString } from '@/util/util'

const t1v = ['5_148572915_G_A','3_36981990_C_CA','19_59056752_G_C','5_57578302_G_A','4_88226231_T_C','2_100838157_C_T','12_4384844_T_G','8_61455861_A_G','12_48180508_C_T','19_4048682_AAAAAAAC_A']
const t2v = ['5_148564757_A_C','3_37268913_G_T','19_59083594_T_A','5_57607142_A_T','4_88186441_G_A','2_100820431_A_G','12_4384844_T_G','8_61378363_T_A','12_48180508_C_T','19_4083916_G_A']

const f = (value) => {
  return formatVariantString(value)
}

const myColorHasher = (value) => {
  return colorHasher.hex(formatVariantString(value))
}

const myMD5Hasher = (value) => {
  return colorHasher.hex(md5(formatVariantString(value)))
}

</script>

<style scoped>
.div-size {
  height: 150px;
  width: 150px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
}
.div-size1 {
  padding: 4px;
  width: 800px;
  margin: 10px;
  border: 1px solid black;
}
.shade-class {
  background: rgba(var(--v-theme-something), 0.2);
  color: rgba(var(--v-theme-on-something), 0.5);
}

.spacer {
  padding: 4px;
  margin: 4px;
}

.borderer {
  border: 1px solid black;
}

.rpad {
  margin-right: 4px;
}

td {
  text-align: center;
  font-weight: bold;
  font-size: 0.875rem;
}

</style>
