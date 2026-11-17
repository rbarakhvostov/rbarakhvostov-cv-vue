<script setup lang="ts">
import { contacts } from '../data/contacts';
import ContactIcon from './ContactIcon.vue';
import RoleLine from './RoleLine.vue';

defineProps<{
  name: string;
  roleLine: string;
  newTabHint: string;
}>();

const targetFor = (href: string): '_blank' | undefined =>
  href.startsWith('http') ? '_blank' : undefined;
</script>

<template>
  <header class="header">
    <div class="header__main">
      <h1 class="header__name">{{ name }}</h1>
      <RoleLine class="header__roles" :value="roleLine" />
      <ul class="header__contacts" role="list">
        <li v-for="contact in contacts" :key="contact.href">
          <a
            :href="contact.href"
            :target="targetFor(contact.href)"
            rel="me noopener"
          >
            <ContactIcon :name="contact.icon" />
            {{ contact.label
            }}<span v-if="targetFor(contact.href)" class="visually-hidden"
              >&nbsp;{{ newTabHint }}</span
            >
          </a>
        </li>
      </ul>
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
  margin: 0 0 8px;
  font-size: clamp(29px, 5.4vw, 46px);
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.header__roles {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-role);
}

.header__contacts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-role);
}

.header__contacts a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-role) 40%, transparent);
}

.header__contacts .contact-icon {
  color: color-mix(in srgb, var(--color-role) 72%, transparent);
}

.header__contacts a:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.header__contacts a:hover .contact-icon {
  color: var(--color-accent);
}

@media screen and (width <= 640px) {
  .header__contacts {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
