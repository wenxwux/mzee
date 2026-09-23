import { knotContours } from './knot-contours.mjs?v=20260923-7';

// Fixed, uneven arms keep a hand-drawn silhouette without frame-to-frame jitter.
const arms = [
  [0.16, 46, 0.18], [0.65, 36, 0.14], [1.18, 53, 0.17],
  [1.70, 43, 0.21], [2.22, 49, 0.12], [2.69, 34, 0.19],
  [3.27, 52, 0.14], [3.71, 40, 0.23], [4.29, 47, 0.16],
  [4.78, 55, 0.13], [5.28, 38, 0.21], [5.90, 50, 0.15],
];

function tightRadius(angle) {
  const core = 16 + 1.8 * Math.sin(3 * angle + 0.4) + 0.9 * Math.sin(5 * angle);
  return arms.reduce((radius, [direction, length, width]) => {
    const distance = Math.abs(Math.atan2(Math.sin(angle - direction), Math.cos(angle - direction)));
    if (distance >= width) return radius;
    const taper = Math.cos(distance / width * Math.PI / 2) ** 1.7;
    return Math.max(radius, core + (length - core) * taper);
  }, core);
}

export function geometryPaths(openness = 0, breath = 0) {
  const amount = Math.max(0, Math.min(1, openness));
  const blend = amount * amount * (3 - 2 * amount);
  const breathing = Math.max(-1, Math.min(1, breath));
  const scale = 1 + breathing * (0.10 - 0.05 * blend);
  const outline = points => `M${points.map(p=>p.map(v=>v.toFixed(3)).join(',')).join(' L')} Z`;
  const outer = knotContours[7].map(([x,y]) => {
    const angle = Math.atan2(y,x);
    const radius = tightRadius(angle);
    return [(Math.cos(angle)*radius*(1-blend)+x*blend)*scale,(Math.sin(angle)*radius*(1-blend)+y*blend)*scale];
  });
  const holes = knotContours.slice(0,7).map((contour,index) => {
    const center = contour.reduce((sum,p)=>sum.map((v,j)=>v+p[j]/contour.length),[0,0]);
    const angle = Math.atan2(center[1],center[0]);
    return contour.map(([x,y])=> {
      if(index===3){
        const radius=Math.hypot(x,y);
        // The centre stays solid at rest; only interaction opens it.
        const aperture=radius*blend*scale;
        return [x/radius*aperture,y/radius*aperture];
      }
      // Mask apertures open together; overlapping apertures remain transparent.
      const opening=blend**2;
      return [(Math.cos(angle)*7*(1-blend)+center[0]*blend+(x-center[0])*opening)*scale,(Math.sin(angle)*7*(1-blend)+center[1]*blend+(y-center[1])*opening)*scale];
    });
  });
  return { outer:outline(outer), holes:holes.map(outline), blend };
}
