<script lang="ts" setup>
const router = useRouter()

const route = router.currentRoute
</script>

<template>
  <div class="h-full">
    <SmartdataSwitchTab />
    <NuxtPage :transition="false" :page-key="route.params.typeOrId" />
  </div>
</template>
