function Timer({ start, end }) {
  return (
    <p>
      {end !== undefined && start !== undefined && end - start >= 0
        ? `${(end - start) / 1000}s`
        : "-"}
    </p>
  );
}

export default Timer;
