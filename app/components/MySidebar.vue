<!--
i-lucide
- box
- image
- file-image
- sparkles
- layout-dashboard


- home
- refresh-cw
- arrow-left-right
- files
- layers
- download
- history
- crop
- scissors
- settings
- sliders



-->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps<{
  mode: 'drawer' | 'slideover' | 'modal'
}>()

const items: NavigationMenuItem[] = [
  { icon: 'i-lucide-house', label: 'Home', to: '/' },
  { icon: 'i-lucide-box', label: 'svg-to-png/',
    defaultOpen: true,
    children: [
      { icon: 'i-lucide-box', label: 'upload/',  to: '/svgtopng/upload/' },
      { icon: 'i-lucide-box', label: 'bounce/',  to: '/svgtopng/bounce/' },
      { icon: 'i-lucide-box', label: 'cascade/', to: '/svgtopng/cascade/' },
    ]
  },
  { icon: 'i-lucide-box', label: 'png-to-ascii/',
    defaultOpen: true,
    children: [
      { icon: 'i-lucide-box', label: 'bigtext/', to: '/pngtoascii/bigtext/' },
      { icon: 'i-lucide-box', label: 'path/', to: '/pngtoascii/path/' },
      { icon: 'i-lucide-box', label: 'shape/', to: '/pngtoascii/shape/' },
    ]
  },

]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar :mode="mode">
      <template #header="{ collapsed }">
        <div class="flex items-center justify-center w-full">
          <Logo
            v-if="!collapsed"
            class="h-5 w-auto"
          />
          <UIcon
            v-else
            name="i-simple-icons-nuxtdotjs"
            class="size-5 text-primary mx-auto"
          />
        </div>
      </template>

      <UNavigationMenu
        class=""
        :items="items"
        orientation="vertical"
      />
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <div>
          <UDashboardNavbar />
        </div>
      </template>


      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
