export interface FooterVerse {
  text: string;
  reference: string;
}

// A small bundled set, distinct from the API-fetched verse in the main Bible Verse
// card, so the footer shows a different line even on days the network is down.
export const FOOTER_VERSES: readonly FooterVerse[] = [
  { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
  { text: 'For I know the plans I have for you, declares the Lord.', reference: 'Jeremiah 29:11' },
  { text: 'The joy of the Lord is your strength.', reference: 'Nehemiah 8:10' },
  { text: 'Come to me, all who labor and are heavy laden, and I will give you rest.', reference: 'Matthew 11:28' },
  { text: 'In all your ways acknowledge Him, and He will make straight your paths.', reference: 'Proverbs 3:6' },
  { text: 'The Lord is close to the brokenhearted.', reference: 'Psalm 34:18' },
  { text: 'Rejoice always, pray continually, give thanks in all circumstances.', reference: '1 Thessalonians 5:16-18' },
];
