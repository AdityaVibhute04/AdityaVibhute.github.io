function drawPlot() {
    const solarWattage = document.getElementById('solarWattage').value;
    const peakRate = document.getElementById('peakRate').value;
    const peakTime = document.getElementById('peakTimeDuration').value;
    const normalRate = document.getElementById('normalRate').value;
    const normalTime = document.getElementById('normalTimeDuration').value;
    const interestRate = document.getElementById('interestRatae').value;
    const lifeSpan = document.getElementById('lifeSpan').value;
  
  //Calaulated values
    const initialInvestment = 54 * solarWattage * power((1+interestRate),lifeSpan) * 0.01;
    const savingsFirstYear = (peakTime*peakRate + normalTime*normalRate)*solarWattage*365/1000
    const savings = [];
    const time = [];
    
  
    for (let i=1; i<=25; i++){
      time.push(i);
      const currentValue = i * savingsFirstYear;
      savings.push(i * savingsFirstYear);
      }
  
    const trace1 = {
        x: [0, ...time],
        y: [initialInvestment, ...Array(25).fill(initialInvestment)],
        mode: 'lines',
        name: 'Initial invetment',
        type: 'scatter'
    };

    const trace2 = {
        x: time,
        y: savings,
      mode: 'markers+lines',
      name: 'Savings',
      type: 'scatter'
    };

    const layout = {
      title: 'SPP plot',
      xaxis: {
        title: 'Time (Years)'
      },
      yaxis: {
        title: 'Money (Rupees)'
      }
    };
  
    const data = [trace1,trace2]

    Plotly.newPlot('plot', data, layout);
}


    

