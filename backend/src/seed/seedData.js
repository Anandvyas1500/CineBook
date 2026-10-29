const moviesData = [
  {
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    duration: 166,
    releaseDate: new Date('2024-03-01'),
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
      { name: 'Austin Butler', role: 'Feyd-Rautha Harkonnen', avatar: 'https://image.tmdb.org/t/p/w185/2gGg42h9FfHlXnpt6W5G8kE76K0.jpg' }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the profound moral dilemmas and political consequences that followed.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6K9vYQ79FGzNVmUFrNDl3z8YI.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    genre: ['Drama', 'Biography', 'History'],
    language: ['English', 'Hindi'],
    formats: ['IMAX 70mm', '2D'],
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
    title: 'Spider-Man: Across the Spider-Verse',
    slug: 'spider-man-across-the-spider-verse',
    synopsis:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    duration: 140,
    releaseDate: new Date('2023-06-02'),
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
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqzbmuQbv38HDONf8KVU9o.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: ['English', 'Hindi'],
    formats: ['IMAX 70mm', '2D'],
    certificate: 'UA',
    rating: 8.7,
    votesCount: 78500,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', avatar: 'https://image.tmdb.org/t/p/w185/sY2mwpafcwqyYS1siiSuVsYseRw.jpg' },
      { name: 'Anne Hathaway', role: 'Brand', avatar: 'https://image.tmdb.org/t/p/w185/tL6IS5qvqq796qpKVx8P90956G7.jpg' },
      { name: 'Jessica Chastain', role: 'Murph', avatar: 'https://image.tmdb.org/t/p/w185/Arf08LkW1Q9b9m6M1G7.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Inception',
    slug: 'inception',
    synopsis:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    duration: 148,
    releaseDate: new Date('2010-07-16'),
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '2D'],
    certificate: 'UA',
    rating: 8.8,
    votesCount: 84000,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb', avatar: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur', avatar: 'https://image.tmdb.org/t/p/w185/dhv0K6uKjG.jpg' },
      { name: 'Elliot Page', role: 'Ariadne', avatar: 'https://image.tmdb.org/t/p/w185/e3j6rGqQv6.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    synopsis:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSPoY2A9P.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    duration: 152,
    releaseDate: new Date('2008-07-18'),
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
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    synopsis:
      'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos’ actions and restore balance to the universe.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zJW8ACSLxvg0f.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    duration: 181,
    releaseDate: new Date('2019-04-26'),
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['IMAX 3D', '4DX', '3D', '2D'],
    certificate: 'UA',
    rating: 8.4,
    votesCount: 91000,
    director: 'Anthony Russo, Joe Russo',
    cast: [
      { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man', avatar: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lIwMBv5Bw.jpg' },
      { name: 'Chris Evans', role: 'Steve Rogers / Captain America', avatar: 'https://image.tmdb.org/t/p/w185/3bOGNsHlrswhyW799I.jpg' }
    ],
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    synopsis:
      'Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnEx7vAOragsqtO.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    duration: 148,
    releaseDate: new Date('2024-11-15'),
    genre: ['Action', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    formats: ['IMAX', '4DX', '2D'],
    certificate: 'A',
    rating: 8.3,
    votesCount: 22400,
    director: 'Ridley Scott',
    cast: [
      { name: 'Paul Mescal', role: 'Lucius', avatar: 'https://image.tmdb.org/t/p/w185/kF2cZzUvKj8qOaKjV3a8K1j.jpg' },
      { name: 'Pedro Pascal', role: 'Marcus Acacius', avatar: 'https://image.tmdb.org/t/p/w185/9LXk8K2jY6m7bJkK1i6N.jpg' },
      { name: 'Denzel Washington', role: 'Macrinus', avatar: 'https://image.tmdb.org/t/p/w185/c3j6rGqQv6.jpg' }
    ],
    isFeatured: true,
    isActive: true
  }
];

const theatresData = [
  {
    name: 'PVR ICON Infinity Mall',
    city: 'Mumbai',
    address: 'Level 3, Infinity Mall, New Link Road, Andheri West',
    location: 'Andheri West, Mumbai',
    amenities: ['Dolby Atmos', '4K RGB Laser', 'VIP Recliners', 'Gourmet Food Court', 'Valet Parking'],
    screensCount: 4,
    isActive: true
  },
  {
    name: 'INOX Megaplex Inorbit Mall',
    city: 'Mumbai',
    address: 'Inorbit Mall, Malad West, Link Road',
    location: 'Malad West, Mumbai',
    amenities: ['IMAX with Laser', 'MX4D', 'Dolby Atmos', 'INSIGNIA Lounge', 'Parking'],
    screensCount: 5,
    isActive: true
  },
  {
    name: 'PVR Superplex Logix City Centre',
    city: 'Delhi-NCR',
    address: 'Logix City Centre, Sector 32',
    location: 'Noida, Delhi-NCR',
    amenities: ['IMAX', '4DX', 'Gold Class', 'Playhouse', 'Dolby Atmos'],
    screensCount: 5,
    isActive: true
  },
  {
    name: 'Cinepolis DLF Avenue',
    city: 'Delhi-NCR',
    address: 'DLF Avenue, A4, Press Enclave Road, Saket',
    location: 'Saket, New Delhi',
    amenities: ['VIP Recliners', 'Dolby Atmos', 'Coffee Lounge', 'Free Wi-Fi'],
    screensCount: 4,
    isActive: true
  },
  {
    name: 'PVR Forum Mall Koramangala',
    city: 'Bengaluru',
    address: 'The Forum Mall, Hosur Road, Koramangala',
    location: 'Koramangala, Bengaluru',
    amenities: ['IMAX Laser', 'Dolby Atmos 7.1', 'Gourmet Menu', 'Parking'],
    screensCount: 4,
    isActive: true
  },
  {
    name: 'Prasads Multiplex',
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road',
    location: 'Necklace Road, Hyderabad',
    amenities: ['Large Format Screen', 'Dolby Atmos', 'Gaming Zone', 'Food Court'],
    screensCount: 5,
    isActive: true
  },
  {
    name: 'Sathyam Cinemas',
    city: 'Chennai',
    address: '8, Thiru Vi Ka Road, Royapettah',
    location: 'Royapettah, Chennai',
    amenities: ['Dolby Atmos', '4K Laser', 'Recliner Seats', 'Food Court'],
    screensCount: 6,
    isActive: true
  },
  {
    name: 'PVR Grand Galada',
    city: 'Chennai',
    address: 'Grand Galada, GST Road, Pallavaram',
    location: 'Pallavaram, Chennai',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Gourmet Menu', 'Parking'],
    screensCount: 5,
    isActive: true
  },
  {
    name: 'Cinepolis Seasons Mall',
    city: 'Pune',
    address: 'Seasons Mall, Magarpatta City, Hadapsar',
    location: 'Magarpatta, Pune',
    amenities: ['Dolby Atmos', 'VIP Recliners', 'Coffee Lounge', 'Parking'],
    screensCount: 6,
    isActive: true
  },
  {
    name: 'PVR Phoenix Marketcity',
    city: 'Pune',
    address: 'Phoenix Marketcity, Viman Nagar',
    location: 'Viman Nagar, Pune',
    amenities: ['IMAX', 'Dolby Atmos', 'Gourmet Menu', 'Valet Parking'],
    screensCount: 7,
    isActive: true
  },
  {
    name: 'INOX South City Mall',
    city: 'Kolkata',
    address: 'South City Mall, Prince Anwar Shah Road, Jadavpur',
    location: 'Jadavpur, Kolkata',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Parking'],
    screensCount: 6,
    isActive: true
  }
];

module.exports = {
  moviesData,
  theatresData
};
