function Loading({ className = '' }) {
  return (
    <div id="loading" className={className}>
      <img id="loading-image" src="/src/assets/loading.gif" alt="Loading..." />
    </div>
  );
}

export default Loading;