<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NButton, NCard, NForm, NFormItem, NInput, NSpace, NText } from 'naive-ui';
import { useAuthStore } from '../stores/auth.js';
import { useZodForm } from '../composables/useZodForm.js';
import { registerRequestSchema } from '@frollz2/schema';

const authStore = useAuthStore();
const router = useRouter();
const { values, errors, validate } = useZodForm(registerRequestSchema, { email: '', password: '', name: '' });

async function submit(): Promise<void> {
  const parsed = validate();

  if (!parsed) {
    return;
  }

  await authStore.register(parsed);
  await router.push('/film');
}
</script>

<template>
  <NCard title="Register">
    <NSpace vertical>
      <NForm>
        <NFormItem label="Name">
          <NInput :value="values.name" @update:value="(value) => { values.name = value; }" />
        </NFormItem>
        <NFormItem label="Email">
          <NInput :value="values.email" type="email" @update:value="(value) => { values.email = value; }" />
        </NFormItem>
        <NFormItem label="Password">
          <NInput :value="values.password" type="password" @update:value="(value) => { values.password = value; }" />
        </NFormItem>
      </NForm>
      <NSpace>
        <NButton type="primary" @click="submit">Register</NButton>
        <NButton tertiary @click="router.push('/login')">Login</NButton>
      </NSpace>
      <NText v-for="error in errors" :key="error" type="error">{{ error }}</NText>
    </NSpace>
  </NCard>
</template>
