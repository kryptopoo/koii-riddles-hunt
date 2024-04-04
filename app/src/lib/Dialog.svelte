<script>
  export let dialog;
</script>

<dialog bind:this={dialog} on:close>
  <slot />
</dialog>

<style>
  /* dialog {
    margin: 0;
    background-color: transparent;
    position: absolute;
    left: 50%;
    border: 1;
  } */
</style>
