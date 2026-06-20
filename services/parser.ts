import { Movie } from '../types';

export const parseFilmAnalysis = (text: string): Movie[] => {
  console.log('Starting film analysis parsing...');
  
  // Clean markdown wrappers if present
  let cleanText = text.replace(/```(?:xml|html)?/gi, '').replace(/```/gi, '').trim();
  console.log('Cleaned text length:', cleanText.length);

  // Extract ONLY the XML section — cuts off any preamble or postamble Gemini adds
  const firstTag = cleanText.indexOf('<film_analysis>');
  const lastTagEnd = cleanText.lastIndexOf('</film_analysis>');
  if (firstTag !== -1 && lastTagEnd !== -1) {
    cleanText = cleanText.substring(firstTag, lastTagEnd + '</film_analysis>'.length);
    console.log('Extracted XML section, length:', cleanText.length);
  } else {
    console.warn('No <film_analysis> tags found in response! Raw snippet:', cleanText.substring(0, 500));
  }

  // Find all <film_analysis> blocks
  const analysisRegex = /<film_analysis>([\s\S]*?)<\/film_analysis>/gi;
  const matches = [...cleanText.matchAll(analysisRegex)];
  console.log(`Found ${matches.length} film_analysis blocks.`);
  
  const movies: Movie[] = [];

  for (const [index, match] of matches.entries()) {
    const blockContent = match[1];

    // Helper function to extract tags securely
    const getTagContent = (tagName: string, source: string = blockContent): string => {
      const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`, 'i');
      const tagMatch = source.match(regex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    const rank = getTagContent('rank');
    const titleBlock = getTagContent('title_block');
    const criticalOverview = getTagContent('critical_overview');
    const synopsis = getTagContent('synopsis');
    const artisticMerit = getTagContent('artistic_merit');
    const genreAnalysis = getTagContent('genre_analysis');
    const culturalImpact = getTagContent('cultural_impact');
    const keyThemesRaw = getTagContent('key_themes');
    const technicalElementsRaw = getTagContent('technical_elements');

    // Parse Title Block fields - handling internal tags or key-value pairs
    const getTitleField = (fieldName: string): string => {
      const tagContent = getTagContent(fieldName, titleBlock);
      if (tagContent) return tagContent;
      
      const lines = titleBlock.split('\n');
      const line = lines.find(l => l.toLowerCase().startsWith(`${fieldName.toLowerCase()}:`));
      return line ? line.split(':').slice(1).join(':').trim() : '';
    };

    const title = getTitleField('title');
    const year = getTitleField('year');
    const director = getTitleField('director');
    const classification = getTitleField('classification');
    const runtime = getTitleField('runtime');
    let image = getTitleField('image');
    let trailer = getTitleField('trailer');

    if (image.includes('found via Google Search') || image.includes('URL of')) {
      image = '';
    }

    // Handle trailer
    if (trailer && !trailer.startsWith('http')) {
      trailer = `https://www.youtube.com/results?search_query=${encodeURIComponent(trailer)}`;
    } else if (!trailer && title) {
      trailer = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;
    }

    // Parse list items
    const parseListItems = (raw: string): string[] => {
      if (!raw) return [];
      return raw
        .split(/\n|-|\*/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    };

    const keyThemes = parseListItems(keyThemesRaw);
    const technicalElements = parseListItems(technicalElementsRaw);

    if (title) {
      movies.push({
        rank,
        title,
        year,
        director,
        classification,
        runtime,
        image,
        trailer,
        criticalOverview,
        synopsis,
        artisticMerit,
        genreAnalysis,
        culturalImpact,
        keyThemes,
        technicalElements,
      });
      console.log(`Successfully parsed movie ${index + 1}: ${title}`);
    } else {
      console.warn(`Skipping block ${index + 1} due to missing title.`);
    }
  }

  return movies.sort((a, b) => {
    const rankA = parseInt(a.rank) || 999;
    const rankB = parseInt(b.rank) || 999;
    return rankA - rankB;
  });
};
