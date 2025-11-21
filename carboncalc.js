// Emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  electricity: {
    grid: 0.475, // kg CO2 per kWh (US average)
    renewable: 0.05,
    coal: 0.95,
  },
  transportation: {
    gasoline: 0.404, // kg CO2 per mile
    hybrid: 0.202,
    electric: 0.121, // varies by electricity source
  },
  diet: {
    meat: 7.19, // kg CO2 per meal
    dairy: 1.39, // kg CO2 per serving
  },
};

// National averages for comparison
const NATIONAL_AVERAGES = {
  electricity: 10500, // kWh/year
  transportation: 12000, // miles/year
  diet: {
    meat: 260, // meals/year
    dairy: 520, // servings/year
  },
};

document.getElementById("carbon-form").addEventListener("submit", function (e) {
  e.preventDefault();
  calculateFootprint();
});

function calculateFootprint() {
  // Get user inputs
  const electricityUsage = parseFloat(document.getElementById("electricity").value) * 12;
  const energySource = document.getElementById("energy-source").value;

  const carMiles = parseFloat(document.getElementById("car-miles").value) * 52;
  const carType = document.getElementById("car-type").value;

  const meatMeals = parseFloat(document.getElementById("meat-consumption").value) * 52;
  const dairyServings = parseFloat(document.getElementById("dairy-consumption").value) * 52;

  // Calculate emissions
  const electricityEmissions = electricityUsage * EMISSION_FACTORS.electricity[energySource];
  const transportEmissions = carMiles * EMISSION_FACTORS.transportation[carType];
  const dietEmissions = meatMeals * EMISSION_FACTORS.diet.meat + dairyServings * EMISSION_FACTORS.diet.dairy;

  const totalEmissions = electricityEmissions + transportEmissions + dietEmissions;

  // Prepare data for visualization
  const data = [
    { category: "Electricity", emissions: electricityEmissions },
    { category: "Transportation", emissions: transportEmissions },
    { category: "Diet", emissions: dietEmissions },
  ];

  // Display results
  visualizeData(data, totalEmissions);
  generateRecommendations({
    electricityUsage,
    energySource,
    carMiles,
    carType,
    meatMeals,
    dairyServings,
  });

  document.getElementById("results").classList.remove("hidden");
}

function visualizeData(data, total) {
  const width = 600;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  // Clear previous visualization
  d3.select("#visualization").html("");

  // Create SVG
  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Create pie chart
  const pie = d3
    .pie()
    .value((d) => d.emissions)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 20);

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.category))
    .range(["#e74c3c", "#3498db", "#2ecc71"]);

  // Add slices
  const arcs = svg.selectAll("arc").data(pie(data)).enter().append("g").attr("class", "arc");

  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.category))
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Add labels
  arcs
    .append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .text((d) => `${d.data.category}: ${Math.round(d.data.emissions)} kg`)
    .style("fill", "white")
    .style("font-size", 12);

  // Add total
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", radius + 30)
    .text(`Total Annual Emissions: ${Math.round(total)} kg CO₂`)
    .style("font-size", 16)
    .style("font-weight", "bold");
}

function generateRecommendations(inputs) {
  const recsContainer = document.getElementById("recommendations");
  recsContainer.innerHTML = "<h3>Recommendations to Reduce Your Footprint</h3>";

  // Electricity recommendations
  if (inputs.electricityUsage > NATIONAL_AVERAGES.electricity) {
    const potentialSavings = (inputs.electricityUsage - NATIONAL_AVERAGES.electricity) * EMISSION_FACTORS.electricity[inputs.energySource];

    const rec = document.createElement("div");
    rec.className = "recommendation";
    rec.innerHTML = `
            <p><strong>Reduce electricity use:</strong> You use ${Math.round(inputs.electricityUsage)} kWh/year 
            (national average: ${NATIONAL_AVERAGES.electricity}). Reducing to average could save 
            ~${Math.round(potentialSavings)} kg CO₂/year. Consider LED bulbs, smart thermostats, 
            and unplugging unused devices.</p>
        `;
    recsContainer.appendChild(rec);
  }

  // Transportation recommendations
  if (inputs.carMiles > NATIONAL_AVERAGES.transportation) {
    const potentialSavings = (inputs.carMiles - NATIONAL_AVERAGES.transportation) * EMISSION_FACTORS.transportation[inputs.carType];

    const rec = document.createElement("div");
    rec.className = "recommendation";
    rec.innerHTML = `
            <p><strong>Reduce driving:</strong> You drive ${Math.round(inputs.carMiles)} miles/year 
            (national average: ${NATIONAL_AVERAGES.transportation}). Carpooling, public transit, or 
            biking could save ~${Math.round(potentialSavings)} kg CO₂/year.</p>
        `;
    recsContainer.appendChild(rec);
  }

  // Diet recommendations
  if (inputs.meatMeals > NATIONAL_AVERAGES.diet.meat) {
    const potentialSavings = (inputs.meatMeals - NATIONAL_AVERAGES.diet.meat) * EMISSION_FACTORS.diet.meat;

    const rec = document.createElement("div");
    rec.className = "recommendation";
    rec.innerHTML = `
            <p><strong>Eat less meat:</strong> You consume ${Math.round(inputs.meatMeals)} meat meals/year 
            (national average: ${NATIONAL_AVERAGES.diet.meat}). Having 1-2 meat-free days per week 
            could save ~${Math.round(potentialSavings)} kg CO₂/year.</p>
        `;
    recsContainer.appendChild(rec);
  }
}
