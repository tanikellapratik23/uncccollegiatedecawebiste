// Flight price tracking - Charlotte (CLT) → Louisville (SDF)
(function(){
  console.log('flights.js loaded');
  
  const PRICE_STORAGE_KEY = 'deca_flight_prices';
  
  const flightData = {
    cheapest: { price: 328, airline: 'Southwest', stops: 1, duration: '5h 25m', depart: '6:15 AM', arrive: '11:40 AM', detail: '1 stop BNA' },
    nonstop: { price: 380, airline: 'American', stops: 0, duration: '1h 30m', depart: '7:08 AM', arrive: '8:38 AM', detail: 'Nonstop' }
  };
  
  function generatePrices(){
    const prices = [];
    const base = 354;
    for(let i = 0; i < 168; i++){
      const p = base + Math.sin(i * 0.15) * 20 + Math.random() * 15 - (i > 80 ? (i-80)*0.2 : 0);
      prices.push(Math.max(320, Math.min(420, Math.round(p))));
    }
    return prices;
  }
  
  function getPrices(){
    try{
      const stored = localStorage.getItem(PRICE_STORAGE_KEY);
      if(stored && Date.now() - JSON.parse(stored).time < 86400000) return JSON.parse(stored).prices;
    }catch(e){}
    const prices = generatePrices();
    try{ localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify({prices, time: Date.now()})); }catch(e){}
    return prices;
  }
  
  function updateDisplay(){
    console.log('updateDisplay called');
    const prices = getPrices();
    console.log('prices:', prices ? prices.length + ' items' : 'none');
    
    if(!prices || prices.length === 0) {
      console.log('No prices, returning');
      return;
    }
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a,b)=>a+b) / prices.length);
    
    console.log('min:', min, 'max:', max, 'avg:', avg);
    
    const el = (id) => {
      const element = document.getElementById(id);
      console.log('el(' + id + '):', element ? 'found' : 'NOT FOUND');
      return element;
    };
    
    if(el('currentPrice')) el('currentPrice').textContent = '$' + avg;
    if(el('lowestPrice')) el('lowestPrice').textContent = '$' + min;
    if(el('highestPrice')) el('highestPrice').textContent = '$' + max;
    if(el('lastUpdate')) el('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleString();
    
    const last = prices.slice(-24).reduce((a,b)=>a+b)/24;
    const prev = prices.slice(-48,-24).reduce((a,b)=>a+b)/24;
    let trend = '➡️ Stable', color = '#6b7280';
    if(last < prev){ trend = '📉 Falling'; color = '#10b981'; }
    else if(last > prev){ trend = '📈 Rising'; color = '#ef4444'; }
    if(el('priceTrend')) el('priceTrend').innerHTML = `<div style="color:${color};font-size:16px">${trend}</div>`;
    
    drawChart(prices);
  }
  
  function drawChart(prices){
    const container = document.getElementById('priceChart');
    if(!container || prices.length < 2) {
      console.log('drawChart: container or prices missing');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(200, container.offsetWidth - 20);
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = '#e6eef4';
    ctx.lineWidth = 1;
    for(let i=0;i<=4;i++){
      const y = canvas.height/4*i;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();
    }
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = Math.max(max-min,1);
    
    ctx.strokeStyle = '#0B3D91';
    ctx.lineWidth = 2;
    ctx.beginPath();
    prices.forEach((p,i)=>{
      const x = i/(prices.length-1)*canvas.width;
      const y = canvas.height - (p-min)/range*(canvas.height-20) - 10;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.lineTo(canvas.width,canvas.height);ctx.lineTo(0,canvas.height);ctx.closePath();
    ctx.fillStyle = 'rgba(11,61,145,0.1)';ctx.fill();
    
    ctx.fillStyle = '#6b7280';ctx.font='11px Arial';
    ctx.textAlign='left';ctx.fillText('$'+max,4,14);ctx.fillText('$'+min,4,canvas.height-2);
    ctx.textAlign='right';ctx.fillText('7d ago',canvas.width-4,14);
    ctx.textAlign='center';ctx.fillText('Now',canvas.width/2,canvas.height-2);
    
    container.innerHTML='';container.appendChild(canvas);
  }
  
  function showDetails(){
    const modal = document.getElementById('flightModal');
    const content = document.getElementById('flightDetailsContent');
    if(!modal || !content) return;
    
    content.innerHTML = `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;margin-bottom:8px">Cheapest with Stops</div>
        <div style="border:1px solid #e6eef4;border-radius:8px;padding:12px;background:#f7fbfd">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div><div style="font-weight:600;color:#0B3D91">${flightData.cheapest.airline}</div>
            <div style="font-size:12px;color:#6b7280">${flightData.cheapest.detail}</div></div>
            <div style="font-size:24px;font-weight:700;color:#10b981">$${flightData.cheapest.price}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
            <div><strong>Depart:</strong> ${flightData.cheapest.depart}</div>
            <div><strong>Arrive:</strong> ${flightData.cheapest.arrive}</div>
            <div><strong>Duration:</strong> ${flightData.cheapest.duration}</div>
            <div><strong>Stops:</strong> ${flightData.cheapest.stops}</div>
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;margin-bottom:8px">Cheapest Nonstop</div>
        <div style="border:1px solid #e6eef4;border-radius:8px;padding:12px;background:#f7fbfd">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div><div style="font-weight:600;color:#0B3D91">${flightData.nonstop.airline}</div>
            <div style="font-size:12px;color:#6b7280">${flightData.nonstop.detail}</div></div>
            <div style="font-size:24px;font-weight:700;color:#2348A6">$${flightData.nonstop.price}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
            <div><strong>Depart:</strong> ${flightData.nonstop.depart}</div>
            <div><strong>Arrive:</strong> ${flightData.nonstop.arrive}</div>
            <div><strong>Duration:</strong> ${flightData.nonstop.duration}</div>
            <div><strong>Stops:</strong> ${flightData.nonstop.stops}</div>
          </div>
        </div>
      </div>
    `;
    modal.style.display='flex';
  }
  
  function init(){
    console.log('init() called, DOM ready state:', document.readyState);
    updateDisplay();
    setInterval(updateDisplay, 3600000);
    
    const btn = document.getElementById('flightDetailsBtn');
    const modal = document.getElementById('flightModal');
    const close = document.getElementById('closeFlightModal');
    
    console.log('button:', btn ? 'found' : 'NOT FOUND');
    console.log('modal:', modal ? 'found' : 'NOT FOUND');
    
    if(btn) btn.addEventListener('click', showDetails);
    if(close) close.addEventListener('click', () => { if(modal) modal.style.display='none'; });
    if(modal) modal.addEventListener('click', (e) => { if(e.target===modal) modal.style.display='none'; });
  }
  
  console.log('setting up init, readyState:', document.readyState);
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();

  
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
