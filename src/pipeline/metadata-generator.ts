import type { CartoonEpisode, SupportedLanguage, MetadataFile } from '../types';

const TITLE_TEMPLATES: Record<SupportedLanguage, string[]> = {
  hi: [
    '{story} | {character} की कहानी | Guru Sishya',
    '{story} | पंचतंत्र की कहानी | Guru Sishya हिंदी',
    '{character} और {story} | Guru Sishya | नैतिक कहानियाँ',
  ],
  te: [
    '{story} | {character} కథ | Guru Sishya తెలుగు',
    '{story} | పంచతంత్ర కథలు | Guru Sishya',
    '{character} మరియు {story} | నీతి కథలు',
  ],
  ta: [
    '{story} | {character} கதை | Guru Sishya தமிழ்',
    '{story} | பஞ்சதந்திர கதைகள் | Guru Sishya',
    '{character} மற்றும் {story} | நீதி கதைகள்',
  ],
  kn: [
    '{story} | {character} ಕಥೆ | Guru Sishya ಕನ್ನಡ',
    '{story} | ಪಂಚತಂತ್ರ ಕಥೆಗಳು | Guru Sishya',
    '{character} ಮತ್ತು {story} | ನೀತಿ ಕಥೆಗಳು',
  ],
  mr: [
    '{story} | {character} ची गोष्ट | Guru Sishya मराठी',
    '{story} | पंचतंत्र गोष्टी | Guru Sishya',
    '{character} आणि {story} | नैतिक गोष्टी',
  ],
  bn: [
    '{story} | {character} এর গল্প | Guru Sishya বাংলা',
    '{story} | পঞ্চতন্ত্র গল্প | Guru Sishya',
    '{character} ও {story} | নীতি গল্প',
  ],
  en: [
    '{story} | {character} Story | Guru Sishya',
    '{story} | Panchatantra Tales | Guru Sishya English',
    '{character} and {story} | Moral Stories for Kids',
  ],
};

const DESCRIPTION_TEMPLATES: Record<SupportedLanguage, string> = {
  hi: '🎬 {story}\n\n{character} के साथ एक शानदार कहानी! इस episode में सीखें: {moral}\n\n👉 Subscribe करें: Guru Sishya हिंदी\n📺 हर Mon/Wed/Fri नई कहानी!\n\n#Guru Sishya #हिंदीकार्टून #पंचतंत्र #बच्चोंकीकहानी #MoralStories',
  te: '🎬 {story}\n\n{character} తో ఒక అద్భుతమైన కథ! ఈ episode లో నేర్చుకోండి: {moral}\n\n👉 Subscribe చేయండి: Guru Sishya తెలుగు\n📺 ప్రతి Mon/Wed/Fri కొత్త కథ!\n\n#GuruSishya #తెలుగుకార్టూన్ #పంచతంత్రం #పిల్లలకథలు',
  ta: '🎬 {story}\n\n{character} உடன் ஒரு அற்புதமான கதை! இந்த episode-ல் கற்றுக்கொள்ளுங்கள்: {moral}\n\n👉 Subscribe செய்யுங்கள்: Guru Sishya தமிழ்\n📺 ஒவ்வொரு Mon/Wed/Fri புதிய கதை!\n\n#GuruSishya #தமிழ்கார்ட்டூன் #பஞ்சதந்திரம்',
  kn: '🎬 {story}\n\n{character} ಜೊತೆ ಒಂದು ಅದ್ಭುತ ಕಥೆ! ಈ episode ನಲ್ಲಿ ಕಲಿಯಿರಿ: {moral}\n\n👉 Subscribe ಮಾಡಿ: Guru Sishya ಕನ್ನಡ\n\n#GuruSishya #ಕನ್ನಡಕಾರ್ಟೂನ್ #ನೀತಿಕಥೆಗಳು',
  mr: '🎬 {story}\n\n{character} सोबत एक भारी गोष्ट! या episode मध्ये शिका: {moral}\n\n👉 Subscribe करा: Guru Sishya मराठी\n\n#GuruSishya #मराठीकार्टून #पंचतंत्र',
  bn: '🎬 {story}\n\n{character} এর সাথে একটি দুর্দান্ত গল্প! এই episode এ শিখুন: {moral}\n\n👉 Subscribe করুন: Guru Sishya বাংলা\n\n#GuruSishya #বাংলাকার্টুন #পঞ্চতন্ত্র',
  en: '🎬 {story}\n\nAn amazing story with {character}! In this episode, learn: {moral}\n\n👉 Subscribe: Guru Sishya English\n📺 New story every Mon/Wed/Fri!\n\n#GuruSishya #MoralStories #PanchatantraTales #KidsCartoon #IndianCartoon',
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
    .replace('{character}', characterName);

  const descTemplate = DESCRIPTION_TEMPLATES[language];
  const description = descTemplate
    .replace(/\{story\}/g, episode.title)
    .replace(/\{character\}/g, characterName)
    .replace(/\{moral\}/g, episode.moral.moralText);

  const tags = [
    'Guru Sishya', 'moral stories', 'kids cartoon', 'Indian cartoon',
    'Panchatantra', episode.title, characterName,
    episode.moral.category, episode.storyType,
    language === 'hi' ? 'हिंदी कार्टून' : '',
    language === 'te' ? 'తెలుగు కార్టూన్' : '',
    language === 'ta' ? 'தமிழ் கார்ட்டூன்' : '',
    language === 'kn' ? 'ಕನ್ನಡ ಕಾರ್ಟೂನ್' : '',
    language === 'mr' ? 'मराठी कार्टून' : '',
    language === 'bn' ? 'বাংলা কার্টুন' : '',
  ].filter(Boolean);

  return {
    title,
    description,
    tags,
    playlistTitle: `${episode.seriesName} — ${language.toUpperCase()}`,
    language,
    episodeNumber,
  };
}
