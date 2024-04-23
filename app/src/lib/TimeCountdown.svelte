<script lang="ts">
  export let startTime: number;

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let timeleft = 0;
  let now = new Date().getTime();

  const countDown = function (toTime: number) {
    now = new Date().getTime();
    timeleft = toTime - now;

    days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

    days = days > 0 ? days : 0;
    hours = hours > 0 ? hours : 0;
    minutes = minutes > 0 ? minutes : 0;
    seconds = seconds > 0 ? seconds : 0;
  };

  setInterval(() => countDown(startTime), 1000);
</script>

<div style="opacity: 0.8;">
  Starts in {days}d : {hours}h : {minutes}m : {seconds}s
</div>
