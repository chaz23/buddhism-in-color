export default function SuttaPlex({
  sutta,
  collection,
  blurb,
  words,
  maxWords,
  difficulty,
}) {
  const wordsPerMinute = 160;
  const readTime = Math.ceil(words / wordsPerMinute);
  const maxReadTime = Math.ceil(maxWords / wordsPerMinute);

  const x = (
    <div class="grid grid-cols-12">
      <div class="col-span-1 bg-gray-500 h-12">{readTime}</div>
      <div class="col-span-8 bg-gray-500 h-12">{maxReadTime}</div>
      <div class="col-span-1 bg-gray-500 h-12">{difficulty}</div>
      <div class="col-span-1 bg-gray-500 h-12">{sutta}</div>
      <div class="col-span-8 bg-gray-500 h-12">{blurb}</div>
    </div>
  );
  return x;
}
