import { toLocalDateStr } from '../utils/format';
// Realistic mock dataset for CineBook frontend

export const MOCK_CITIES = [
  { name: 'Mumbai', theatresCount: 18, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Delhi-NCR', theatresCount: 22, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bengaluru', theatresCount: 15, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hyderabad', theatresCount: 14, image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=600&auto=format&fit=crop&q=80' },
  { name: 'Chennai', theatresCount: 12, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80' },
  { name: 'Pune', theatresCount: 10, image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Kolkata', theatresCount: 9, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80' }
];

export const MOCK_MOVIES = [
  {
    _id: 'mov-1',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    duration: 166,
    releaseDate: '2024-03-01',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Hindi'],
    formats: ['IMAX 3D', '4DX', '2D'],
    certificate: 'UA',
    rating: 8.8,
    votesCount: 42100,
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', avatar: 'https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
      { name: 'Zendaya', role: 'Chani', avatar: 'https://image.tmdb.org/t/p/w185/tylFne4EaeE1JkYgvdcl1L96W8q.jpg' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', avatar: 'https://image.tmdb.org/t/p/w185/6NRdHcq4sqUdfG1k8pGZJbK1i6N.jpg' },
      { name: 'Austin Butler', role: 'Feyd-Rautha', avatar: 'https://image.tmdb.org/t/p/w185/2gGg42h9FfHlXnpt6W5G8kE76K0.jpg' }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'mov-2',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the profound moral dilemmas and political consequences that followed.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6K9vYQ79FGzNVmUFrNDl3z8YI.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    duration: 180,
    releaseDate: '2023-07-21',
    genre: ['Drama', 'Biography', 'History'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '2D'],
    certificate: 'A',
    rating: 8.9,
    votesCount: 65200,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', avatar: 'https://image.tmdb.org/t/p/w185/360RzNaCeBYkTa2ptklye9G2k4L.jpg' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', avatar: 'https://image.tmdb.org/t/p/w185/wV48FwA4bZJ5bJ2RkI1nK8vYQ9L.jpg' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', avatar: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lIwMBv5Bw.jpg' }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'mov-3',
    title: 'Spider-Man: Across the Spider-Verse',
    slug: 'spider-man-across-the-spider-verse',
    synopsis:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    duration: 140,
    releaseDate: '2023-06-02',
    genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    language: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['3D', 'IMAX 3D', '2D', '4DX'],
    certificate: 'U',
    rating: 8.7,
    votesCount: 38900,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales (voice)', avatar: 'https://image.tmdb.org/t/p/w185/9F2cZzUvKj8qOaKjV3a8K1j.jpg' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', avatar: 'https://image.tmdb.org/t/p/w185/k3j6rGqQv6Kj8qOaKjV3a8K1j.jpg' },
      { name: 'Oscar Isaac', role: 'Miguel O’Hara (voice)', avatar: 'https://image.tmdb.org/t/p/w185/c3j6rGqQv6Kj8qOaKjV3a8K1j.jpg' }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'mov-4',
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqzbmuQbv38HDONf8KVU9o.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    duration: 169,
    releaseDate: '2014-11-07',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '2D'],
    certificate: 'UA',
    rating: 8.7,
    votesCount: 78500,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', avatar: 'https://image.tmdb.org/t/p/w185/sY2mwpafcwqyYS1siiSuVsYseRw.jpg' },
      { name: 'Anne Hathaway', role: 'Brand', avatar: 'https://image.tmdb.org/t/p/w185/tL6IS5qvqq796qpKVx8P90956G7.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    _id: 'mov-5',
    title: 'Inception',
    slug: 'inception',
    synopsis:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    duration: 148,
    releaseDate: '2010-07-16',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '2D'],
    certificate: 'UA',
    rating: 8.8,
    votesCount: 84000,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb', avatar: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    _id: 'mov-6',
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    synopsis:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSPoY2A9P.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    duration: 152,
    releaseDate: '2008-07-18',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '2D'],
    certificate: 'UA',
    rating: 9.0,
    votesCount: 96000,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman', avatar: 'https://image.tmdb.org/t/p/w185/b7fTC9WFkgq6Ra77C.jpg' },
      { name: 'Heath Ledger', role: 'Joker', avatar: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jJ6pL1.jpg' }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'mov-7',
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    synopsis:
      'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos’ actions and restore balance to the universe.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zJW8ACSLxvg0f.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    duration: 181,
    releaseDate: '2019-04-26',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['IMAX 3D', '4DX', '3D', '2D'],
    certificate: 'UA',
    rating: 8.4,
    votesCount: 91000,
    director: 'Anthony & Joe Russo',
    cast: [
      { name: 'Robert Downey Jr.', role: 'Tony Stark', avatar: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lIwMBv5Bw.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    _id: 'mov-8',
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    synopsis:
      'Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical Emperors.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnEx7vAOragsqtO.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    duration: 148,
    releaseDate: '2024-11-15',
    genre: ['Action', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '4DX', '2D'],
    certificate: 'A',
    rating: 8.3,
    votesCount: 22400,
    director: 'Ridley Scott',
    cast: [
      { name: 'Paul Mescal', role: 'Lucius', avatar: 'https://image.tmdb.org/t/p/w185/kF2cZzUvKj8qOaKjV3a8K1j.jpg' }
    ],
    isFeatured: true,
    isActive: true
  }
];

export const MOCK_THEATRES = [
  {
    _id: 'th-1',
    name: 'PVR ICON Infinity Mall',
    city: 'Mumbai',
    address: 'Level 3, Infinity Mall, New Link Road, Andheri West',
    location: 'Andheri West, Mumbai',
    amenities: ['Dolby Atmos', '4K RGB Laser', 'VIP Recliners', 'Gourmet Food Court', 'Valet Parking'],
    screensCount: 4,
    isActive: true
  },
  {
    _id: 'th-2',
    name: 'INOX Megaplex Inorbit Mall',
    city: 'Mumbai',
    address: 'Inorbit Mall, Malad West, Link Road',
    location: 'Malad West, Mumbai',
    amenities: ['IMAX with Laser', 'MX4D', 'Dolby Atmos', 'INSIGNIA Lounge', 'Parking'],
    screensCount: 5,
    isActive: true
  },
  {
    _id: 'th-3',
    name: 'PVR Superplex Logix City Centre',
    city: 'Delhi-NCR',
    address: 'Logix City Centre, Sector 32',
    location: 'Noida, Delhi-NCR',
    amenities: ['IMAX', '4DX', 'Gold Class', 'Playhouse', 'Dolby Atmos'],
    screensCount: 5,
    isActive: true
  },
  {
    _id: 'th-4',
    name: 'Cinepolis DLF Avenue',
    city: 'Delhi-NCR',
    address: 'DLF Avenue, A4, Press Enclave Road, Saket',
    location: 'Saket, New Delhi',
    amenities: ['VIP Recliners', 'Dolby Atmos', 'Coffee Lounge', 'Free Wi-Fi'],
    screensCount: 4,
    isActive: true
  },
  {
    _id: 'th-5',
    name: 'PVR Forum Mall Koramangala',
    city: 'Bengaluru',
    address: 'The Forum Mall, Hosur Road, Koramangala',
    location: 'Koramangala, Bengaluru',
    amenities: ['IMAX Laser', 'Dolby Atmos 7.1', 'Gourmet Menu', 'Parking'],
    screensCount: 4,
    isActive: true
  },
  {
    _id: 'th-6',
    name: 'Prasads Multiplex',
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road',
    location: 'Necklace Road, Hyderabad',
    amenities: ['Large Format Screen', 'Dolby Atmos', 'Gaming Zone', 'Food Court'],
    screensCount: 5,
    isActive: true
  }
];

export const generateMockLayout = (occupiedList = ['C4', 'C5', 'D8']) => {
  const tiers = [
    { name: 'VIP', price: 450, rows: ['A', 'B'], seatsPerRow: 12 },
    { name: 'Premium', price: 280, rows: ['C', 'D', 'E', 'F'], seatsPerRow: 12 },
    { name: 'Classic', price: 180, rows: ['G', 'H', 'I', 'J'], seatsPerRow: 12 }
  ];
  const aisles = [3, 9];
  const occupiedSet = new Set(occupiedList.map((s) => s.toUpperCase()));

  return tiers.map((tierConfig) => {
    const rows = tierConfig.rows.map((rowChar) => {
      const seats = [];
      for (let i = 1; i <= tierConfig.seatsPerRow; i++) {
        const seatId = `${rowChar}${i}`;
        seats.push({
          seatId,
          row: rowChar,
          number: i,
          tier: tierConfig.name,
          price: tierConfig.price,
          status: occupiedSet.has(seatId) ? 'BOOKED' : 'AVAILABLE',
          isAisleAfter: aisles.includes(i)
        });
      }
      return { row: rowChar, tier: tierConfig.name, seats };
    });

    return {
      tierName: tierConfig.name,
      price: tierConfig.price,
      rows
    };
  });
};

export const MOCK_SHOWS = [
  {
    _id: 'sh-101',
    movieId: 'mov-1',
    movie: MOCK_MOVIES[0],
    theatreId: 'th-1',
    theatre: MOCK_THEATRES[0],
    screen: { _id: 'scr-1', name: 'Screen 1 - IMAX Laser', screenType: 'IMAX', totalSeats: 120 },
    showDate: toLocalDateStr(),
    showTime: '10:00 AM',
    format: 'IMAX 3D',
    language: 'English',
    pricing: { classic: 180, premium: 280, vip: 450 },
    occupiedSeats: ['A1', 'A2', 'C4', 'C5', 'D8'],
    layoutMatrix: generateMockLayout(['A1', 'A2', 'C4', 'C5', 'D8'])
  },
  {
    _id: 'sh-102',
    movieId: 'mov-1',
    movie: MOCK_MOVIES[0],
    theatreId: 'th-1',
    theatre: MOCK_THEATRES[0],
    screen: { _id: 'scr-1', name: 'Screen 1 - IMAX Laser', screenType: 'IMAX', totalSeats: 120 },
    showDate: toLocalDateStr(),
    showTime: '01:30 PM',
    format: 'IMAX 3D',
    language: 'English',
    pricing: { classic: 180, premium: 280, vip: 450 },
    occupiedSeats: ['B3', 'B4', 'E5'],
    layoutMatrix: generateMockLayout(['B3', 'B4', 'E5'])
  },
  {
    _id: 'sh-103',
    movieId: 'mov-1',
    movie: MOCK_MOVIES[0],
    theatreId: 'th-2',
    theatre: MOCK_THEATRES[1],
    screen: { _id: 'scr-2', name: 'Screen 2 - Atmos Gold', screenType: '4DX', totalSeats: 120 },
    showDate: toLocalDateStr(),
    showTime: '04:45 PM',
    format: '4DX',
    language: 'English',
    pricing: { classic: 180, premium: 280, vip: 450 },
    occupiedSeats: ['C1', 'C2', 'G4', 'G5'],
    layoutMatrix: generateMockLayout(['C1', 'C2', 'G4', 'G5'])
  },
  {
    _id: 'sh-104',
    movieId: 'mov-2',
    movie: MOCK_MOVIES[1],
    theatreId: 'th-1',
    theatre: MOCK_THEATRES[0],
    screen: { _id: 'scr-1', name: 'Screen 1 - IMAX Laser', screenType: 'IMAX', totalSeats: 120 },
    showDate: toLocalDateStr(),
    showTime: '08:00 PM',
    format: 'IMAX',
    language: 'English',
    pricing: { classic: 180, premium: 280, vip: 450 },
    occupiedSeats: ['A3', 'A4'],
    layoutMatrix: generateMockLayout(['A3', 'A4'])
  }
];
