<template>
  <div>
  <UPageHero
    title="ASCII Converter"
    description="A Nuxt/Vue-powered creative studio that transforms images and plain text into beautiful, retro-style ASCII art with modern performance."
    headline="New release"
     orientation="horizontal"
  >

  <div>
      <img
    src="/favicon.ico"
    class="w-10 h-10"
  >
    <UPageCard
      title="ascii-path"
      description="Convert Paths to Ascii"
      icon="i-simple-icons-tailwindcss"
      to="./pngtoascii"

      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 
    >
      <!-- <img src="/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
    </UPageCard>
    <UPageCard
      title="ascii-shape"
      description="Convert Shapes to Ascii"
      icon="i-simple-icons-tailwindcss"
      to="./pngtoascii/shape"

      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 
    >
      <!-- <img src="/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
    </UPageCard>
    <UPageCard
      title="ascii-bigtext"
      description="Convert text to Ascii"
      icon="i-simple-icons-tailwindcss"
      to="./pngtoascii/bigtext"

      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 


      highlight
      highlight-color="primary"
    >
      <!-- <img src="/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
    </UPageCard>

  </div>

</UPageHero>






  </div>
</template>
