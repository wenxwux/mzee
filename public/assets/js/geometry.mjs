import { knotContours } from './knot-contours.mjs?v=20260923-4';

export function geometryPaths(openness = 0, breath = 0) {
  const amount = Math.max(0, Math.min(1, openness));
  const blend = amount * amount * (3 - 2 * amount);
  const scale = 1 + Math.max(-1, Math.min(1, breath)) * 0.055;
  const outline = points => `M${points.map(p=>p.map(v=>v.toFixed(3)).join(',')).join(' L')} Z`;
  const outer = knotContours[7].map(([x,y]) => {
    const angle = Math.atan2(y,x);
    const radius = 17 + 31 * ((1 - Math.cos(12 * angle)) / 2) ** 3;
    return [(Math.cos(angle)*radius*(1-blend)+x*blend)*scale,(Math.sin(angle)*radius*(1-blend)+y*blend)*scale];
  });
  const holes = knotContours.slice(0,7).map((contour,index) => {
    const center = contour.reduce((sum,p)=>sum.map((v,j)=>v+p[j]/contour.length),[0,0]);
    const angle = Math.atan2(center[1],center[0]);
    return contour.map(([x,y])=> {
      if(index===3){const radius=Math.hypot(x,y);return [x/radius*(3.8*(1-blend)+radius*blend)*scale,y/radius*(3.8*(1-blend)+radius*blend)*scale];}
      // Mask apertures open together; overlapping apertures remain transparent.
      const opening=blend**2;
      return [(Math.cos(angle)*7*(1-blend)+center[0]*blend+(x-center[0])*opening)*scale,(Math.sin(angle)*7*(1-blend)+center[1]*blend+(y-center[1])*opening)*scale];
    });
  });
  return { outer:outline(outer), holes:holes.map(outline), blend };
}
