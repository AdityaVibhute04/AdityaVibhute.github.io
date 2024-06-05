document.addEventListener('DOMContentLoaded', function () {
    const caseSelector = document.getElementById('caseSelector');
    const inputForm = document.getElementById('inputForm');
    const commonInputs = document.getElementById('commonInputs');
    const caseBInput = document.getElementById('caseBInput');
    const plotDiv = document.getElementById('plot');
    const resultDiv = document.getElementById('result');


    caseSelector.addEventListener('change', function () {
        toggleCaseInputs(caseSelector.value);
    });
});

inputForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const selectedCase = caseSelector.value;

    const peakRate = parseFloat(document.getElementById('peakRate').value);
    const peakLoad = parseFloat(document.getElementById('peakLoad').value);
    const peakTimeDurationDay = parseFloat(document.getElementById('peakTimeDurationDay').value);
    const peakTimeDurationNight = parseFloat(document.getElementById('peakTimeDurationNight').value);
    const normalRate = parseFloat(document.getElementById('normalRate').value);
    const normalLoad = parseFloat(document.getElementById('normalLoad').value);
    const normalTimeDuration = parseFloat(document.getElementById('normalTimeDuration').value);
    const epsilon = parseFloat(document.getElementById('epsilon').value);
    const lifeSpan = parseFloat(document.getElementById('lifeSpan').value);
    const discountRate = parseFloat(document.getElementById('discountRate').value);

    if (selectedCase === 'A') {
        let resultA = calculatePaybackPeriodCaseA({
            peakRate, peakLoad, peakTimeDurationDay, peakTimeDurationNight, normalRate, normalLoad, normalTimeDuration, epsilon, lifeSpan, discountRate
        });
        let discountedPaybackPeriod = result.discountedPeriod;
        let simplePaybackPeriod = result.simplePeriod;
        document.getElementById('result').innerText = `Discounted Payback Period: ${typeof discountedPaybackPeriod === 'number' ? discountedPaybackPeriod.toFixed(2) + " years" : discountedPaybackPeriod}\nSimple Payback Period: ${typeof simplePaybackPeriod === 'number' ? simplePaybackPeriod.toFixed(2) + " years" : simplePaybackPeriod}`;
        document.getElementById('solarWattage').innerText = `Solar Wattage required: ${typeof solarWattage === 'number' ? solarWattage.toFixed(2) + " Watts" : solarWattage}`;
        var trace1 = {
            x: resultA.years,
            y: resultA.cumulativeDCFs,
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
            x: resultA.years,
            y: resultA.cumulativeSimpleSavings,
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
    }
    else if (selectedCase === 'B') {
        const extraInput = parseFloat(document.getElementById('extraInput').value);
        const result = calculatePaybackPeriods({
            peakRate, peakLoad, peakTimeDurationDay, peakTimeDurationNight, normalRate, normalLoad, normalTimeDuration, epsilon, lifeSpan, discountRate, extraInput
        });
        plotResult(result);
    } else if (selectedCase === 'C') {
        placeholderFunction();
    }
});


function calculatePaybackPeriodCaseA(peakRate, peakLoad, peakTimeDurationDay, peakTimeDurationNight, normalRate, normalLoad, normalTimeDuration, epsilon, lifeSpan, discountRate){

    let Eload = peakLoad * peakTimeDurationDay + peakLoad * peakTimeDurationNight + normalLoad * normalTimeDuration;
    let solarWattage = epsilon * Eload * 1000 / 5;
    let initialInvestment = 54 * solarWattage;
    let annualCashInflow = (peakRate * peakTimeDurationDay + normalRate * normalTimeDuration) * solarWattage * 365 * 0.001;

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


    
