import * as Plot from "@observablehq/plot";
import * as d3 from 'd3';
//import {addTooltips} from "@mkfreeman/plot-tooltip"


interface Investment {
  disclosure_year: string;
  disclosure_date: string;
  transaction_date: string;
  owner: string;
  ticker: string;
  asset_description: string;
  type: string;
  amount: string;
  representative: string;
  district: string;
  state: string;
  ptr_link: string;
  cap_gains_over_200_usd: string;
  industry: string;
  sector: string;
  party: string;

}



function getPartyFrequency(data: Investment[]): { party: string; count: number }[] {
  const partyCounts = d3.rollup(
    data,
    v => v.length,
    d => d.party
  );

  const partyData = Array.from(partyCounts, ([party, count]) => ({ party, count }));

  return partyData;
}

function getPartysectorData(data: Investment[]): { party: string; sector: string; count: number }[] {
  const partysectorCounts = d3.rollup(
    data,
    v => v.length,
    d => [d.party, d.sector]
  );

  const partysectorData = Array.from(partysectorCounts, ([[party, sector], count]) => ({ party, sector, count }));

  return partysectorData;
}


async function main(): Promise<void> {
  const investments: Array<Investment> = await d3.csv("data/investments.csv");

  const partyFrequency = getPartyFrequency(investments);

  const barChart = Plot.plot({
    title: "Investment Volume by Party",
    color: {  domain: ["Democrat", "Republican"], range: ["blue", "red"] , legend: true },
    height: 240,
    y: {
      label: "Party",
    },
    x: {
      label: "# of Investments",
    },
    marginLeft: 100,
    marks: [
      Plot.barX(partyFrequency, {
        x: "count",
        y: "party",
        fill: "party",
        tip: true,
        sort: { x: "-y" },
      }),
      Plot.ruleX([0]),
    ],
  });

  document.querySelector("#investmentFreq")?.append(barChart);

  const partysectorData = getPartysectorData(investments);


  const sectorParty = Plot.plot({
    title: "Transactions within Sectors",
    label: null,
    x: {
      axis: "top",
      label: "Number of Transactions in Different Sectors",
      labelAnchor: "center",
      percent: true
    },
    color: {
      scheme: "PiYG",
      type: "ordinal"
    },
    marginLeft: 150,
    marks: [
      Plot.barX(partysectorData, {
        x: "count",
        y: "sector",
        fill: (d) => d.value > 0,
        sort: { y: "-x" }
      }),
      Plot.ruleX([0])
    ]
  });
  


  document.querySelector("#sectorParty")?.append(sectorParty);



  const dateData = investments.map(d => {
    const dateObject = new Date(d.transaction_date);
    return { ...d, month: dateObject.getUTCMonth() + 1 };
  });

  


  function getMonthFromDate(dateString: string) {
    const dateObject = new Date(dateString);
    return dateObject.getUTCMonth() + 1;
  }
  
  function getMonthSectorCount(data: Investment[]) {
    const monthSectorCounts = d3.rollup(
      data,
      v => v.length,
      d => [getMonthFromDate(d.transaction_date), d.sector]
    );
  
    const monthSectorData = Array.from(monthSectorCounts, ([[month, sector], count]) => ({ month, sector, count }));
  
    return monthSectorData;
  }
  
  const monthSectorCounts = getMonthSectorCount(investments);
  console.log(monthSectorCounts);



  
  const heatMap = Plot.auto(monthSectorCounts, {x: "month", y: "sector", color:"count"}).plot({color: {legend:true},marginLeft: 150})
  

  
  document.querySelector("#heat")?.append(heatMap);

}

window.addEventListener("DOMContentLoaded", async (_evt) => {
  await main();
});