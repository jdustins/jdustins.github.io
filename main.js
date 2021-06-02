let myChart;

const apiCalls = {
  "mlb": {
    name: "mlb.topps",
    pages: 7,
    chartName: "MLB"
  },
  "godzilla": {
    name: "gdz.topps",
    pages: 2,
    chartName: "Godzilla"
  },
  "budfarm": {
    name: "budfarm.leaf",
    pages: 2,
    chartName: "Budfarm"
  },
  "bitverse": {
    name: "bitverse",
    pages: 2,
    chartName: "Bitverse"
  },
  "robotech": {
    name: "robotech",
    pages: 5,
    chartName: "Robotech"
  }
};

const getCards = async (api) => {
  const apiUrls = [];
  //const apiUrls = [];
  for (let i = 1; i <= api.pages; i++) {
    apiUrls.push(fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=premint.nft&collection_name=${api.name}&schema_name=series1&page=${i}&limit=1000&order=asc&sort=template_mint`))
  } 
  const response = await Promise.all(apiUrls);
  const resData = await Promise.all(response.map((res) => res.json())); 
  const data = resData.map((data) => data.data);
  const allData = data.flat();
  const cards = Array.from({
      length: 26
    },
    () => new Set(),
  );

  for (const obj of allData) {
    if (obj.template_mint > 25 || obj.template_mint <= 0) continue;
    cards[obj.template_mint].add(obj.template.template_id)
  }
  document.querySelector("#loading-spinner").style.display = 'none';
  return cards.map(cardSet => [...cardSet.values()])
}
async function drawChart(apiObject) {

  const cards = await getCards(apiObject);
  cards.shift();
  const labelArray = [];
  for (let i = 1; i <= 25; i++) {
    labelArray.push('#' + i + '\'' + 's');
  }
  const ctx = document.getElementById('myChart').getContext('2d');
  Chart.defaults.font.size = 16;
  Chart.defaults.color = 'rgba(255,255,255,.55)';
  Chart.defaults.scale.grid.display = false;
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labelArray,
      datasets: [{
        label: 'Number of Cards left',
        data: cards.map(counts => counts.length),
        backgroundColor: '#143A51',
        hoverBackgroundColor: '#0B1F3A',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      events: ['mousemove', 'mouseout', 'click'],
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Top 25 mint numbers left in the ${apiObject.chartName} premint pool`,
          font: {
            size: 30
          },
          padding: {
            top: 50,
            bottom: 25
          }
        }
      }
    }
  });
}

document.querySelector(".navbar-nav").addEventListener('click', e => {
  if (e.target.tagName !== "BUTTON" && e.target.tagName !== "IMG") return;
  if(myChart) myChart.destroy();
  document.querySelector("#loading-spinner").style.display = 'block';
  drawChart(apiCalls[e.target.closest("li").dataset.api]);
  let el = document.getElementById('navbarNav');
  el.classList.remove('show')
});


drawChart(apiCalls.mlb);
