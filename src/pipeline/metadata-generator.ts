import type { CartoonEpisode, SupportedLanguage, MetadataFile } from '../types';

// NO "kids", "children", "बच्चों" anywhere — prevents Made for Kids auto-flag

const TITLE_TEMPLATES: Record<SupportedLanguage, string[]> = {
  hi: [
    '{story} | {character} की कहानी | पंचतंत्र Ep {ep}',
    '{story} | हिंदी कार्टून कहानी | Katha Keeda',
    '{character} और {story} | नैतिक कहानी Ep {ep}',
  ],
  te: [
    '{story} | {character} కథ | పంచతంత్ర Ep {ep}',
    '{story} | తెలుగు కార్టూన్ | నీతి కథ | Katha Keeda',
    '{character} మరియు {story} | తెలుగు కార్టూన్ Ep {ep}',
  ],
  ta: [
    '{story} | {character} கதை | பஞ்சதந்திரம் Ep {ep}',
    '{story} | தமிழ் கார்ட்டூன் | நீதிக்கதை | Katha Keeda',
    '{character} மற்றும் {story} | தமிழ் கார்ட்டூன் Ep {ep}',
  ],
  kn: [
    '{story} | {character} ಕಥೆ | ಪಂಚತಂತ್ರ Ep {ep}',
    '{story} | ಕನ್ನಡ ಕಾರ್ಟೂನ್ | ನೀತಿ ಕಥೆ | Katha Keeda',
  ],
  mr: [
    '{story} | {character} ची गोष्ट | पंचतंत्र Ep {ep}',
    '{story} | मराठी कार्टून | नैतिक गोष्ट | Katha Keeda',
  ],
  bn: [
    '{story} | {character} গল্প | পঞ্চতন্ত্র Ep {ep}',
    '{story} | বাংলা কার্টুন | নীতিগল্প | Katha Keeda',
  ],
  en: [
    '{story} | {character} Story | Panchatantra Ep {ep}',
    '{story} | Animated Moral Tale | Katha Keeda',
    '{character} and {story} | Indian Folklore Ep {ep}',
  ],
};

const DESCRIPTION_TEMPLATES: Record<SupportedLanguage, string> = {
  hi: `🎬 {story}

{character} के साथ एक अनोखी पंचतंत्र कहानी!
इस कहानी में सीखें: {moral}

📺 हर Monday, Wednesday, Friday नई कहानी!
👉 Subscribe करें और Bell दबाएं!

अन्य भाषाओं में देखें:
తెలుగు • தமிழ் • ಕನ್ನಡ • मराठी • বাংলা • English

#KathaKeeda #पंचतंत्र #हिंदीकार्टून #नैतिककहानी #AnimatedStories #IndianCartoon #FamilyEntertainment

Katha Keeda — भारत की सबसे मज़ेदार कार्टून कहानियाँ! पंचतंत्र, जातक, हितोपदेश, तेनाली रामन, अकबर बीरबल — सब एनीमेशन में! परिवार के साथ देखें।`,

  te: `🎬 {story}

{character} తో ఒక అద్భుతమైన పంచతంత్ర కథ!
ఈ కథలో నేర్చుకోండి: {moral}

📺 ప్రతి Mon/Wed/Fri కొత్త కథ!
👉 Subscribe చేయండి!

#KathaKeeda #పంచతంత్రం #తెలుగుకార్టూన్ #నీతికథలు #AnimatedStories #IndianCartoon`,

  ta: `🎬 {story}

{character} உடன் ஒரு அற்புதமான பஞ்சதந்திரக் கதை!
இந்த கதையில் கற்றுக்கொள்ளுங்கள்: {moral}

📺 ஒவ்வொரு Mon/Wed/Fri புதிய கதை!

#KathaKeeda #பஞ்சதந்திரம் #தமிழ்கார்ட்டூன் #நீதிக்கதை #AnimatedStories #IndianCartoon`,

  kn: `🎬 {story}

{character} ಜೊತೆ ಒಂದು ಅದ್ಭುತ ಪಂಚತಂತ್ರ ಕಥೆ!
ಈ ಕಥೆಯಲ್ಲಿ ಕಲಿಯಿರಿ: {moral}

#KathaKeeda #ಪಂಚತಂತ್ರ #ಕನ್ನಡಕಾರ್ಟೂನ್ #ನೀತಿಕಥೆ #AnimatedStories`,

  mr: `🎬 {story}

{character} सोबत एक भारी पंचतंत्र गोष्ट!
या गोष्टीतून शिका: {moral}

#KathaKeeda #पंचतंत्र #मराठीकार्टून #नैतिकगोष्ट #AnimatedStories`,

  bn: `🎬 {story}

{character} এর সাথে একটি দুর্দান্ত পঞ্চতন্ত্র গল্প!
এই গল্পে শিখুন: {moral}

#KathaKeeda #পঞ্চতন্ত্র #বাংলাকার্টুন #নীতিগল্প #AnimatedStories`,

  en: `🎬 {story}

An amazing Panchatantra tale with {character}!
In this episode, learn: {moral}

📺 New story every Monday, Wednesday, Friday!
👉 Subscribe and hit the bell!

Watch in other languages:
हिंदी • తెలుగు • தமிழ் • ಕನ್ನಡ • मराठी • বাংলা

#KathaKeeda #Panchatantra #AnimatedStories #IndianCartoon #MoralTales #FamilyEntertainment #IndianFolklore

Katha Keeda — India's most entertaining animated stories! Panchatantra, Jataka, Hitopadesha, Tenali Raman, Akbar Birbal — all brought to life through animation. Watch with the whole family.`,
};

