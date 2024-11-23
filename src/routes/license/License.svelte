<script lang="ts">
	import type { Snippet } from "svelte";

  interface Props {
    title: string,
    children: Snippet
  };

  let { title, children }: Props = $props();
</script>

<div>
  <h2>{title}</h2>
  <span class="whitespace-break-spaces">
    {@render children()}
  </span>
</div>