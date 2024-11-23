<script lang="ts">
	import type { WarEvent } from "$lib/types";
	import Icon from "@iconify/svelte";

  interface Props {
    event: WarEvent
  }

  const { event }: Props = $props();
  let derived_comp = $derived(import(`../war_events/${event.slug}.md`))

</script>

<div class="w-full markdown-container">
{#await derived_comp}
  <div class="w-full h-full flex flex-col items-center justify-center">
    <Icon icon="line-md:loading-loop" />
  </div>
{:then loaded_comp}
  <div class="text-2xl">
    {event.title}
  </div>
  <div class="text-gray-600">
    {event.date}
  </div>
  <hr class="py-1" />
  {@render loaded_comp.default()}
{/await}
</div>