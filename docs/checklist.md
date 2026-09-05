---
title: Checklist
description: An interactive, persistent checklist for buying a house in Switzerland — financing, property search, closing and after purchase.
---

# Interactive Checklist

Work through these items across the different phases of your purchase. Checkboxes are saved in your browser (localStorage) and re-appear when you come back.

<div class="calc-widget" x-data="checklistApp()">
  <div class="checklist-progress">
    <span class="checklist-progress-count">
      <b x-text="done"></b> / <b x-text="total"></b> items done
    </span>
    <button type="button" class="checklist-reset" @click="reset()">Reset checklist</button>
  </div>

  <template x-for="group in groups" :key="group.id">
    <div class="checklist-group">
      <h3 class="checklist-group-title">
        <span x-text="group.title"></span>
        <span class="checklist-group-count" x-text="groupDone(group.id) + ' / ' + group.items.length"></span>
      </h3>
      <label class="checklist-item" x-for="item in group.items" :key="item.id">
        <input type="checkbox" :checked="checked[item.id]" @change="toggle(item.id)">
        <span x-text="item.text"></span>
      </label>
    </div>
  </template>

  <p class="calc-note">
    Progress is stored only in this browser — it is not sent anywhere. Use the Reset button to clear it.
  </p>
</div>