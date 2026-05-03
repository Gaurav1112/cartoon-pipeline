// scripts/print-cut-plan.ts
//
// M4.2: Prints the JSON cut plan for episode (1, 42). No render side
// effects — downstream tooling can pick the variant frame ranges and
// pass them to remotion render later. $0 cost vs spinning up a render.

import { generateEpisode } from '../src/story/story-engine';
import { planCuts } from '../src/cuts/cut-planner';

const episode = generateEpisode(1, 42);
const plans = planCuts(episode);
console.log(JSON.stringify(plans, null, 2));
