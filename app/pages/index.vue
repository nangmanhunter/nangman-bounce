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
      icon="i-lucide-spline" 
      to="./pngtoascii"
      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 
    >
      </UPageCard>

    <UPageCard
      title="ascii-shape"
      description="Convert Shapes to Ascii"
      icon="i-lucide-shapes" 
      to="./pngtoascii/shape"
      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 
    >
      </UPageCard>

    <UPageCard
      title="ascii-bigtext"
      description="Convert Texts to Ascii"
      icon="i-lucide-type" 
      to="./pngtoascii/bigtext"
      orientation="horizontal"
      spotlight
      spotlight-color="primary"
      _class="[--spotlight-color:var(--ui-error)] [--spotlight-size:200px]" 
      highlight
      highlight-color="primary"
    >
      </UPageCard>

  </div>

</UPageHero>






  </div>
</template>
