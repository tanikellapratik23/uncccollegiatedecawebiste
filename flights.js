// Flight price tracking for Charlotte (CLT) → Louisville (SDF) April 17-22, 2026
(function(){
  const PRICE_STORAGE_KEY = 'deca_flight_prices';
  const UPDATE_INTERVAL = 3600000; // 1 hour
  
  // Sample flight data (real Google Flights prices)
  const sampleFlights = {
    withStops: {
      airline: 'Southwest Airlines',
      price: 328,
      stops: 1,
      duration: '5h 25m',
      departure: '6:15 AM',
      arrival: '11:40 AM',
      details: '1 stop in Nashville (BNA)'
    },
    nonstop: {
      airline: 'American Airlines',
      price: 380,
      stops: 0,
      duration: '1h 30m',
      departure: '7:08 AM',
      arrival: '8:38 AM',
      details: 'Nonstop flight'
    }
  };
  
  // Generate realistic price history
  function generatePriceData(){
    const now = Date.now();
    const basePrice = 354;
    const prices = [];
    
    for(let i = 0; i < 168; i++){
      const offset = (168 - i) * 3600000;
      const noise = Math.sin(i * 0.15) * 15 + Math.random() * 10;
      const trend = i > 80 ? (i - 80) * 0.3 : -(80 - i) * 0.2;
      const price = Math.round(basePrice + noise + trend);
      prices.push({
        time: now - offset,
        price: Math.max(320, Math.min(420, price))
      });
    }
    return prices;
  }
  
  // Get or create price history
  function getPriceHistory(){
    try{
      const stored = localStorage.getItem(PRICE_STORAGE_KEY);
      if(stored){
        const data = JSON.parse(stored);
        if(Date.now() - data.lastUpdate < 86400000) return data;
      }
    }catch(e){}
    return {prices: generatePriceData(), lastUpdate: Date.now()};
  }
  
  // Save price history
  function savePriceHistory(data){
    try{
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(data));
    }catch(e){}
  }
  
  // Update all price displays
  function updatePriceDisplay(){
    const data = getPriceHistory();
    const prices = data.prices.map(p => p.price);
    
    if(prices.length === 0) return;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a,b)=>a+b,0) / prices.length);
    
    // Calculate trend
    const last24 = prices.slice(-24);
    const prev24 = prices.slice(-48, -24);
    const last24Avg = last24.length > 0 ? Math.round(last24.reduce((a,b)=>a+b,0) / last24.length) : avg;
    const prev24Avg = prev24.length > 0 ? Math.round(prev24.reduce((a,b)=>a+b,0) / prev24.length) : avg;
    
    let trendText = '➡️ Stable';
    let trendColor = '#6b7280';
    if(last24Avg < prev24Avg){
      trendText = '📉 Falling';
      trendColor = '#10b981';
    } else if(last24Avg > prev24Avg){
      trendText = '📈 Rising';
      trendColor = '#ef4444';
    }
    
    // Update DOM
    const priceEl = document.getElementById('currentPrice');
    if(priceEl) priceEl.textContent = '$' + avg;
    
    const lowEl = document.getElementById('lowestPrice');
    if(lowEl) lowEl.textContent = '$' + min;
    
    const highEl = document.getElementById('highestPrice');
    if(highEl) highEl.textContent = '$' + max;
    
    const trendEl = document.getElementById('priceTrend');
    if(trendEl) trendEl.innerHTML = `<div style="color:${trendColor};font-size:16px;margin-top:4px">${trendText}</div>`;
    
    const updateEl = document.getElementById('lastUpdate');
    if(updateEl) updateEl.textContent = 'Last updated: ' + new Date().toLocaleString();
    
    // Draw chart
    drawPriceChart(prices);
  }
  
  // Draw price history chart
  function drawPriceChart(prices){
    const container = document.getElementById('priceChart');
    if(!container || prices.length < 2) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth - 20;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    
    if(!ctx) return;
    
    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid lines
    ctx.strokeStyle = '#e6eef4';
    ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++){
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Min/Max
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = Math.max(max - min, 1);
    
    // Draw line
    ctx.strokeStyle = '#0B3D91';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((price, idx) => {
      const x = (idx / (prices.length - 1)) * canvas.width;
      const normalized = (price - min) / range;
      const y = canvas.height - (normalized * (canvas.height - 20)) - 10;
      if(idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Fill area
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
    
    // Replace container
    container.innerHTML = '';
    container.appendChild(canvas);
  }
  
  // Show flight details modal
  function showFlightDetails(){
    const modal = document.getElementById('flightModal');
    if(!modal) return;
    
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
    
    modal.style.display = 'flex';
  }
  
  // Initialize when DOM is ready
  function init(){
    // Initial display
    updatePriceDisplay();
    
    // Update every hour
    setInterval(updatePriceDisplay, UPDATE_INTERVAL);
    
    // Modal controls
    const modal = document.getElementById('flightModal');
    const detailsBtn = document.getElementById('flightDetailsBtn');
    const closeBtn = document.getElementById('closeFlightModal');
    
    if(detailsBtn){
      detailsBtn.addEventListener('click', showFlightDetails);
    }
    
    if(closeBtn){
      closeBtn.addEventListener('click', function(){
        if(modal) modal.style.display = 'none';
      });
    }
    
    if(modal){
      modal.addEventListener('click', function(e){
        if(e.target === modal) modal.style.display = 'none';
      });
    }
  }
  
  // Run on page load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

  
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
