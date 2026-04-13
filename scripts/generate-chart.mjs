import { readFileSync, writeFileSync } from "fs";

const csv = readFileSync("reports/results.csv", "utf8");
const lines = csv.trim().split("\n");
const headers = lines[0].split(",");

const metricIdx = headers.indexOf("metric_name");
const tsIdx = headers.indexOf("timestamp");
const valueIdx = headers.indexOf("metric_value");

const vusBySecond = {};
const reqsBySecond = {};

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(",");
  const metric = cols[metricIdx];
  const ts = cols[tsIdx];
  const value = parseFloat(cols[valueIdx]);

  if (metric === "vus") {
    vusBySecond[ts] = value;
  } else if (metric === "http_reqs") {
    reqsBySecond[ts] = (reqsBySecond[ts] || 0) + 1;
  }
}

const allTs = [
  ...new Set([...Object.keys(vusBySecond), ...Object.keys(reqsBySecond)]),
].sort((a, b) => Number(a) - Number(b));

const labels = allTs.map((ts) => {
  const d = new Date(Number(ts) * 1000);
  return d.toTimeString().slice(0, 8);
});

const vusData = allTs.map((ts) => vusBySecond[ts] ?? null);
const reqsData = allTs.map((ts) => reqsBySecond[ts] ?? null);

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>K6 Load Test - VUs vs http_reqs</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    body { font-family: sans-serif; background: #f9f9f3; padding: 24px; }
    h2 { color: #333; }
    .chart-container { max-width: 900px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <h2>VUs vs http_reqs/s</h2>
  <div class="chart-container">
    <canvas id="chart"></canvas>
  </div>
  <script>
    new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
          {
            label: "vus",
            data: ${JSON.stringify(vusData)},
            borderColor: "#4caf50",
            backgroundColor: "rgba(76,175,80,0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: "yVus",
          },
          {
            label: "http_reqs",
            data: ${JSON.stringify(reqsData)},
            borderColor: "#1e88e5",
            backgroundColor: "rgba(30,136,229,0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: "yReqs",
          },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const suffix = ctx.dataset.yAxisID === "yReqs" ? "/s" : "";
                return \` \${ctx.dataset.label}: \${ctx.parsed.y}\${suffix}\`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 10, maxRotation: 0 },
          },
          yVus: {
            type: "linear",
            position: "left",
            title: { display: true, text: "VUs" },
            beginAtZero: true,
          },
          yReqs: {
            type: "linear",
            position: "right",
            title: { display: true, text: "http_reqs/s" },
            beginAtZero: true,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  </script>
</body>
</html>`;

writeFileSync("reports/chart.html", html);
console.log("Chart generated: reports/chart.html");