// Full 500-char tag budgets per language — NO "kids", "children", or equivalents
const TAG_TEMPLATES: Record<SupportedLanguage, string[]> = {
  hi: [
    'Katha Keeda', 'katha keeda hindi', 'पंचतंत्र की कहानी', 'panchatantra hindi',
    'हिंदी कार्टून', 'hindi cartoon', 'नैतिक कहानी', 'moral story hindi',
    'कार्टून कहानी', 'panchatantra tales', 'हिंदी एनीमेशन', 'hindi animation',
    'folk tales hindi', 'लोककथा', 'animated story hindi', 'भारतीय कार्टून',
    'hindi stories', 'bedtime story hindi', 'Indian cartoon hindi',
    'family entertainment india', 'panchatantra cartoon',
  ],
  te: [
    'Katha Keeda', 'katha keeda telugu', 'పంచతంత్ర కథలు', 'panchatantra telugu',
    'తెలుగు కార్టూన్', 'telugu cartoon', 'నీతి కథలు', 'moral stories telugu',
    'తెలుగు కథలు', 'telugu animation', 'animated stories telugu',
    'folk tales telugu', 'Indian cartoon telugu', 'family entertainment',
  ],
  ta: [
    'Katha Keeda', 'katha keeda tamil', 'பஞ்சதந்திரக் கதைகள்', 'panchatantra tamil',
    'தமிழ் கார்ட்டூன்', 'tamil cartoon', 'நீதிக்கதை', 'moral stories tamil',
    'animated stories tamil', 'Indian cartoon tamil', 'family entertainment',
  ],
  kn: [
    'Katha Keeda', 'ಪಂಚತಂತ್ರ ಕಥೆಗಳು', 'panchatantra kannada', 'ಕನ್ನಡ ಕಾರ್ಟೂನ್',
    'kannada cartoon', 'ನೀತಿ ಕಥೆ', 'moral stories kannada', 'animated stories kannada',
  ],
  mr: [
    'Katha Keeda', 'पंचतंत्र गोष्टी', 'panchatantra marathi', 'मराठी कार्टून',
    'marathi cartoon', 'नैतिक गोष्ट', 'moral stories marathi', 'animated stories marathi',
  ],
  bn: [
    'Katha Keeda', 'পঞ্চতন্ত্র গল্প', 'panchatantra bengali', 'বাংলা কার্টুন',
    'bangla cartoon', 'নীতিগল্প', 'moral stories bengali', 'animated stories bengali',
  ],
  en: [
    'Katha Keeda', 'panchatantra stories', 'moral stories', 'Indian cartoon',
    'animated stories', 'panchatantra tales english', 'Indian animation',
    'folk tales india', 'animated moral stories', 'family entertainment',
    'Indian folklore', 'bedtime stories animated', 'moral lessons',
    'ancient Indian tales', 'wisdom stories', 'values stories',
    'Indian animated series', 'life lessons cartoon', 'panchatantra animated',
  ],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateMetadata(
  episode: CartoonEpisode,
  language: SupportedLanguage,
  episodeNumber: number,
): MetadataFile {
  const templates = TITLE_TEMPLATES[language];
  const seed = simpleHash(episode.title + language + episodeNumber);
  const template = templates[seed % templates.length];

  const firstChar = episode.characters[0] ?? 'arjun';
  const characterName = firstChar.charAt(0).toUpperCase() + firstChar.slice(1);

  const title = template
    .replace('{story}', episode.title)
    .replace('{character}', characterName)
    .replace('{ep}', String(episodeNumber));

  const descTemplate = DESCRIPTION_TEMPLATES[language];
  const description = descTemplate
    .replace(/\{story\}/g, episode.title)
    .replace(/\{character\}/g, characterName)
    .replace(/\{moral\}/g, episode.moral.moralText);

  const baseTags = TAG_TEMPLATES[language];
  const storyTags = [episode.title, characterName, episode.moral.category, episode.storyType];
  const tags = [...baseTags, ...storyTags].filter(Boolean).slice(0, 30);

  return {
    title: title.slice(0, 100),
    description,
    tags,
    playlistTitle: `Katha Keeda — ${language.toUpperCase()}`,
    language,
    episodeNumber,
  };
}
