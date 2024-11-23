<script lang="ts">
	import * as GMaps from '@googlemaps/js-api-loader';
	const { Loader } = GMaps;
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { onMount } from 'svelte';
	import { clsx } from 'clsx';
	import Icon from '@iconify/svelte';
	import WarEventPage from './WarEventPage.svelte';

	const TESTMODE = false;

	let page_error: string | null = $state(null);
	let map: google.maps.Map | null = $state(null);

	const getDateWithoutTime = (d: Date) => {
		return new Date(d.toDateString());
	};

	let { data } = $props();
	let war_events = data.war_events;

  let event_timings = $derived(war_events.map((v) => getDateWithoutTime(new Date(v.date))))
	// let timeline_min = $state(getDateWithoutTime(new Date('1/1/1800')));
	// let timeline_max = $state(getDateWithoutTime(new Date('1/1/2024')));
	let timeline_min = $derived(event_timings[0]);
	let timeline_max = $derived(event_timings[event_timings.length - 1]);
	let timeline_delta: number = $state(0);

  let timing_deltas = $derived(event_timings.map((v) => Math.round((v.getTime() - event_timings[0].getTime()) / (24 * 60 * 60 * 1000))));
  let timing_delta_max = $derived(timing_deltas[timing_deltas.length - 1]);

  let timeline_now = $derived(getDateWithoutTime(new Date(event_timings[0].getTime() + (timeline_delta * 24 * 60 * 60 * 1000))))

	let markers: google.maps.marker.AdvancedMarkerElement[] | undefined = $state(undefined);
  let focused_marker: number | undefined = $state(undefined);

  const handleMarkerClick = (idx: number) => {
    focused_marker = idx;
  };

	$effect(() => {
		if (timeline_delta < 0) {
			timeline_delta = 0;
		}
		if (timeline_delta > timing_delta_max) {
			timeline_delta = timing_delta_max;
		}
	});

	let map_element: HTMLDivElement | undefined;

	async function initMap(): Promise<void> {
		const loader = new Loader({
			apiKey: PUBLIC_GOOGLE_MAPS_API_KEY,
			version: 'weekly',
			language: 'ko',
			region: 'KR'
		});

		// The location of Uluru
		const position = { lat: -25.344, lng: 131.031 };

		// Request needed libraries.
		//@ts-ignore
		const { Map } = (await loader.importLibrary('maps')) as google.maps.MapsLibrary;
		const { AdvancedMarkerElement } = (await loader.importLibrary(
			'marker'
		)) as google.maps.MarkerLibrary;

		// The map, centered at Uluru
		map = new Map(map_element as HTMLElement, {
			zoom: 4,
			center: position,
			mapId: 'DEMO_MAP_ID',
			streetViewControl: false
		});

		map.addListener('click', (e: { latLng: any; }) => {
			const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() }
			console.log('clicked', latLng);
		});

		// The marker, positioned at Uluru
		markers = [];
		for (const we of war_events) {

      const dateTag = document.createElement('div');
      dateTag.className = 'date-tag';
      dateTag.textContent = getDateWithoutTime(new Date(we.date)).toLocaleDateString('en-US');

			markers.push(
				new AdvancedMarkerElement({
					map: map,
					position: { lat: we.lat, lng: we.lng },
					title: we.title,
          gmpClickable: true,
          content: dateTag,
				})
			);
      const idx = markers.length - 1;
      markers[idx].addListener('click', () => {
        handleMarkerClick(idx);
      })
		}

		
		const target_pos = markers[0].position;
		if(target_pos) {
			map.setZoom(6)
			map.panTo(target_pos)
		}
	}

	onMount(() => {
		if (!TESTMODE) {
			initMap()
				.then(() => {})
				.catch((r) => {
					page_error = r.toString();
				});
		}
	});

  $effect(() => {
    if(markers !== undefined && map !== null) {
      for(let i = 0; i < timing_deltas.length; i++) {
        markers[i].map = timing_deltas[i] <= timeline_delta ? map : null;
      }
    }
  });

  const gotoNextEvent = () => {
    if(timeline_delta < timing_delta_max) {
      let i = timing_deltas.length - 1;
      for(;i > 0; i--) {
        if(timeline_delta >= timing_deltas[i]) {
          break;
        }
      }
      i++;
      timeline_delta = timing_deltas[i];
      if(markers !== undefined && map !== null) {
        const target_pos = markers[i].position;
        if(target_pos) {
          map.setZoom(6)
          map.panTo(target_pos)
        }
      }
    }
  };

  const gotoPrevEvent = () => {
    if(timeline_delta > 0) {
      let i = 0;
      for(;i < timing_deltas.length; i++) {
        if(timeline_delta <= timing_deltas[i]) {
          break;
        }
      }
      i--;
      timeline_delta = timing_deltas[i];
      if(markers !== undefined && map !== null) {
        const target_pos = markers[i].position;
        if(target_pos) {
          map.setZoom(6)
          map.panTo(target_pos)
        }
      }
    }
  };
</script>

<svelte:head>
	<title>전쟁 지도</title>
</svelte:head>

<div class="relative w-full min-h-screen">
	<div
		class={clsx('absolute w-full h-full top-0 left-0', { hidden: TESTMODE })}
		bind:this={map_element}
	></div>
	<div
		class={clsx(
			'absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center bg-orange-100',
			{ hidden: !TESTMODE }
		)}
	>
		MAP
	</div>
  {#if focused_marker !== undefined}
	<div
		class="absolute w-1/4 py-2 px-2 h-full top-0 right-0 flex flex-col items-start justify-start bg-blue-100 rounded-xl border border-gray-600"
	>
    <div class="w-full my-2 pr-2">
      <button class="float-right" onclick={() => {focused_marker = undefined;}}>
        <Icon icon="mingcute:close-fill" />
      </button>
    </div>
		<div class="w-full overflow-auto">
			<WarEventPage event={war_events[focused_marker]}/>
		</div>
	</div>
  {/if}
	<div
		class="absolute m-4 w-8 h-8 left-0 bottom-0 flex flex-col items-center justify-center bg-white rounded-full border border-gray-600 opacity-70"
	>
		<a href="/license">
			<Icon icon="material-symbols:info-outline" />
		</a>
	</div>
	<div
		class="absolute mb-4 w-1/3 left-1/2 -translate-x-1/2 bottom-0 pb-1 pt-2 px-1 gap-1 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-600 bg-opacity-70"
	>
		<div class="flex flex-row justify-center items-center gap-4">
			<button class="rounded-full bg-white border p-1" onclick={gotoPrevEvent}><Icon icon="mingcute:left-fill" /></button>
			<span class="w-28 text-center font-mono"
				>{timeline_now.toLocaleDateString('en-US')}</span
			>
			<button class="rounded-full bg-white border p-1" onclick={gotoNextEvent}><Icon icon="mingcute:right-fill" /></button>
		</div>
		<div class="w-full px-2 flex flex-row justify-center items-center gap-4">
			<span class="text-center font-mono shrink-0">{timeline_min.toLocaleDateString('en-US')}</span>
			<input
				type="range"
				class="grow"
				min={0}
				max={timing_delta_max}
				bind:value={timeline_delta}
			/>
			<span class="text-center font-mono shrink-0">{timeline_max.toLocaleDateString('en-US')}</span>
		</div>
	</div>
	<div
		class={clsx('absolute w-full h-full top-0 left-0 bg-slate-300 bg-opacity-70 backdrop-blur', {
			hidden: page_error === null
		})}
	>
		{page_error}
	</div>
</div>
