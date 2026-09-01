<script setup lang="ts">
import { contacts } from '../data/contacts';
import RoleLine from './RoleLine.vue';

defineProps<{
  name: string;
  roleLine: string;
}>();
</script>

<template>
  <header class="header">
    <div class="header__main">
      <h1 class="header__name">{{ name }}</h1>
      <RoleLine class="header__roles" :value="roleLine" />
      <div class="header__contacts">
        <template v-for="(contact, index) in contacts" :key="contact.href">
          <span v-if="index > 0" class="header__sep">|</span>
          <a :href="contact.href">{{ contact.label }}</a>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px 32px;
}

.header__main {
  flex: 1 1 420px;
  min-width: 260px;
}

.header__name {
  margin: 0 0 10px;
  font-size: clamp(29px, 5.4vw, 46px);
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.header__roles {
  margin-bottom: 16px;
  font-size: clamp(14px, 2.2vw, 17px);
  color: var(--color-role);
}

.header__contacts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-role);
}

.header__contacts a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-role) 40%, transparent);
}

.header__contacts a:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.header__sep {
  color: var(--color-divider);
}

@media screen and (width <= 640px) {
  .header__contacts {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header__sep {
    display: none;
  }
}
</style>
