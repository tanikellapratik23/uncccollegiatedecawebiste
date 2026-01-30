// Flight price tracking for Charlotte (CLT) → Louisville (SDF) April 17-22, 2026
(function(){
  const PRICE_STORAGE_KEY = 'deca_flight_prices';
  const UPDATE_INTERVAL = 3600000; // 1 hour
  
  // Sample flight data (realistic options)
  const sampleFlights = {
    withStops: {
      airline: 'Southwest Airlines',
      price: 189,
      stops: 1,
      duration: '5h 45m',
      departure: '7:15 AM',
      arrival: '1:00 PM (local)',
      details: '1 stop in Nashville'
    },
    nonstop: {
      airline: 'American Airlines',
      price: 256,
      stops: 0,
      duration: '2h 45m',
      departure: '8:30 AM',
      arrival: '11:15 AM (local)',
      details: 'Nonstop flight'
    }
  };
  
  // Simulated price data
  function generatePriceData(){
    const now = Date.now();
    const basePrice = 240;
    const prices = [];
    
    for(let i = 0; i < 168; i++){
      const timeOffset = now - (168 - i) * 3600000;
      const noise = Math.sin(i * 0.15) * 30 + Math.random() * 20;
      const trend = i > 80 ? (i - 80) * 0.5 : -(80 - i) * 0.3;
      const price = Math.round(basePrice + noise + trend);
      prices.push({time: timeOffset, price: Math.max(180, price)});
    }
    return prices;
  }
  
  function getPriceHistory(){
    try{
      const stored = localStorage.getItem(PRICE_STORAGE_KEY);
      if(stored){
        const data = JSON.parse(stored);
        if(Date.now() - data.lastUpdate > 86400000) return {prices: generatePriceData(), lastUpdate: Date.now()};
        return data;
      }
    }catch(e){}
    return {prices: generatePriceData(), lastUpdate: Date.now()};
  }
  
  function savePriceHistory(data){
    try{ localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(data)) }catch(e){}
  }
  
  // Render price info
  function updatePriceDisplay(){
    const data = getPriceHistory();
    const prices = data.prices.map(p => p.price);
    
    if(prices.length === 0) return;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const current = prices[prices.length - 1];
    const avg = Math.round(prices.reduce((a,b)=>a+b,0) / prices.length);
    
    // Trend: compare last 24h to previous 24h
    const last24 = prices.slice(-24);
    const prev24 = prices.slice(-48, -24);
    const last24Avg = last24.length > 0 ? Math.round(last24.reduce((a,b)=>a+b,0) / last24.length) : avg;
    const prev24Avg = prev24.length > 0 ? Math.round(prev24.reduce((a,b)=>a+b,0) / prev24.length) : avg;
    const trendDirection = last24Avg < prev24Avg ? '📉 Falling' : last24Avg > prev24Avg ? '📈 Rising' : '➡️ Stable';
    const trendColor = last24Avg < prev24Avg ? '#10b981' : last24Avg > prev24Avg ? '#ef4444' : '#6b7280';
    
    document.getElementById('currentPrice').textContent = '$' + avg;
    document.getElementById('lowestPrice').textContent = '$' + min;
    document.getElementById('highestPrice').textContent = '$' + max;
    document.getElementById('priceTrend').innerHTML = `<div style="color:${trendColor};font-size:16px;margin-top:4px">${trendDirection}</div>`;
    document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleString();
    
    // Draw chart
    drawPriceChart(prices);
  }
  
  // Simple ASCII-like chart
  function drawPriceChart(prices){
    const container = document.getElementById('priceChart');
    if(!container) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth - 20;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    
    if(!ctx) return;
    
    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#e6eef4';
    ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++){
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Min/Max price labels
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    // Draw line chart
    ctx.strokeStyle = '#0B3D91';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((price, idx) => {
      const x = (idx / (prices.length - 1)) * canvas.width;
      const y = canvas.height - ((price - min) / range) * (canvas.height - 20) - 10;
      if(idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Fill area under curve
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(11, 61, 145, 0.1)';
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('$' + max, 4, 14);
    ctx.fillText('$' + min, 4, canvas.height - 2);
    ctx.textAlign = 'right';
    ctx.fillText('7d ago', canvas.width - 4, 14);
    ctx.textAlign = 'center';
    ctx.fillText('Now', canvas.width / 2, canvas.height - 2);
    
    // Replace div with canvas
    container.innerHTML = '';
    container.appendChild(canvas);
  }
  
  // Initialize on page load
  function init(){
    updatePriceDisplay();
    // Update every hour
    setInterval(updatePriceDisplay, UPDATE_INTERVAL);
    
    // Flight details modal
    const modal = document.getElementById('flightModal');
    const btn = document.getElementById('flightDetailsBtn');
    const closeBtn = document.getElementById('closeFlightModal');
    
    if(btn) btn.addEventListener('click', function(){
      renderFlightDetails();
      modal.style.display = 'flex';
    });
    
    if(closeBtn) closeBtn.addEventListener('click', function(){ modal.style.display = 'none' });
    
    if(modal) modal.addEventListener('click', function(e){
      if(e.target === modal) modal.style.display = 'none';
    });
  }
  
  function renderFlightDetails(){
    const content = document.getElementById('flightDetailsContent');
    if(!content) return;
    
    content.innerHTML = `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;margin-bottom:8px">Cheapest with Stops</div>
        <div style="border:1px solid #e6eef4;border-radius:8px;padding:12px;background:#f7fbfd">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div>
              <div style="font-weight:600;color:#0B3D91">${sampleFlights.withStops.airline}</div>
              <div style="font-size:12px;color:#6b7280">${sampleFlights.withStops.details}</div>
            </div>
            <div style="font-size:24px;font-weight:700;color:#10b981">$${sampleFlights.withStops.price}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
            <div><strong>Depart:</strong> ${sampleFlights.withStops.departure}</div>
            <div><strong>Arrive:</strong> ${sampleFlights.withStops.arrival}</div>
            <div><strong>Duration:</strong> ${sampleFlights.withStops.duration}</div>
            <div><strong>Stops:</strong> ${sampleFlights.withStops.stops}</div>
          </div>
        </div>
      </div>
      
      <div>
        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;margin-bottom:8px">Cheapest Nonstop</div>
        <div style="border:1px solid #e6eef4;border-radius:8px;padding:12px;background:#f7fbfd">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div>
              <div style="font-weight:600;color:#0B3D91">${sampleFlights.nonstop.airline}</div>
              <div style="font-size:12px;color:#6b7280">${sampleFlights.nonstop.details}</div>
            </div>
            <div style="font-size:24px;font-weight:700;color:#2348A6">$${sampleFlights.nonstop.price}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
            <div><strong>Depart:</strong> ${sampleFlights.nonstop.departure}</div>
            <div><strong>Arrive:</strong> ${sampleFlights.nonstop.arrival}</div>
            <div><strong>Duration:</strong> ${sampleFlights.nonstop.duration}</div>
            <div><strong>Stops:</strong> ${sampleFlights.nonstop.stops}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
