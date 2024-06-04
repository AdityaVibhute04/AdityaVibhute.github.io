function calculatePaybackPeriods(initialInvestment, annualCashInflow, discountRate, lifeSpan) {
    let cumulativeDCF = 0;
    let cumulativeDCFs = [];
    let cumulativeSimpleSavings = [];
    let years = Array.from({ length: lifeSpan }, (_, i) => i + 1);
    
    let annualDepreciation = initialInvestment / lifeSpan;
    let simplePaybackPeriod;
    let cumulativeSimple = 0;

    for (let year = 1; year <= lifeSpan; year++) {
        let depreciationValue = annualDepreciation / Math.pow(1 + discountRate, year);
        let PVannualCashInflow = annualCashInflow / Math.pow(1 + discountRate, year);
        let adjustedAnnualCashInflow = PVannualCashInflow - depreciationValue;
        let DCF = adjustedAnnualCashInflow;
        cumulativeDCF += DCF;
        cumulativeDCFs.push(cumulativeDCF);

        cumulativeSimple += annualCashInflow;
        cumulativeSimpleSavings.push(cumulativeSimple);

        if (!simplePaybackPeriod && cumulativeSimple >= initialInvestment) {
            simplePaybackPeriod = year - 1 + (initialInvestment - cumulativeSimpleSavings[year - 2]) / annualCashInflow;
        }
    }

    let discountedPaybackPeriod;
    for (let year = 0; year < lifeSpan; year++) {
        if (cumulativeDCFs[year] >= initialInvestment) {
            let previousCumulativeDCF = year > 0 ? cumulativeDCFs[year - 1] : 0;
            let remainingAmount = initialInvestment - previousCumulativeDCF;
            let currentYearDCF = cumulativeDCFs[year] - previousCumulativeDCF;
            let fractionOfYear = remainingAmount / currentYearDCF;
            discountedPaybackPeriod = year + fractionOfYear;
            break;
        }
    }

    if (cumulativeDCF < initialInvestment) {
        discountedPaybackPeriod = "The investment is not paid back within the given period.";
    }

    if (cumulativeSimple < initialInvestment) {
        simplePaybackPeriod = "The investment is not paid back within the given period.";
    }

    return {
        discountedPeriod: discountedPaybackPeriod,
        simplePeriod: simplePaybackPeriod,
        cumulativeDCFs: cumulativeDCFs,
        cumulativeSimpleSavings: cumulativeSimpleSavings,
        years: years
    };
}

document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let solarWattage = parseFloat(document.getElementById('solarWattage').value);
    let peakRate = parseFloat(document.getElementById('peakRate').value);
    let peakTimeDuration = parseFloat(document.getElementById('peakTimeDuration').value);
    let normalRate = parseFloat(document.getElementById('normalRate').value);
    let normalTimeDuration = parseFloat(document.getElementById('normalTimeDuration').value);
    let lifeSpan = parseFloat(document.getElementById('lifeSpan').value);
    let discountRate = parseFloat(document.getElementById('discountRate').value) / 100;

    let initialInvestment = 54 * solarWattage;
    let annualCashInflow = (peakRate * peakTimeDuration + normalRate * normalTimeDuration) * solarWattage * 365 * 0.001;
    

    let result = calculatePaybackPeriods(initialInvestment, annualCashInflow, discountRate, lifeSpan);
    let discountedPaybackPeriod = result.discountedPeriod;
    let simplePaybackPeriod = result.simplePeriod;

    document.getElementById('result').innerText = `Discounted Payback Period: ${typeof discountedPaybackPeriod === 'number' ? discountedPaybackPeriod.toFixed(2) + " years" : discountedPaybackPeriod}\nSimple Payback Period: ${typeof simplePaybackPeriod === 'number' ? simplePaybackPeriod.toFixed(2) + " years" : simplePaybackPeriod}`;

    // Plotly graph
    var trace1 = {
        x: result.years,
        y: result.cumulativeDCFs,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cumulative Discounted Cash Flows',
        line: { shape: 'linear' }
    };

    var trace2 = {
        x: [0, lifeSpan],
        y: [initialInvestment, initialInvestment],
        type: 'line',
        name: 'Initial Investment',
        line: {
            color: 'red',
            dash: 'dash'
        }
    };

    var trace3 = {
        x: result.years,
        y: result.cumulativeSimpleSavings,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cumulative Simple Savings',
        line: { shape: 'linear', color: 'green' }
    };

    var layout = {
        title: 'Cumulative Cash Flows over Time',
        xaxis: {
            title: 'Time (Years)',
            dtick: 1
        },
        yaxis: {
            title: 'Cumulative Cash Flows (INR)'
        }
    };

    var data = [trace1, trace2, trace3];

    Plotly.newPlot('plot', data, layout);
});
