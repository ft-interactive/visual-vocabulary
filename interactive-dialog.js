(() => {
  let chartInstance = null;
  let activeChart = null;

  function ensureDialog() {
    if (document.getElementById("exampleDialog")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="example-dialog" id="exampleDialog" aria-labelledby="exampleTitle">
        <div class="example-shell">
          <header class="example-header">
            <div>
              <p class="panel-kicker">Интерактивный пример</p>
              <h2 id="exampleTitle"></h2>
            </div>
            <button class="dialog-close" type="button" aria-label="Закрыть пример">×</button>
          </header>
          <p class="example-hint" id="exampleHint">Наведите указатель, выделите данные или измените масштаб. Доступные действия зависят от типа графика.</p>
          <div class="example-canvas" id="exampleCanvas" role="img"></div>
          <footer class="example-footer">
            <span>ECharts, учебные данные</span>
            <button class="secondary-button" type="button" id="shuffleExample">Изменить данные</button>
          </footer>
        </div>
      </dialog>
    `);
    const dialog = document.getElementById("exampleDialog");
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      chartInstance?.dispose();
      chartInstance = null;
    });
    document.getElementById("shuffleExample").addEventListener("click", () => {
      if (!activeChart || !chartInstance) return;
      const option = interactiveExamples.optionFor(activeChart);
      (option.series || []).forEach((series) => {
        if (!Array.isArray(series.data)) return;
        series.data = series.data.map((item) => {
          if (typeof item === "number") return Math.max(0, Math.round(item * (0.78 + Math.random() * 0.44)));
          if (Array.isArray(item)) {
            return item.map((value, index) =>
              typeof value === "number" && index > 0
                ? Math.max(0, Math.round(value * (0.82 + Math.random() * 0.36)))
                : value
            );
          }
          if (item && typeof item.value === "number") {
            return { ...item, value: Math.max(1, Math.round(item.value * (0.78 + Math.random() * 0.44))) };
          }
          return item;
        });
      });
      option.animationDurationUpdate = 450;
      chartInstance.setOption(option, true);
    });
  }

  function openExample(chart) {
    ensureDialog();
    activeChart = chart;
    const dialog = document.getElementById("exampleDialog");
    document.getElementById("exampleTitle").textContent = chart.chartName;
    dialog.showModal();
    requestAnimationFrame(() => {
      const canvas = document.getElementById("exampleCanvas");
      chartInstance = echarts.init(canvas, null, { renderer: "canvas" });
      chartInstance.setOption(interactiveExamples.optionFor(chart));
      canvas.setAttribute("aria-label", `Интерактивный пример: ${chart.chartName}`);
    });
  }

  window.addEventListener("resize", () => chartInstance?.resize());
  window.openInteractiveExample = openExample;
})();
