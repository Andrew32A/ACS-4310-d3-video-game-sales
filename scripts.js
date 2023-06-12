const paper = document.getElementById("paper"),
  pen = paper.getContext("2d");

const get = (selector) => document.querySelector(selector);

const toggles = {
  sound: get("#sound-toggle"),
};

const colors = [
  "#D0E7F5",
  "#D9E7F4",
  "#D6E3F4",
  "#BCDFF5",
  "#B7D9F4",
  "#C3D4F0",
  "#9DC1F3",
  "#9AA9F4",
  "#8D83EF",
  "#AE69F0",
  "#D46FF1",
  "#DB5AE7",
  "#D911DA",
  "#D601CB",
  "#E713BF",
  "#F24CAE",
  "#FB79AB",
  "#FFB6C1",
  "#FED2CF",
  "#FDDFD5",
  "#FEDCD1",
];

const settings = {
  startTime: new Date().getTime(),
  duration: 900,
  maxCycles: Math.max(colors.length, 100),
  soundEnabled: false,
  pulseEnabled: true,
  instrument: "piano",
};

const handleSoundToggle = (enabled = !settings.soundEnabled) => {
  settings.soundEnabled = enabled;
  toggles.sound.dataset.toggled = enabled;
};

document.onvisibilitychange = () => handleSoundToggle(false);

paper.onclick = () => handleSoundToggle();

const getFileName = (index) => {
  if (settings.instrument === "default") return `key-${index}`;

  return `${settings.instrument}-key-${index}`;
};

const getUrl = (index) => `notes/${getFileName(index)}.mp3`;

const keys = colors.map((color, index) => {
  const audio = new Audio(getUrl(index));

  audio.volume = 0.15;

  return audio;
});

let arcs = [];

const calculateVelocity = (index) => {
  const numberOfCycles = settings.maxCycles - index,
    distancePerCycle = 2 * Math.PI;

  return (numberOfCycles * distancePerCycle) / settings.duration;
};

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
};

const calculateDynamicOpacity = (
  currentTime,
  lastImpactTime,
  baseOpacity,
  maxOpacity,
  duration
) => {
  const timeSinceImpact = currentTime - lastImpactTime,
    percentage = Math.min(timeSinceImpact / duration, 1),
    opacityDelta = maxOpacity - baseOpacity;

  return maxOpacity - opacityDelta * percentage;
};

const determineOpacity = (
  currentTime,
  lastImpactTime,
  baseOpacity,
  maxOpacity,
  duration
) => {
  if (!settings.pulseEnabled) return baseOpacity;

  return calculateDynamicOpacity(
    currentTime,
    lastImpactTime,
    baseOpacity,
    maxOpacity,
    duration
  );
};

const calculatePositionOnArc = (center, radius, angle) => ({
  x: center.x + radius * Math.cos(angle),
  y: center.y + radius * Math.sin(angle),
});

const playKey = (index) => keys[index].play();

const init = (data) => {
  pen.lineCap = "round";

  arcs = data.map((entry, index) => {
    const salesValue = entry.Global_Sales;
    const radius = salesValue * 0.5; // Adjust the scaling factor to fit the sales data

    const velocity = calculateVelocity(index),
      lastImpactTime = 0,
      nextImpactTime = calculateNextImpactTime(settings.startTime, velocity);

    return {
      color: colors[index % colors.length], // Use colors in a repeating pattern
      velocity,
      lastImpactTime,
      nextImpactTime,
      radius,
    };
  });
};

const drawArc = (x, y, radius, start, end, action = "stroke") => {
  pen.beginPath();

  pen.arc(x, y, radius, start, end);

  if (action === "stroke") pen.stroke();
  else pen.fill();
};

const drawPointOnArc = (center, arcRadius, pointRadius, angle) => {
  const position = calculatePositionOnArc(center, arcRadius, angle);

  drawArc(position.x, position.y, pointRadius, 0, 2 * Math.PI, "fill");
};

const draw = () => {
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;

  const currentTime = new Date().getTime(),
    elapsedTime = (currentTime - settings.startTime) / 1000;

  const length = Math.min(paper.width, paper.height) * 0.9,
    offset = (paper.width - length) / 2;

  const start = {
    x: offset,
    y: paper.height / 2,
  };

  const end = {
    x: paper.width - offset,
    y: paper.height / 2,
  };

  const center = {
    x: paper.width / 2,
    y: paper.height / 2,
  };

  const base = {
    length: end.x - start.x,
    minAngle: 0,
    startAngle: 0,
    maxAngle: 2 * Math.PI,
  };

  base.initialRadius = base.length * 0.05;
  base.circleRadius = base.length * 0.006;
  base.clearance = base.length * 0.03;
  base.spacing =
    (base.length - base.initialRadius - base.clearance) / 2 / arcs.length;

  arcs.forEach((arc, index) => {
    // Draw arcs
    pen.globalAlpha = determineOpacity(
      currentTime,
      arc.lastImpactTime,
      0.15,
      0.65,
      1000
    );
    pen.lineWidth = base.length * 0.002;
    pen.strokeStyle = arc.color;

    const offset = (base.circleRadius * (5 / 3)) / arc.radius;

    drawArc(
      center.x,
      center.y,
      arc.radius,
      Math.PI + offset,
      2 * Math.PI - offset
    );

    drawArc(center.x, center.y, arc.radius, offset, Math.PI - offset);

    // Draw impact points
    pen.globalAlpha = determineOpacity(
      currentTime,
      arc.lastImpactTime,
      0.15,
      0.85,
      1000
    );
    pen.fillStyle = arc.color;

    drawPointOnArc(center, arc.radius, base.circleRadius * 0.75, Math.PI);

    drawPointOnArc(center, arc.radius, base.circleRadius * 0.75, 2 * Math.PI);

    // Draw moving circles
    pen.globalAlpha = 1;
    pen.fillStyle = arc.color;

    if (currentTime >= arc.nextImpactTime) {
      if (settings.soundEnabled) {
        playKey(index);
        arc.lastImpactTime = arc.nextImpactTime;
      }

      arc.nextImpactTime = calculateNextImpactTime(
        arc.nextImpactTime,
        arc.velocity
      );
    }

    const distance = elapsedTime >= 0 ? elapsedTime * arc.velocity : 0,
      angle = (Math.PI + distance) % base.maxAngle;

    drawPointOnArc(center, arc.radius, base.circleRadius, angle);
  });

  requestAnimationFrame(draw);
};

// Parse the CSV data
const csvData = `Year,Global_Sales
2000,50
2001,60
2002,70
2003,80
2004,90
2005,100
2006,110
2007,120
2008,130
2009,140
2010,150
2011,160
2012,170
2013,180
2014,190
2015,200
2016,210
2017,220
2018,230
2019,240
2020,250`;

const parseCSV = (csv) => {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(",");
    const entry = {};

    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = currentLine[j];
    }

    data.push(entry);
  }

  return data;
};

const salesData = parseCSV(csvData);
init(salesData);

draw();
